"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AssociazioneSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    fiscal_code: "",
    address: "",
    city: "",
    province: "",
    region: "",
    contact_email: "",
    contact_phone: "",
    description: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/association/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Errore nel salvataggio.");
      setLoading(false);
      return;
    }

    router.push("/dashboard/associazione");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-start justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-md">
        <h1 className="font-heading text-2xl mb-2">Completa il profilo associazione</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Inserisci i dati della tua associazione per accedere alla dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nome associazione *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Codice fiscale *</label>
            <input required value={form.fiscal_code} onChange={(e) => set("fiscal_code", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Indirizzo *</label>
            <input required value={form.address} onChange={(e) => set("address", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Città *</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Provincia *</label>
              <input required maxLength={2} value={form.province} onChange={(e) => set("province", e.target.value.toUpperCase())}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Regione *</label>
              <input required value={form.region} onChange={(e) => set("region", e.target.value)}
                className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email di contatto *</label>
            <input required type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Telefono</label>
            <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrizione</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none resize-none" />
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
