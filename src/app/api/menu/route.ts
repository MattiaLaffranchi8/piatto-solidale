import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  full_price: z.number().int().min(100),
  ethical_price: z.number().int().min(100),
});

async function getRestaurantId(userId: string) {
  const db = createAdminClient();
  const { data } = await db.from("restaurants").select("id").eq("profile_id", userId).single();
  return data?.id ?? null;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const restaurantId = await getRestaurantId(user.id);
  if (!restaurantId) return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });

  const db = createAdminClient();
  const { data, error } = await db
    .from("ethical_menus")
    .select("id, name, description, full_price, ethical_price, is_active, available_days")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const restaurantId = await getRestaurantId(user.id);
  if (!restaurantId) return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return NextResponse.json({ error: `Dati non validi — ${fields}` }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("ethical_menus")
    .insert({
      restaurant_id: restaurantId,
      name: parsed.data.name,
      description: parsed.data.description,
      full_price: parsed.data.full_price,
      ethical_price: parsed.data.ethical_price,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const restaurantId = await getRestaurantId(user.id);
  if (!restaurantId) return NextResponse.json({ error: "Ristorante non trovato" }, { status: 404 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID mancante" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db
    .from("ethical_menus")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
