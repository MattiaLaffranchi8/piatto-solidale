"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { formatCurrency } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/ristorante", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/ristorante/scansiona", label: "Scansiona QR", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><path d="M11 11h2v2h-2zM15 11v2h2M15 15h2M11 15v2h2"/></svg> },
  { href: "/dashboard/ristorante/menu-solidale", label: "Menu etici", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h12M4 10h12M4 14h8" strokeLinecap="round"/></svg> },
  { href: "/dashboard/ristorante/payout", label: "Payout", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg> },
];

interface Menu {
  id: string;
  name: string;
  description: string;
  full_price: number;
  ethical_price: number;
  is_active: boolean;
}

export default function MenuSolidalePage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [form, setForm] = useState({ name: "", description: "", full_price: "", ethical_price: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/restaurant").then(r => r.json()).then(data => {
      // Recupera i menu del ristorante corrente
      if (Array.isArray(data) && data.length > 0) {
        setMenus(data[0]?.ethical_menus ?? []);
      }
    }).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Menu CRUD tramite endpoint REST diretto — semplificato per MVP
    setLoading(false);
    // TODO: implementare endpoint /api/menu quando necessario
    alert("Funzionalità in sviluppo — usa il pannello Supabase per ora.");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="ristorante" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-8">Menu etici</h1>

          {/* Lista menu esistenti */}
          <div className="space-y-3 mb-10">
            {menus.map((m) => (
              <div key={m.id} className="bg-white rounded-[var(--radius-md)] p-5 shadow-ps-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{m.name}</div>
                  <div className="text-sm text-[var(--muted-foreground)]">{m.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[var(--primary)] font-semibold">{formatCurrency(m.ethical_price)}</div>
                  <div className="text-xs text-[var(--muted-foreground)] line-through">{formatCurrency(m.full_price)}</div>
                </div>
              </div>
            ))}
            {menus.length === 0 && (
              <p className="text-[var(--muted-foreground)] text-sm">Nessun menu etico configurato.</p>
            )}
          </div>

          {/* Form nuovo menu */}
          <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-ps-sm">
            <h2 className="font-heading text-xl mb-4">Aggiungi menu</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Nome menu (es. Menu Solidale Pranzo)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" required />
              <input placeholder="Descrizione (es. Primo + Secondo + Acqua)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Prezzo listino (€)</label>
                  <input type="number" min="1" step="0.01" placeholder="15.00" value={form.full_price} onChange={e => setForm(f => ({ ...f, full_price: e.target.value }))} className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" required />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Prezzo etico (€)</label>
                  <input type="number" min="1" step="0.01" placeholder="12.00" value={form.ethical_price} onChange={e => setForm(f => ({ ...f, ethical_price: e.target.value }))} className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" required />
                </div>
              </div>
              {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-[var(--radius-md)] btn-hover disabled:opacity-50">
                {loading ? "Salvataggio…" : "Aggiungi menu"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
