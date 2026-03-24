"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { QRGenerator } from "@/components/voucher/QRGenerator";

const navItems = [
  { href: "/dashboard/associazione", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/associazione/beneficiari", label: "Beneficiari", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="7" r="4"/><path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg> },
  { href: "/dashboard/associazione/report", label: "Report", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 13V9M10 13V7M13 13v-3" strokeLinecap="round"/></svg> },
];

export default function NuovoBeneficiarioPage() {
  const router = useRouter();
  const [isee, setIsee] = useState("under_3000");
  const [budget, setBudget] = useState("6000");
  const [expiresDays, setExpiresDays] = useState("180");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    anonymous_code: string;
    id: string;
    expires_at: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/beneficiary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isee_bracket: isee,
        monthly_budget: parseInt(budget),
        expires_in_days: parseInt(expiresDays),
        notes: notes || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Errore");
    } else {
      setCreated(data);
    }
    setLoading(false);
  }

  if (created) {
    return (
      <div className="flex min-h-screen">
        <Sidebar items={navItems} role="associazione" />
        <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--muted)]">
          <div className="max-w-md mx-auto">
            <h1 className="font-heading text-3xl text-[var(--foreground)] mb-6">Beneficiario creato</h1>
            <p className="text-[var(--muted-foreground)] mb-6 text-sm">
              Conserva il QR code e consegnalo al beneficiario. Non verrà mostrato di nuovo.
            </p>
            <QRGenerator
              qrImageBase64=""
              voucherId={created.id}
              amount={parseInt(budget)}
              expiresAt={created.expires_at}
              beneficiaryCode={created.anonymous_code}
            />
            <button
              onClick={() => router.push("/dashboard/associazione/beneficiari")}
              className="mt-6 w-full py-3 border border-[var(--border)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--primary)] transition-colors"
            >
              Torna alla lista
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="associazione" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-lg mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-8">Nuovo beneficiario</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-sm space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Fascia ISEE</label>
              <select
                value={isee}
                onChange={(e) => setIsee(e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              >
                <option value="under_3000">Sotto €3.000</option>
                <option value="3000_6000">€3.000 – €6.000</option>
                <option value="6000_9000">€6.000 – €9.000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Budget mensile (centesimi)</label>
              <input
                type="number"
                min="1000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">€{(parseInt(budget) / 100).toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Validità (giorni)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Note interne (cifrate)</label>
              <textarea
                placeholder="Note riservate — non visibili al beneficiario"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm resize-none focus:border-[var(--primary)] outline-none"
              />
            </div>

            {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-[var(--radius-md)] btn-hover disabled:opacity-50"
            >
              {loading ? "Creazione…" : "Crea beneficiario"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
