import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency, estimateMealsFromCents } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/donatore", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/donatore/dona", label: "Dona", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C10 3 5 6.5 5 10.5a5 5 0 0010 0C15 6.5 10 3 10 3z"/></svg> },
  { href: "/dashboard/donatore/storico", label: "Storico", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3" strokeLinecap="round"/></svg> },
];

export default async function DonatoreDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const [donationsResult, profileResult] = await Promise.all([
    db.from("donations")
      .select("amount, status, created_at")
      .eq("donor_profile_id", user.id)
      .in("status", ["completed", "pending"])
      .order("created_at", { ascending: false })
      .limit(5),
    db.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const donations = donationsResult.data ?? [];
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalMeals = estimateMealsFromCents(totalDonated);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="donatore" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-2">
            Ciao, {profileResult.data?.full_name?.split(" ")[0] ?? "donatore"}!
          </h1>
          <p className="text-[var(--muted-foreground)] mb-8">Ecco il tuo impatto solidale.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard
              label="Donato totale"
              value={formatCurrency(totalDonated)}
              icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg>}
              iconColor="var(--primary)"
            />
            <StatCard
              label="Pasti finanziati"
              value={totalMeals.toString()}
              icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><ellipse cx="10" cy="14" rx="8" ry="4"/><ellipse cx="10" cy="10" rx="6" ry="5"/></svg>}
              iconColor="var(--secondary)"
            />
            <StatCard
              label="Donazioni"
              value={donations.length.toString()}
              icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.5 5.5H18l-4.5 4 1.7 5.5L10 13l-5.2 3 1.7-5.5L2 6.5h5.5z"/></svg>}
              iconColor="var(--accent-gold)"
            />
          </div>

          <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-ps-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl">Ultime donazioni</h2>
              <Link href="/dashboard/donatore/storico" className="text-sm text-[var(--primary)] hover:underline">Vedi tutte →</Link>
            </div>
            {donations.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[var(--muted-foreground)] mb-4">Non hai ancora fatto donazioni.</p>
                <Link href="/dashboard/donatore/dona" className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-sm font-medium">
                  Fai la prima donazione
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {donations.map((d, i) => (
                  <div key={i} className="py-3 flex justify-between items-center">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {new Date(d.created_at).toLocaleDateString("it-IT")}
                    </span>
                    <span className="font-mono font-semibold text-[var(--primary)]">{formatCurrency(d.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
