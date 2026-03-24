import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAnonymousCode } from "@/lib/utils";
import { hashCardCode } from "@/lib/voucher";
import { encrypt } from "@/lib/encryption";

const createSchema = z.object({
  isee_bracket: z.enum(["under_3000", "3000_6000", "6000_9000"]),
  monthly_budget: z.number().int().min(1000),
  expires_in_days: z.number().int().min(30).max(365),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ["association"]);
  if (auth instanceof NextResponse) return auth;

  const db = createAdminClient();
  const { data: association } = await db
    .from("associations")
    .select("id")
    .eq("profile_id", auth.profile.id)
    .single();

  if (!association) {
    return NextResponse.json({ error: "Associazione non trovata" }, { status: 404 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  let query = db
    .from("beneficiaries")
    .select("id, anonymous_code, status, isee_bracket, monthly_budget, remaining_budget, expires_at, last_used_at, created_at")
    .eq("association_id", association.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("anonymous_code", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Errore DB" }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["association"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { isee_bracket, monthly_budget, expires_in_days, notes } = parsed.data;
  const db = createAdminClient();

  const { data: association } = await db
    .from("associations")
    .select("id")
    .eq("profile_id", auth.profile.id)
    .single();

  if (!association) {
    return NextResponse.json({ error: "Associazione non trovata" }, { status: 404 });
  }

  const anonymousCode = generateAnonymousCode();
  const cardCode = crypto.randomUUID();
  const cardHash = hashCardCode(cardCode);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expires_in_days);

  const { data: beneficiary, error } = await db
    .from("beneficiaries")
    .insert({
      association_id: association.id,
      anonymous_code: anonymousCode,
      card_hash: cardHash,
      status: "active",
      isee_bracket,
      monthly_budget,
      remaining_budget: monthly_budget,
      notes_encrypted: notes ? encrypt(notes) : null,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, anonymous_code, status, isee_bracket, monthly_budget, remaining_budget, expires_at")
    .single();

  if (error || !beneficiary) {
    return NextResponse.json({ error: "Errore creazione beneficiario" }, { status: 500 });
  }

  return NextResponse.json({ ...beneficiary, card_code: cardCode }, { status: 201 });
}
