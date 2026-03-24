import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  status: z.enum(["active", "suspended", "expired"]).optional(),
  monthly_budget: z.number().int().min(1000).optional(),
});

async function verifyOwnership(profileId: string, beneficiaryId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("beneficiaries")
    .select("id, associations!inner(profile_id)")
    .eq("id", beneficiaryId)
    .single();

  const assoc = data?.associations;
  if (!assoc) return false;
  const profileIdValue = Array.isArray(assoc)
    ? (assoc[0] as { profile_id: string })?.profile_id
    : (assoc as unknown as { profile_id: string }).profile_id;
  return profileIdValue === profileId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["association"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const owned = await verifyOwnership(auth.profile.id, id);
  if (!owned) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const db = createAdminClient();
  const { data } = await db
    .from("beneficiaries")
    .select("*, vouchers(id, status, amount, issued_at, redeemed_at)")
    .eq("id", id)
    .single();

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["association"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const owned = await verifyOwnership(auth.profile.id, id);
  if (!owned) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("beneficiaries")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore aggiornamento" }, { status: 500 });

  return NextResponse.json(data);
}
