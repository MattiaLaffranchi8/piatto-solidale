import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { formatCurrency } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/donatore", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/donatore/dona", label: "Dona", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C10 3 5 6.5 5 10.5a5 5 0 0010 0C15 6.5 10 3 10 3z"/></svg> },
  { href: "/dashboard/donatore/storico", label: "Storico", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3" strokeLinecap="round"/></svg> },
];

const statusColors: Record<string, string> = {
  completed: "text-green-600 bg-green-50",
  pending: "text-yellow-600 bg-yellow-50",
  failed: "text-red-600 bg-red-50",
  refunded: "text-gray-600 bg-gray-50",
};

export default async function StoricoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: donations } = await db
    .from("donations")
    .select("id, amount, status, created_at, is_anonymous, is_recurring, donor_message")
    .eq("donor_profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="donatore" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-8">Storico donazioni</h1>
          <div className="bg-white rounded-[var(--radius-lg)] shadow-ps-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3">Importo</th>
                  <th className="text-left px-6 py-3">Stato</th>
                  <th className="text-left px-6 py-3">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(donations ?? []).map((d) => (
                  <tr key={d.id} className="hover:bg-[var(--muted)]/50">
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {new Date(d.created_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3 font-mono font-semibold text-[var(--primary)]">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status] ?? ""}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {d.is_recurring ? "Mensile" : "Singola"}
                      {d.is_anonymous ? " · Anonima" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!donations || donations.length === 0) && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">Nessuna donazione.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
