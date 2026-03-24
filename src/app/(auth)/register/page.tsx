"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "donor", label: "Donatore", description: "Voglio finanziare pasti solidali" },
  { value: "association", label: "Associazione", description: "Gestiamo persone in difficoltà" },
  { value: "restaurant", label: "Ristorante", description: "Vogliamo aderire al programma" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("donor");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName, role },
      },
    });

    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-md text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="font-heading text-2xl mb-2">Controlla la tua email</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Abbiamo inviato un link di conferma a <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-md">
      <h2 className="font-heading text-2xl text-[var(--foreground)] mb-6">Crea account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
        />

        <div>
          <p className="text-sm font-medium mb-2">Sono un…</p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`p-3 rounded-[var(--radius-md)] border text-left transition-all ${
                  role === r.value
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="text-xs font-semibold">{r.label}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{r.description}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-[var(--radius-md)] btn-hover disabled:opacity-50"
        >
          {loading ? "Invio…" : "Crea account"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
        Hai già un account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">Accedi</Link>
      </p>
    </div>
  );
}
