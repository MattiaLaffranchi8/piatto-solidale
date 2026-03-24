"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatCurrency, estimateMealsFromCents } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PRESET_AMOUNTS = [500, 1000, 2500, 5000]; // centesimi

interface DonationFormProps {
  onSuccess?: () => void;
}

// Step 2: form carta (dentro <Elements>)
function PaymentStep({
  clientSecret,
  amount,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dona?success=1`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Pagamento non riuscito.");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-xl text-[var(--foreground)]">
          Pagamento
        </h3>
        <span className="text-sm font-semibold text-[var(--primary)]">
          {formatCurrency(amount)}
        </span>
      </div>

      <PaymentElement />

      {error && <p className="text-[var(--destructive)] text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-[var(--radius-md)] btn-hover disabled:opacity-50"
      >
        {loading ? "Conferma pagamento…" : `Paga ${formatCurrency(amount)}`}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-[var(--muted-foreground)] hover:underline"
      >
        ← Torna indietro
      </button>
    </form>
  );
}

// Step 1: scelta importo e opzioni
export function DonationForm({ onSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const effectiveAmount = customAmount
    ? Math.round(parseFloat(customAmount) * 100)
    : amount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (effectiveAmount < 500) {
      setError("Importo minimo €5");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount,
          is_anonymous: isAnonymous,
          is_recurring: isRecurring,
          donor_message: message || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Errore nel processare la donazione");
        return;
      }

      if (data.url) {
        // Donazione ricorrente → Stripe Checkout esterno
        window.location.href = data.url;
      } else if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-lg max-w-[520px] mx-auto text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-heading text-2xl text-[var(--foreground)] mb-2">
          Grazie!
        </h3>
        <p className="text-[var(--muted-foreground)]">
          Il tuo contributo vale circa{" "}
          <strong>{estimateMealsFromCents(effectiveAmount)} pasti</strong>.
        </p>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-lg max-w-[520px] mx-auto">
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, locale: "it" }}
        >
          <PaymentStep
            clientSecret={clientSecret}
            amount={effectiveAmount}
            onSuccess={() => {
              setSuccess(true);
              onSuccess?.();
            }}
            onBack={() => setClientSecret(null)}
          />
        </Elements>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-lg max-w-[520px] mx-auto"
    >
      <h2 className="font-heading text-2xl text-[var(--foreground)] mb-6">
        Fai una donazione
      </h2>

      {/* Chip importi */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PRESET_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => {
              setAmount(a);
              setCustomAmount("");
            }}
            className={`py-2 rounded-[var(--radius-md)] text-sm font-semibold border transition-all ${
              amount === a && !customAmount
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "border-[var(--border)] hover:border-[var(--primary)]"
            }`}
          >
            {formatCurrency(a)}
          </button>
        ))}
      </div>

      {/* Campo custom */}
      <div className="mb-4 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
          €
        </span>
        <input
          type="number"
          min="5"
          step="0.01"
          placeholder="Importo personalizzato"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount(0);
          }}
          className="w-full pl-7 pr-4 py-2 border border-[var(--border)] rounded-[var(--radius-md)] text-sm focus:border-[var(--primary)] outline-none"
        />
      </div>

      {/* Toggle anonimo / ricorrente */}
      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm">Dona in anonimo</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm">Donazione ricorrente mensile</span>
        </label>
      </div>

      {/* Messaggio opzionale */}
      <textarea
        placeholder="Messaggio opzionale (max 200 caratteri)"
        maxLength={200}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm mb-4 resize-none focus:border-[var(--primary)] outline-none"
      />

      {error && <p className="text-[var(--destructive)] text-sm mb-4">{error}</p>}

      {effectiveAmount >= 500 && (
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          ≈ {estimateMealsFromCents(effectiveAmount)} pasti
        </p>
      )}

      <button
        type="submit"
        disabled={loading || effectiveAmount < 500}
        className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-[var(--radius-md)] btn-hover shadow-ps-sm disabled:opacity-50"
      >
        {loading
          ? "Elaborazione…"
          : `Dona ${effectiveAmount >= 500 ? formatCurrency(effectiveAmount) : ""}`}
      </button>
    </form>
  );
}
