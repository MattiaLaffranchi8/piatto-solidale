"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const prefillEmail = searchParams.get("email") ?? "";
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email || prefillEmail,
      password,
    });

    if (loginError) {
      setError(loginError.message === "Invalid login credentials"
        ? "Email o password errati."
        : loginError.message);
      setLoading(false);
      return;
    }

    // Leggi il ruolo dal profilo per il redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role;
    if (role === "donor") router.push("/dashboard/donatore");
    else if (role === "association") router.push("/dashboard/associazione");
    else if (role === "restaurant") router.push("/dashboard/ristorante");
    else router.push("/");

    router.refresh();
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-md">
      <h2 className="font-heading text-2xl text-[var(--foreground)] mb-6">Accedi</h2>

      {registered && (
        <div className="mb-4 p-3 rounded-[var(--radius-md)] bg-green-50 border border-green-200 text-sm text-green-700">
          Account creato! Controlla la tua email per confermare, poi accedi qui.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          defaultValue={prefillEmail}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
        />

        {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-[var(--radius-md)] btn-hover disabled:opacity-50"
        >
          {loading ? "Accesso…" : "Accedi"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
        Non hai un account?{" "}
        <Link href="/register" className="text-[var(--primary)] hover:underline">Registrati</Link>
      </p>
    </div>
  );
}
