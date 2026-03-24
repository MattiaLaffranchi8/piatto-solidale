import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Noise texture background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, var(--background) 0%, var(--muted) 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
        {/* Testo */}
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-6 animate-fade-up">
            Solidarietà a tavola
          </span>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl leading-tight text-[var(--foreground)] mb-6 animate-fade-up-1">
            Un pasto caldo per chi ne ha bisogno
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 max-w-md animate-fade-up-2">
            Connetti la tua generosità a chi ha fame. Ogni donazione diventa un voucher che porta dignità a tavola.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-up-3">
            <Link
              href="/dona"
              className="px-6 py-3 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius-md)] btn-hover shadow-ps-md"
            >
              Dona ora
            </Link>
            <Link
              href="/come-funziona"
              className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-semibold rounded-[var(--radius-md)] btn-hover hover:border-[var(--primary)]"
            >
              Scopri come funziona
            </Link>
          </div>
        </div>

        {/* Illustrazione */}
        <div className="hidden md:flex justify-center animate-fade-up-2">
          <div className="relative w-80 h-80">
            {/* Cerchi decorativi */}
            <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-10" />
            <div className="absolute inset-8 rounded-full bg-[var(--secondary)] opacity-15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none" aria-label="Piatto solidale">
                {/* Piatto */}
                <ellipse cx="90" cy="110" rx="70" ry="12" fill="var(--border)" />
                <ellipse cx="90" cy="100" rx="65" ry="45" fill="var(--muted)" />
                <ellipse cx="90" cy="90" rx="50" ry="35" fill="white" />
                {/* Cibo stilizzato */}
                <circle cx="80" cy="88" r="12" fill="var(--primary)" opacity="0.6" />
                <circle cx="100" cy="85" r="10" fill="var(--secondary)" opacity="0.6" />
                <circle cx="90" cy="97" r="8" fill="var(--accent-gold)" opacity="0.8" />
                {/* Cuore sopra */}
                <path d="M90 45 C90 45 75 32 70 40 C65 48 75 55 90 65 C105 55 115 48 110 40 C105 32 90 45 90 45Z"
                  fill="var(--primary)" opacity="0.85" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
