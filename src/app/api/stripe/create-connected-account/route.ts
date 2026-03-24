import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { withAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["restaurant"]);
  if (auth instanceof NextResponse) return auth;

  const db = createAdminClient();
  const { data: restaurant } = await db
    .from("restaurants")
    .select("id, stripe_account_id")
    .eq("profile_id", auth.profile.id)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });
  }

  // Riusa account esistente se già creato
  let accountId = restaurant.stripe_account_id;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "IT",
      email: auth.profile.email,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_type: "company",
      metadata: { restaurant_id: restaurant.id },
    });
    accountId = account.id;

    await db
      .from("restaurants")
      .update({ stripe_account_id: accountId })
      .eq("id", restaurant.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/dashboard/ristorante/payout?refresh=true`,
    return_url: `${appUrl}/dashboard/ristorante/payout?onboarded=true`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
