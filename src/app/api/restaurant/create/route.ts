import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(1).max(5),
  phone: z.string().optional(),
  cuisine_types: z.array(z.string()).default([]),
  solidarity_discount: z.number().int().min(5).max(100).default(20),
  max_daily_covers: z.number().int().min(1).default(10),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return NextResponse.json({ error: `Dati non validi — ${fields}` }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "restaurant") {
    return NextResponse.json({ error: "Ruolo non valido" }, { status: 403 });
  }

  const { data: existing } = await db.from("restaurants").select("id").eq("profile_id", user.id).single();
  if (existing) {
    return NextResponse.json({ error: "Ristorante già registrato" }, { status: 409 });
  }

  const { error } = await db.from("restaurants").insert({
    profile_id: user.id,
    name: parsed.data.name,
    address: parsed.data.address,
    city: parsed.data.city,
    province: parsed.data.province,
    phone: parsed.data.phone ?? null,
    cuisine_types: parsed.data.cuisine_types,
    solidarity_discount: parsed.data.solidarity_discount,
    max_daily_covers: parsed.data.max_daily_covers,
    is_active: true,
  });

  if (error) {
    console.error("Restaurant create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
