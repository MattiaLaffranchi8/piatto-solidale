import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { withAuth } from "@/lib/auth";
import { generateVoucherQR, hashCardCode } from "@/lib/voucher";
import { checkRateLimit } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVoucherIssued } from "@/lib/email";
import type { VoucherPayload } from "@/types";

const schema = z.object({
  beneficiary_id: z.string().uuid(),
  amount: z.number().int().min(100),
  expires_in_days: z.number().int().min(1).max(365).default(30),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`voucher:generate:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });
  }

  const auth = await withAuth(request, ["association"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { beneficiary_id, amount, expires_in_days } = parsed.data;
  const db = createAdminClient();

  // Verifica che il beneficiario appartenga all'associazione autenticata
  const { data: beneficiary } = await db
    .from("beneficiaries")
    .select("id, anonymous_code, remaining_budget, status, association_id")
    .eq("id", beneficiary_id)
    .single();

  if (!beneficiary || beneficiary.status !== "active") {
    return NextResponse.json({ error: "Beneficiario non trovato o inattivo" }, { status: 404 });
  }

  const { data: association } = await db
    .from("associations")
    .select("id")
    .eq("profile_id", auth.profile.id)
    .single();

  if (!association || beneficiary.association_id !== association.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  if (beneficiary.remaining_budget < amount) {
    return NextResponse.json({ error: "Budget insufficiente" }, { status: 422 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expires_in_days);

  const payload: VoucherPayload = {
    voucher_id: crypto.randomUUID(),
    beneficiary_code: beneficiary.anonymous_code,
    amount,
    expires_at: expiresAt.toISOString(),
    issued_at: new Date().toISOString(),
  };

  const qrContent = generateVoucherQR(payload);
  const codeHash = hashCardCode(qrContent);

  const { data: voucher, error } = await db
    .from("vouchers")
    .insert({
      id: payload.voucher_id,
      beneficiary_id,
      code_hash: codeHash,
      amount,
      status: "active",
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !voucher) {
    return NextResponse.json({ error: "Errore creazione voucher" }, { status: 500 });
  }

  // Genera QR come PNG base64
  const qrDataUrl = await QRCode.toDataURL(qrContent, { width: 300, margin: 2 });

  // Notifica associazione
  await sendVoucherIssued({
    to: auth.profile.email,
    beneficiaryCode: beneficiary.anonymous_code,
    amount,
    expiresAt: expiresAt.toLocaleDateString("it-IT"),
  });

  return NextResponse.json({
    voucher_id: voucher.id,
    qr_image: qrDataUrl,
    expires_at: expiresAt.toISOString(),
  });
}
