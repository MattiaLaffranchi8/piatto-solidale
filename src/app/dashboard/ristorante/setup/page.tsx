"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RistoranteSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    cuisine_types: "",
    solidarity_discount: "20",
    max_daily_covers: "10",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/restaurant/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cuisine_types: form.cuisine_types.split(",").map((s) => s.trim()).filter(Boolean),
        solidarity_discount: parseInt(form.solidarity_discount, 10),
        max_daily_covers: parseInt(form.max_daily_covers, 10),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Errore nel salvataggio.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/ristorante");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-start justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-md">
        <h1 className="font-heading text-2xl mb-2">Configura il tuo ristorante</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Inserisci i dati del ristorante per accedere alla dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nome ristorante *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Indirizzo *</label>
            <input required value={form.address} onChange={(e) => set("address", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Città *</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Provincia *</label>
              <input required maxLength={2} value={form.province} onChange={(e) => set("province", e.target.value.toUpperCase())}
                placeholder="MI"
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Telefono</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tipo cucina (separati da virgola)</label>
            <input value={form.cuisine_types} onChange={(e) => set("cuisine_types", e.target.value)}
              placeholder="es. Italiana, Mediterranea"
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Sconto solidale (%)</label>
              <input type="number" min="5" max="100" value={form.solidarity_discount} onChange={(e) => set("solidarity_discount", e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Coperti max al giorno</label>
              <input type="number" min="1" value={form.max_daily_covers} onChange={(e) => set("max_daily_covers", e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
          </div>

          {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-[var(--radius-md)] btn-hover disabled:opacity-50">
            {loading ? "Salvataggio…" : "Salva e continua"}
          </button>
        </form>
      </div>
    </div>
  );
}
