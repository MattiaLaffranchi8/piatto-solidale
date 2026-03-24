import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5),
  city: z.string().min(2),
  province: z.string().length(2),
  lat: z.number().optional(),
  lng: z.number().optional(),
  cuisine_types: z.array(z.string()).default([]),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  solidarity_discount: z.number().int().min(10).max(100).default(20),
  max_daily_covers: z.number().int().min(1).max(100).default(10),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const city = url.searchParams.get("city");
  const cuisine = url.searchParams.get("cuisine");

  const db = createAdminClient();
  let query = db
    .from("restaurants")
    .select("id, name, address, city, province, lat, lng, cuisine_types, image_url, solidarity_discount, avg_rating, total_meals_served, ethical_menus(id, name, ethical_price, full_price, available_days)")
    .eq("is_active", true)
    .order("total_meals_served", { ascending: false });

  if (city) query = query.ilike("city", `%${city}%`);
  if (cuisine) query = query.contains("cuisine_types", [cuisine]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Errore DB" }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(request, ["restaurant"]);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("restaurants")
    .insert({ ...parsed.data, profile_id: auth.profile.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore creazione ristorante" }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
