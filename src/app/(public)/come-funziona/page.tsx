import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { HowItWorks } from "@/components/landing/HowItWorks";
import Link from "next/link";

export const metadata = { title: "Come funziona — PiattoSolidale" };

export default function ComeFunzionaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-20">
          <h1 className="font-heading text-5xl text-[var(--foreground)] mb-6">Come funziona</h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-12 leading-relaxed">
            PiattoSolidale è una piattaforma che connette tre attori: chi dona, chi certifica i bisognosi e chi cucina.
            Il denaro viene trattenuto in modo sicuro da Stripe e distribuito ai ristoranti solo dopo che il pasto è stato effettivamente consumato.
          </p>
        </div>
        <HowItWorks />

        {/* Sicurezza e privacy */}
        <section className="py-20 px-4 bg-[var(--background)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl text-[var(--foreground)] mb-6">Sicurezza e privacy</h2>
            <ul className="space-y-4 text-[var(--muted-foreground)]">
              <li className="flex gap-3"><span className="text-[var(--secondary)] flex-shrink-0">✓</span> I dati personali dei beneficiari non vengono mai salvati nella piattaforma. Le associazioni lavorano con codici anonimi.</li>
              <li className="flex gap-3"><span className="text-[var(--secondary)] flex-shrink-0">✓</span> I voucher QR sono firmati con HMAC-SHA256 e non possono essere falsificati.</li>
              <li className="flex gap-3"><span className="text-[var(--secondary)] flex-shrink-0">✓</span> I pagamenti sono gestiti interamente da Stripe — la piattaforma non tocca mai i dati della carta.</li>
              <li className="flex gap-3"><span className="text-[var(--secondary)] flex-shrink-0">✓</span> I fondi vengono trasferiti ai ristoranti solo dopo la conferma del pasto, via Stripe Connect.</li>
            </ul>
          </div>
        </section>

        <div className="text-center py-16 bg-[var(--muted)]">
          <Link href="/dona" className="inline-block px-8 py-4 bg-[var(--primary)] text-white font-bold rounded-[var(--radius-md)] btn-hover">
            Inizia a donare
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
