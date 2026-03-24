import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { formatCurrency } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/ristorante", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/ristorante/scansiona", label: "Scansiona QR", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><path d="M11 11h2v2h-2zM15 11v2h2M15 15h2M11 15v2h2"/></svg> },
  { href: "/dashboard/ristorante/menu-solidale", label: "Menu etici", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h12M4 10h12M4 14h8" strokeLinecap="round"/></svg> },
  { href: "/dashboard/ristorante/payout", label: "Payout", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg> },
];

export default async function PayoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: restaurant } = await db.from("restaurants").select("id, stripe_onboarded, stripe_account_id").eq("profile_id", user.id).single();
  if (!restaurant) redirect("/login");

  const { data: meals } = await db
    .from("meals")
    .select("id, ethical_price, stripe_transfer_id, served_at")
    .eq("restaurant_id", restaurant.id)
    .order("served_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="ristorante" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-2">Payout</h1>
          {!restaurant.stripe_onboarded && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[var(--radius-md)] text-sm">
              <strong>Onboarding Stripe non completato.</strong>{" "}
              <button
                onClick={() => fetch("/api/stripe/create-connected-account", { method: "POST" }).then(r => r.json()).then(d => { if (d.url) window.location.href = d.url; })}
                className="text-[var(--primary)] underline"
              >
                Completa ora →
              </button>
            </div>
          )}
          <p className="text-[var(--muted-foreground)] mb-8">Storico trasferimenti Stripe per i pasti serviti.</p>
          <div className="bg-white rounded-[var(--radius-lg)] shadow-ps-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Importo</th>
                  <th className="text-left px-6 py-3">Transfer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(meals ?? []).map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--muted)]/50">
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {new Date(m.served_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3 font-mono font-semibold text-[var(--primary)]">
                      {formatCurrency(m.ethical_price)}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-[var(--muted-foreground)] truncate max-w-[200px]">
                      {m.stripe_transfer_id ?? "In elaborazione…"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!meals || meals.length === 0) && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">Nessun pasto servito.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
