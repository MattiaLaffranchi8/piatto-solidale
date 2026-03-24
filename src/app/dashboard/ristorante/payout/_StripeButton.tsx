"use client";

import { useState } from "react";

export function StripeOnboardingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-connected-account", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Errore sconosciuto");
        setLoading(false);
      }
    } catch {
      setError("Errore di rete");
      setLoading(false);
    }
  }

  return (
    <span>
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-[var(--primary)] underline disabled:opacity-50"
      >
        {loading ? "Caricamento…" : "Completa ora →"}
      </button>
      {error && <span className="ml-2 text-[var(--destructive)] text-xs">{error}</span>}
    </span>
  );
}
