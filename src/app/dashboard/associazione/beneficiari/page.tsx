import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/associazione", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/associazione/beneficiari", label: "Beneficiari", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="7" r="4"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg> },
  { href: "/dashboard/associazione/report", label: "Report", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 13V9M10 13V7M13 13v-3" strokeLinecap="round"/></svg> },
];

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-100 text-gray-600",
};

export default async function BeneficiariPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: association } = await db.from("associations").select("id").eq("profile_id", user.id).single();
  if (!association) redirect("/login");

  const { data: beneficiaries } = await db
    .from("beneficiaries")
    .select("id, anonymous_code, status, isee_bracket, monthly_budget, remaining_budget, expires_at")
    .eq("association_id", association.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="associazione" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl text-[var(--foreground)]">Beneficiari</h1>
            <Link href="/dashboard/associazione/beneficiari/nuovo" className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-sm font-medium btn-hover">
              + Nuovo
            </Link>
          </div>

          <div className="bg-white rounded-[var(--radius-lg)] shadow-ps-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                <tr>
                  <th className="text-left px-6 py-3">Codice</th>
                  <th className="text-left px-6 py-3">Stato</th>
                  <th className="text-left px-6 py-3">ISEE</th>
                  <th className="text-left px-6 py-3">Budget residuo</th>
                  <th className="text-left px-6 py-3">Scadenza</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(beneficiaries ?? []).map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--muted)]/50">
                    <td className="px-6 py-3 font-mono font-semibold">{b.anonymous_code}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[b.status] ?? ""}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">{b.isee_bracket.replace(/_/g, " ")}</td>
                    <td className="px-6 py-3 font-mono">
                      <span className={b.remaining_budget < b.monthly_budget * 0.2 ? "text-[var(--destructive)]" : "text-[var(--secondary)]"}>
                        {formatCurrency(b.remaining_budget)}
                      </span>
                      <span className="text-[var(--muted-foreground)]"> / {formatCurrency(b.monthly_budget)}</span>
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {new Date(b.expires_at).toLocaleDateString("it-IT")}
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/associazione/beneficiari/${b.id}`} className="text-[var(--primary)] text-xs hover:underline">
                        Dettaglio →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!beneficiaries || beneficiaries.length === 0) && (
              <div className="text-center py-16 text-[var(--muted-foreground)]">
                Nessun beneficiario.{" "}
                <Link href="/dashboard/associazione/beneficiari/nuovo" className="text-[var(--primary)] hover:underline">Aggiungi il primo</Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
