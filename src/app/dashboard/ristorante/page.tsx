import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StripeOnboardingButton } from "./payout/_StripeButton";

const navItems = [
  { href: "/dashboard/ristorante", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/ristorante/scansiona", label: "Scansiona QR", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><path d="M11 11h2v2h-2zM15 11v2h2M15 15h2M11 15v2h2"/></svg> },
  { href: "/dashboard/ristorante/menu-solidale", label: "Menu etici", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h12M4 10h12M4 14h8" strokeLinecap="round"/></svg> },
  { href: "/dashboard/ristorante/payout", label: "Payout", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg> },
];

export default async function RistoranteDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: restaurant } = await db.from("restaurants").select("id, name, total_meals_served, stripe_onboarded").eq("profile_id", user.id).single();

  if (!restaurant) redirect("/dashboard/ristorante/setup");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayMeals } = await db
    .from("meals")
    .select("ethical_price")
    .eq("restaurant_id", restaurant.id)
    .gte("served_at", today.toISOString());

  const todayTotal = (todayMeals ?? []).reduce((s, m) => s + m.ethical_price, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="ristorante" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-1">{restaurant.name}</h1>
          <p className="text-[var(--muted-foreground)] mb-8">Dashboard ristorante</p>

          {!restaurant.stripe_onboarded && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-[var(--radius-md)] text-sm">
              <strong>Completa l&apos;onboarding Stripe</strong> per ricevere i pagamenti.{" "}
              <StripeOnboardingButton />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard label="Pasti oggi" value={(todayMeals?.length ?? 0).toString()} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="14" rx="8" ry="4"/><ellipse cx="10" cy="10" rx="6" ry="5"/></svg>} iconColor="var(--primary)" />
            <StatCard label="Incasso oggi" value={formatCurrency(todayTotal)} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg>} iconColor="var(--secondary)" />
            <StatCard label="Pasti totali" value={restaurant.total_meals_served.toString()} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.5 5.5H18l-4.5 4 1.7 5.5L10 13l-5.2 3 1.7-5.5L2 6.5h5.5z"/></svg>} iconColor="var(--accent-gold)" />
          </div>

          <Link href="/dashboard/ristorante/scansiona" className="inline-block px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius-md)] btn-hover shadow-ps-sm">
            Scansiona QR voucher
          </Link>
        </div>
      </main>
    </div>
  );
}
