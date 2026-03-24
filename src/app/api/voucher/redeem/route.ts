import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { sendMealServed } from "@/lib/email";

const schema = z.object({
  voucher_id: z.string().uuid(),
  menu_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`voucher:redeem:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });
  }

  const auth = await withAuth(request, ["restaurant"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { voucher_id, menu_id } = parsed.data;
  const db = createAdminClient();

  // Recupera ristorante dell'utente autenticato
  const { data: restaurant } = await db
    .from("restaurants")
    .select("id, stripe_account_id, stripe_onboarded")
    .eq("profile_id", auth.profile.id)
    .single();

  if (!restaurant) {
    return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });
  }

  if (!restaurant.stripe_onboarded || !restaurant.stripe_account_id) {
    return NextResponse.json({ error: "Onboarding Stripe non completato" }, { status: 422 });
  }

  // Recupera voucher
  const { data: voucher } = await db
    .from("vouchers")
    .select("id, status, amount, beneficiary_id, expires_at")
    .eq("id", voucher_id)
    .single();

  if (!voucher) {
    return NextResponse.json({ error: "Voucher non trovato" }, { status: 404 });
  }

  if (voucher.status !== "active") {
    return NextResponse.json({ error: "Voucher non riscattabile" }, { status: 422 });
  }

  if (new Date(voucher.expires_at) < new Date()) {
    return NextResponse.json({ error: "Voucher scaduto" }, { status: 422 });
  }

  // Recupera menu etico
  const { data: menu } = await db
    .from("ethical_menus")
    .select("id, full_price, ethical_price, restaurant_id")
    .eq("id", menu_id)
    .single();

  if (!menu || menu.restaurant_id !== restaurant.id) {
    return NextResponse.json({ error: "Menu non valido" }, { status: 404 });
  }

  const now = new Date().toISOString();

  // Crea il record pasto
  const { data: meal, error: mealError } = await db
    .from("meals")
    .insert({
      voucher_id,
      restaurant_id: restaurant.id,
      menu_id,
      ethical_price: menu.ethical_price,
      full_price: menu.full_price,
      solidarity_saving: menu.full_price - menu.ethical_price,
    })
    .select()
    .single();

  if (mealError || !meal) {
    return NextResponse.json({ error: "Errore creazione pasto" }, { status: 500 });
  }

  // Aggiorna voucher → redeemed
  await db
    .from("vouchers")
    .update({
      status: "redeemed",
      restaurant_id: restaurant.id,
      menu_id,
      redeemed_at: now,
    })
    .eq("id", voucher_id);

  // Scala budget beneficiario
  await db.rpc("decrement_beneficiary_budget", {
    p_beneficiary_id: voucher.beneficiary_id,
    p_amount: voucher.amount,
    p_last_used_at: now,
  });

  // Incrementa counter pasti ristorante
  await db.rpc("increment_restaurant_meals", {
    p_restaurant_id: restaurant.id,
  });

  // Transfer Stripe → ristorante
  const transfer = await stripe.transfers.create({
    amount: menu.ethical_price,
    currency: "eur",
    destination: restaurant.stripe_account_id,
    transfer_group: voucher_id,
    metadata: {
      voucher_id,
      meal_id: meal.id,
      restaurant_id: restaurant.id,
    },
  });

  await db.from("meals").update({ stripe_transfer_id: transfer.id }).eq("id", meal.id);
  await db.from("vouchers").update({ stripe_transfer_id: transfer.id }).eq("id", voucher_id);

  // Notifica ristorante
  await sendMealServed({
    to: auth.profile.email,
    amount: menu.ethical_price,
    payoutPending: false,
  });

  return NextResponse.json({
    meal_id: meal.id,
    transfer_id: transfer.id,
    amount_transferred: menu.ethical_price,
  });
}
