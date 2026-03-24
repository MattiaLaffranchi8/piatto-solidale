import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDonationConfirmation, sendPayoutCompleted } from "@/lib/email";
import { estimateMealsFromCents } from "@/lib/utils";

// Necessario: leggi il body come raw per la verifica firma Stripe
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature mancante" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Signature non valida" }, { status: 400 });
  }

  const db = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const donationId = pi.metadata?.donation_id;
      if (!donationId) break;

      await db
        .from("donations")
        .update({ status: "completed", stripe_payment_intent: pi.id })
        .eq("id", donationId);

      // Recupera email donatore per la conferma
      const { data: donation } = await db
        .from("donations")
        .select("donor_profile_id, amount")
        .eq("id", donationId)
        .single();

      if (donation) {
        const { data: profile } = await db
          .from("profiles")
          .select("email")
          .eq("id", donation.donor_profile_id)
          .single();

        if (profile) {
          await sendDonationConfirmation({
            to: profile.email,
            amount: donation.amount,
            date: new Date().toLocaleDateString("it-IT"),
            mealsEquivalent: estimateMealsFromCents(donation.amount),
          });
        }
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object;
      if (account.charges_enabled && account.payouts_enabled) {
        await db
          .from("restaurants")
          .update({ stripe_onboarded: true })
          .eq("stripe_account_id", account.id);
      }
      break;
    }

    case "transfer.created": {
      const transfer = event.data.object;
      const mealId = transfer.metadata?.meal_id;
      if (!mealId) break;

      await db
        .from("meals")
        .update({ stripe_transfer_id: transfer.id })
        .eq("id", mealId);

      // Notifica ristorante
      const { data: meal } = await db
        .from("meals")
        .select("restaurant_id, ethical_price")
        .eq("id", mealId)
        .single();

      if (meal) {
        const { data: restaurant } = await db
          .from("restaurants")
          .select("profile_id")
          .eq("id", meal.restaurant_id)
          .single();

        if (restaurant) {
          const { data: profile } = await db
            .from("profiles")
            .select("email")
            .eq("id", restaurant.profile_id)
            .single();

          if (profile) {
            await sendPayoutCompleted({
              to: profile.email,
              amount: meal.ethical_price,
              transferId: transfer.id,
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
