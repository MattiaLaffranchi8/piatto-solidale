import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { withAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DonationMetadata } from "@/types/stripe";

const schema = z.object({
  amount: z.number().int().min(500), // min €5
  is_anonymous: z.boolean().default(false),
  is_recurring: z.boolean().default(false),
  donor_message: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`checkout:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });
  }

  const auth = await withAuth(request, ["donor"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { amount, is_anonymous, is_recurring, donor_message } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const metadata: DonationMetadata = {
    donor_profile_id: auth.profile.id,
    is_anonymous: is_anonymous ? "true" : "false",
    is_recurring: is_recurring ? "true" : "false",
    ...(donor_message ? { donor_message } : {}),
  };

  if (is_recurring) {
    // Crea prodotto + prezzo ricorrente
    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: "eur",
      recurring: { interval: "month" },
      product_data: { name: "Donazione Mensile PiattoSolidale" },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: metadata as unknown as Record<string, string>,
      success_url: `${appUrl}/dashboard/donatore?donated=true`,
      cancel_url: `${appUrl}/dashboard/donatore/dona`,
    });
    return NextResponse.json({ url: session.url });
  }

  // Donazione singola
  const db = createAdminClient();
  const { data: donation } = await db
    .from("donations")
    .insert({
      donor_profile_id: auth.profile.id,
      stripe_payment_intent: "pending",
      amount,
      fee_amount: 0,
      net_amount: amount,
      status: "pending",
      is_anonymous,
      is_recurring,
      donor_message: donor_message ?? null,
    })
    .select()
    .single();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    metadata: { ...metadata, donation_id: donation?.id ?? "" },
  });

  // Aggiorna il record con il vero payment intent ID
  if (donation) {
    await db
      .from("donations")
      .update({ stripe_payment_intent: paymentIntent.id })
      .eq("id", donation.id);
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
