import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DonationForm } from "@/components/donation/DonationForm";

const navItems = [
  { href: "/dashboard/donatore", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/donatore/dona", label: "Dona", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C10 3 5 6.5 5 10.5a5 5 0 0010 0C15 6.5 10 3 10 3z"/></svg> },
  { href: "/dashboard/donatore/storico", label: "Storico", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l3 3" strokeLinecap="round"/></svg> },
];

export default async function DonaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="donatore" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--muted)]">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-8">Dona ora</h1>
          <DonationForm />
        </div>
      </main>
    </div>
  );
}
