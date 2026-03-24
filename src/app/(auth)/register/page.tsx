"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "donor", label: "Donatore", description: "Voglio finanziare pasti solidali" },
  { value: "association", label: "Associazione", description: "Gestiamo persone in difficoltà" },
  { value: "restaurant", label: "Ristorante", description: "Vogliamo aderire al programma" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("donor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Se la conferma email è disabilitata, la sessione è già attiva
    if (data.session) {
      await supabase.from("profiles").upsert({
        id: data.user!.id,
        email,
        full_name: fullName,
        role,
      });
      if (role === "donor") router.push("/dashboard/donatore");
      else if (role === "association") router.push("/dashboard/associazione");
      else router.push("/dashboard/ristorante");
      return;
    }

    // Altrimenti: email di conferma inviata, il callback creerà il profilo
    router.push(`/login?registered=1&email=${encodeURIComponent(email)}`);
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
        <input
          type="password"
          required
          placeholder="Password (min. 8 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Registrazione…" : "Crea account"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
        Hai già un account?{" "}
        <Link href="/login" className="text-[var(--primary)] hover:underline">Accedi</Link>
      </p>
    </div>
  );
}
