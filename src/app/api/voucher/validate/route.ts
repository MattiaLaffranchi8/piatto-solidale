import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { validateVoucherQR, hashCardCode } from "@/lib/voucher";
import { checkRateLimit } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  qr_content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`voucher:validate:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Troppe richieste" }, { status: 429 });
  }

  const auth = await withAuth(request, ["restaurant"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = validateVoucherQR(parsed.data.qr_content);
  if (!payload) {
    return NextResponse.json({ error: "QR non valido o scaduto" }, { status: 422 });
  }

  const codeHash = hashCardCode(parsed.data.qr_content);
  const db = createAdminClient();

  const { data: voucher } = await db
    .from("vouchers")
    .select("id, status, amount, expires_at")
    .eq("code_hash", codeHash)
    .single();

  if (!voucher) {
    return NextResponse.json({ error: "Voucher non trovato" }, { status: 404 });
  }

  if (voucher.status !== "active") {
    return NextResponse.json(
      { error: `Voucher non utilizzabile (stato: ${voucher.status})` },
      { status: 422 }
    );
  }

  if (new Date(voucher.expires_at) < new Date()) {
    return NextResponse.json({ error: "Voucher scaduto" }, { status: 422 });
  }

  return NextResponse.json({
    voucher_id: voucher.id,
    amount: voucher.amount,
    beneficiary_code: payload.beneficiary_code,
    expires_at: voucher.expires_at,
  });
}
