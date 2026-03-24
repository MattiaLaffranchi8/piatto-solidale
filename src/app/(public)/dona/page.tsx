import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { DonationForm } from "@/components/donation/DonationForm";

export const metadata = { title: "Dona — PiattoSolidale" };

export default function DonaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 bg-[var(--muted)]">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading text-4xl text-center text-[var(--foreground)] mb-3">Fai la differenza</h1>
          <p className="text-center text-[var(--muted-foreground)] mb-10">
            Ogni euro che doni viene trasformato in un pasto caldo per qualcuno in difficoltà.
          </p>
          <DonationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
