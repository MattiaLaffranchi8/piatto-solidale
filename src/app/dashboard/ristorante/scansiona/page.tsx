import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScannerClient } from "./_ScannerClient";

export default async function ScansionaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: restaurant } = await db
    .from("restaurants")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!restaurant) redirect("/login");

  const { data: menus } = await db
    .from("ethical_menus")
    .select("id, name, ethical_price")
    .eq("restaurant_id", restaurant.id)
    .eq("is_active", true);

  return <ScannerClient menus={menus ?? []} />;
}
