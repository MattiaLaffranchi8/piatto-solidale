import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  name: z.string().min(2).max(200),
  fiscal_code: z.string().min(2).max(20),
  address: z.string().min(3),
  city: z.string().min(2),
  province: z.string().min(1).max(5),
  region: z.string().min(2),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  description: z.string().optional(),
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

  // Verifica che il profilo sia un'associazione
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "association") {
    return NextResponse.json({ error: "Ruolo non valido" }, { status: 403 });
  }

  // Verifica che non esista già un'associazione per questo profilo
  const { data: existing } = await db.from("associations").select("id").eq("profile_id", user.id).single();
  if (existing) {
    return NextResponse.json({ error: "Associazione già registrata" }, { status: 409 });
  }

  const { error } = await db.from("associations").insert({
    profile_id: user.id,
    name: parsed.data.name,
    fiscal_code: parsed.data.fiscal_code,
    address: parsed.data.address,
    city: parsed.data.city,
    province: parsed.data.province,
    region: parsed.data.region,
    contact_email: parsed.data.contact_email,
    contact_phone: parsed.data.contact_phone ?? null,
    description: parsed.data.description ?? null,
    status: "pending",
  });

  if (error) {
    console.error("Association create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
