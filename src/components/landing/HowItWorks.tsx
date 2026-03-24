const steps = [
  {
    number: "1",
    color: "var(--primary)",
    title: "I donatori finanziano",
    description: "Privati e aziende caricano fondi sicuri tramite Stripe. Ogni euro è tracciato e va direttamente a chi ne ha bisogno.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8v4M16 20v4M10 16h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    number: "2",
    color: "var(--secondary)",
    title: "Le associazioni certificano",
    description: "Enti del terzo settore verificano i beneficiari e emettono voucher QR anonimi che proteggono la privacy.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 4 L28 10 V18 C28 24 22 29 16 30 C10 29 4 24 4 18 V10 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 16 L14.5 19.5 L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "3",
    color: "var(--accent-gold)",
    title: "I ristoranti accolgono",
    description: "Il ristoratore scansiona il QR, serve il pasto e riceve il pagamento automatico tramite Stripe Connect.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="16" cy="20" rx="12" ry="6" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="16" cy="18" rx="10" ry="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8 C16 8 10 10 10 14 L22 14 C22 10 16 8 16 8Z" fill="currentColor" opacity="0.3" />
        <path d="M14 4 L16 8 M18 4 L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-[var(--foreground)] mb-4">
            Come funziona
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Un sistema trasparente in tre passi che garantisce che ogni euro raggiunga la destinazione giusta.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="card-hover bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-sm border-l-4"
              style={{ borderColor: step.color }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <div style={{ color: step.color }}>{step.icon}</div>
              </div>
              <h3 className="font-heading text-xl text-[var(--foreground)] mb-3">{step.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
