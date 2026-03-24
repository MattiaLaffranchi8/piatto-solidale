import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().min(5).optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  solidarity_discount: z.number().int().min(10).max(100).optional(),
  max_daily_covers: z.number().int().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createAdminClient();
  const { data, error } = await db
    .from("restaurants")
    .select("*, ethical_menus(*)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return NextResponse.json({ error: "Non trovato" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(request, ["restaurant"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("restaurants")
    .update(parsed.data)
    .eq("id", id)
    .eq("profile_id", auth.profile.id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Non trovato o non autorizzato" }, { status: 404 });
  }

  return NextResponse.json(data);
}
