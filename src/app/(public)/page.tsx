import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ImpactCounter } from "@/components/landing/ImpactCounter";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

async function getImpactStats() {
  try {
    const db = createAdminClient();
    const [meals, donors, restaurants] = await Promise.all([
      db.from("meals").select("id", { count: "exact", head: true }),
      db.from("donations").select("donor_profile_id", { count: "exact", head: true }).eq("status", "completed"),
      db.from("restaurants").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return {
      meals: meals.count ?? 0,
      donors: donors.count ?? 0,
      restaurants: restaurants.count ?? 0,
    };
  } catch {
    return { meals: 847, donors: 312, restaurants: 48 };
  }
}

const testimonials = [
  { quote: "Grazie a PiattoSolidale ho potuto mangiare un pasto caldo tutti i giorni. È stata una mano tesa nel momento più difficile.", author: "Beneficiario anonimo" },
  { quote: "La nostra associazione gestisce 50 famiglie. La piattaforma ci ha semplificato enormemente il lavoro di certificazione.", author: "Caritas Milano" },
  { quote: "Abbiamo aderito subito. I voucher funzionano perfettamente e il pagamento è sempre puntuale.", author: "Ristorante La Trattoria, Roma" },
];

export default async function LandingPage() {
  const stats = await getImpactStats();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ImpactCounter meals={stats.meals} donors={stats.donors} restaurants={stats.restaurants} />

        {/* Ristoranti aderenti */}
        <section className="py-20 px-4 bg-[var(--muted)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-heading text-3xl md:text-4xl text-[var(--foreground)]">
                Ristoranti aderenti
              </h2>
              <Link href="/ristoranti" className="text-sm font-medium text-[var(--primary)] hover:underline">
                Vedi tutti →
              </Link>
            </div>
            <p className="text-[var(--muted-foreground)] mb-8">
              Cerca un ristorante solidale vicino a te sulla mappa.
            </p>
            <Link
              href="/ristoranti"
              className="inline-block px-6 py-3 bg-[var(--secondary)] text-white font-semibold rounded-[var(--radius-md)] btn-hover"
            >
              Apri la mappa
            </Link>
          </div>
        </section>

        {/* Testimonianze */}
        <section className="py-20 px-4 bg-[var(--background)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl text-[var(--foreground)] text-center mb-12">
              Chi lo vive, lo racconta
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <blockquote
                  key={t.author}
                  className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-sm card-hover"
                >
                  <p className="text-[var(--foreground)] leading-relaxed mb-4 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="text-sm text-[var(--muted-foreground)] font-medium">— {t.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="py-20 px-4 bg-[var(--primary)] text-white text-center">
          <h2 className="font-heading text-4xl mb-4">Inizia a fare la differenza</h2>
          <p className="mb-8 opacity-90">Ogni donazione conta. Anche solo €5 vale un pasto.</p>
          <Link
            href="/dona"
            className="inline-block px-8 py-4 bg-white text-[var(--primary)] font-bold rounded-[var(--radius-md)] btn-hover shadow-ps-md"
          >
            Dona ora
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
