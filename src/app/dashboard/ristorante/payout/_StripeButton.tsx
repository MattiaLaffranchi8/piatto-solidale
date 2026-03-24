"use client";

export function StripeOnboardingButton() {
  async function handleClick() {
    const res = await fetch("/api/stripe/create-connected-account", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <button onClick={handleClick} className="text-[var(--primary)] underline">
      Completa ora →
    </button>
  );
}
