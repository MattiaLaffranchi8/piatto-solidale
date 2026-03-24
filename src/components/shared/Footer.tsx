import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-heading text-xl mb-3">PiattoSolidale</p>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Connettere donatori, associazioni e ristoratori per garantire pasti dignitosi.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--muted-foreground)]">Piattaforma</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/come-funziona" className="hover:text-[var(--primary-light)] transition-colors">Come funziona</Link></li>
            <li><Link href="/ristoranti" className="hover:text-[var(--primary-light)] transition-colors">Ristoranti</Link></li>
            <li><Link href="/dona" className="hover:text-[var(--primary-light)] transition-colors">Dona ora</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--muted-foreground)]">Accesso</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-[var(--primary-light)] transition-colors">Accedi</Link></li>
            <li><Link href="/register" className="hover:text-[var(--primary-light)] transition-colors">Registrati</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-[var(--muted-foreground)]">Legale</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-[var(--primary-light)] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/termini" className="hover:text-[var(--primary-light)] transition-colors">Termini d&apos;uso</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} PiattoSolidale. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
