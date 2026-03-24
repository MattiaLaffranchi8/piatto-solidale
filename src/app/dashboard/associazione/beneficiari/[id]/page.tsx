import { redirect, notFound } from "next/navigation";
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

const statusLabel: Record<string, string> = {
  active: "Attivo",
  suspended: "Sospeso",
  expired: "Scaduto",
};

const voucherStatusLabel: Record<string, string> = {
  active: "Attivo",
  redeemed: "Riscattato",
  expired: "Scaduto",
  revoked: "Revocato",
};

const voucherStatusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  redeemed: "bg-blue-100 text-blue-700",
  expired: "bg-gray-100 text-gray-600",
  revoked: "bg-red-100 text-red-700",
};

export default async function BeneficiarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: association } = await db.from("associations").select("id").eq("profile_id", user.id).single();
  if (!association) redirect("/login");

  const { data: beneficiary } = await db
    .from("beneficiaries")
    .select("id, anonymous_code, status, isee_bracket, monthly_budget, remaining_budget, expires_at, last_used_at, created_at")
    .eq("id", id)
    .eq("association_id", association.id)
    .single();

  if (!beneficiary) notFound();

  const { data: vouchers } = await db
    .from("vouchers")
    .select("id, amount, status, issued_at, redeemed_at, expires_at")
    .eq("beneficiary_id", id)
    .order("issued_at", { ascending: false });

  const budgetPercent = Math.round((beneficiary.remaining_budget / beneficiary.monthly_budget) * 100);

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="associazione" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard/associazione/beneficiari" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm">
              ← Beneficiari
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-ps-sm mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-heading text-2xl text-[var(--foreground)] font-mono">{beneficiary.anonymous_code}</h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Registrato il {new Date(beneficiary.created_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[beneficiary.status] ?? ""}`}>
                {statusLabel[beneficiary.status] ?? beneficiary.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
              <div>
                <p className="text-[var(--muted-foreground)] text-xs mb-0.5">Fascia ISEE</p>
                <p className="font-medium">{beneficiary.isee_bracket.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-xs mb-0.5">Budget mensile</p>
                <p className="font-mono font-semibold">{formatCurrency(beneficiary.monthly_budget)}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-xs mb-0.5">Scadenza</p>
                <p className="font-medium">{new Date(beneficiary.expires_at).toLocaleDateString("it-IT")}</p>
              </div>
              <div>
                <p className="text-[var(--muted-foreground)] text-xs mb-0.5">Ultimo utilizzo</p>
                <p className="font-medium">
                  {beneficiary.last_used_at ? new Date(beneficiary.last_used_at).toLocaleDateString("it-IT") : "—"}
                </p>
              </div>
            </div>

            {/* Budget bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--muted-foreground)]">Budget residuo</span>
                <span className="font-mono font-semibold">
                  {formatCurrency(beneficiary.remaining_budget)} / {formatCurrency(beneficiary.monthly_budget)}
                </span>
              </div>
              <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgetPercent < 20 ? "bg-[var(--destructive)]" : "bg-[var(--secondary)]"}`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Voucher history */}
          <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-ps-sm">
            <h2 className="font-heading text-lg mb-4">Storico voucher</h2>
            {(!vouchers || vouchers.length === 0) ? (
              <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Nessun voucher emesso.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {vouchers.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono font-semibold">{formatCurrency(v.amount)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Emesso il {new Date(v.issued_at).toLocaleDateString("it-IT")}
                        {v.redeemed_at && ` · Usato il ${new Date(v.redeemed_at).toLocaleDateString("it-IT")}`}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${voucherStatusColor[v.status] ?? ""}`}>
                      {voucherStatusLabel[v.status] ?? v.status}
                    </span>
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
