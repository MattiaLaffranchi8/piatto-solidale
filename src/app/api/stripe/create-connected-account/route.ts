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

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  // Step 1: crea o recupera account Stripe
  let accountId = restaurant.stripe_account_id;
  if (!accountId) {
    try {
      const account = await stripe.accounts.create({ type: "express" });
      accountId = account.id;
      await db.from("restaurants").update({ stripe_account_id: accountId }).eq("id", restaurant.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore sconosciuto";
      return NextResponse.json({ error: `Errore creazione account Stripe: ${msg}` }, { status: 500 });
    }
  }

  // Step 2: crea account link per onboarding
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/ristorante/payout?refresh=true`,
      return_url: `${appUrl}/dashboard/ristorante/payout?onboarded=true`,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    return NextResponse.json({ error: `Errore link onboarding: ${msg} | appUrl: ${appUrl}` }, { status: 500 });
  }
}
