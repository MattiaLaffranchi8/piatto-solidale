import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import Link from "next/link";

const navItems = [
  { href: "/dashboard/associazione", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/associazione/beneficiari", label: "Beneficiari", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="7" r="4"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg> },
  { href: "/dashboard/associazione/report", label: "Report", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 13V9M10 13V7M13 13v-3" strokeLinecap="round"/></svg> },
];

export default async function AssociazioneDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: association } = await db.from("associations").select("id, name").eq("profile_id", user.id).single();

  if (!association) redirect("/login");

  const [benResult, voucherResult] = await Promise.all([
    db.from("beneficiaries").select("id, status", { count: "exact" }).eq("association_id", association.id).eq("status", "active"),
    db.from("vouchers").select("id, amount").eq("status", "redeemed").in("beneficiary_id",
      (await db.from("beneficiaries").select("id").eq("association_id", association.id)).data?.map(b => b.id) ?? []
    ),
  ]);

  const activeBeneficiaries = benResult.count ?? 0;
  const totalBudget = (voucherResult.data ?? []).reduce((s, v) => s + v.amount, 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="associazione" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-1">{association.name}</h1>
          <p className="text-[var(--muted-foreground)] mb-8">Dashboard associazione</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <StatCard label="Beneficiari attivi" value={activeBeneficiaries.toString()} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="7" r="4"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>} iconColor="var(--secondary)" />
            <StatCard label="Voucher riscattati" value={(voucherResult.data?.length ?? 0).toString()} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="6" width="16" height="10" rx="2"/><path d="M6 6V4a4 4 0 018 0v2"/></svg>} iconColor="var(--primary)" />
            <StatCard label="Budget distribuito" value={`€${(totalBudget / 100).toFixed(0)}`} icon={<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg>} iconColor="var(--accent-gold)" />
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard/associazione/beneficiari/nuovo" className="px-4 py-2 bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-sm font-medium btn-hover">
              + Nuovo beneficiario
            </Link>
            <Link href="/dashboard/associazione/beneficiari" className="px-4 py-2 border border-[var(--border)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--primary)] transition-colors">
              Gestisci beneficiari
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
