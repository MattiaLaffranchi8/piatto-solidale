import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { formatCurrency } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/associazione", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/associazione/beneficiari", label: "Beneficiari", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="7" r="4"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg> },
  { href: "/dashboard/associazione/report", label: "Report", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 13V9M10 13V7M13 13v-3" strokeLinecap="round"/></svg> },
];

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: association } = await db.from("associations").select("id, name").eq("profile_id", user.id).single();
  if (!association) redirect("/login");

  const { data: beneficiaries } = await db
    .from("beneficiaries")
    .select("id, anonymous_code, status, monthly_budget, remaining_budget, isee_bracket, expires_at")
    .eq("association_id", association.id)
    .order("created_at", { ascending: false });

  // CSV export header
  const csvRows = [
    ["Codice", "Stato", "ISEE", "Budget mensile", "Residuo", "Scadenza"],
    ...(beneficiaries ?? []).map((b) => [
      b.anonymous_code,
      b.status,
      b.isee_bracket,
      (b.monthly_budget / 100).toFixed(2),
      (b.remaining_budget / 100).toFixed(2),
      new Date(b.expires_at).toLocaleDateString("it-IT"),
    ]),
  ].map((row) => row.join(";")).join("\n");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="associazione" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl text-[var(--foreground)]">Report beneficiari</h1>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvRows)}`}
              download={`report-${association.name}-${new Date().toISOString().slice(0, 10)}.csv`}
              className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--primary)] transition-colors"
            >
              Esporta CSV
            </a>
          </div>

          {/* Riepilogo aggregato */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {["active", "suspended", "expired"].map((s) => {
              const count = (beneficiaries ?? []).filter(b => b.status === s).length;
              return (
                <div key={s} className="bg-white rounded-[var(--radius-md)] p-4 shadow-ps-sm text-center">
                  <div className="font-heading text-2xl">{count}</div>
                  <div className="text-xs text-[var(--muted-foreground)] capitalize">{s}</div>
                </div>
              );
            })}
            <div className="bg-white rounded-[var(--radius-md)] p-4 shadow-ps-sm text-center">
              <div className="font-heading text-2xl">
                {formatCurrency((beneficiaries ?? []).reduce((s, b) => s + b.monthly_budget, 0))}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">Budget totale/mese</div>
            </div>
          </div>

          <div className="bg-white rounded-[var(--radius-lg)] shadow-ps-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="text-left px-6 py-3">Codice</th>
                  <th className="text-left px-6 py-3">ISEE</th>
                  <th className="text-left px-6 py-3">Budget</th>
                  <th className="text-left px-6 py-3">Residuo</th>
                  <th className="text-left px-6 py-3">Scadenza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(beneficiaries ?? []).map((b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-3 font-mono">{b.anonymous_code}</td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">{b.isee_bracket.replace(/_/g, " ")}</td>
                    <td className="px-6 py-3 font-mono">{formatCurrency(b.monthly_budget)}</td>
                    <td className="px-6 py-3 font-mono">{formatCurrency(b.remaining_budget)}</td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">{new Date(b.expires_at).toLocaleDateString("it-IT")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
