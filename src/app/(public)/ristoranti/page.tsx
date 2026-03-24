import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { RestaurantMap } from "./_RestaurantMap";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Ristoranti aderenti — PiattoSolidale" };

async function getRestaurants() {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("restaurants")
      .select("id, name, address, city, province, lat, lng, cuisine_types, image_url, solidarity_discount, avg_rating, ethical_menus(id, name, ethical_price)")
      .eq("is_active", true)
      .order("total_meals_served", { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function RistorantiPage() {
  const restaurants = await getRestaurants();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <RestaurantMap restaurants={restaurants} />
      </main>
      <Footer />
    </div>
  );
}
