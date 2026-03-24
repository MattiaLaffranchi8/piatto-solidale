"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { QRScanner } from "@/components/voucher/QRScanner";

const navItems = [
  { href: "/dashboard/ristorante", label: "Panoramica", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg> },
  { href: "/dashboard/ristorante/scansiona", label: "Scansiona QR", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><path d="M11 11h2v2h-2zM15 11v2h2M15 15h2M11 15v2h2"/></svg> },
  { href: "/dashboard/ristorante/menu-solidale", label: "Menu etici", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h12M4 10h12M4 14h8" strokeLinecap="round"/></svg> },
  { href: "/dashboard/ristorante/payout", label: "Payout", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-4h2v4zm0-6H9V5h2v2z"/></svg> },
];

interface Props {
  menus: { id: string; name: string; ethical_price: number }[];
}

export function ScannerClient({ menus }: Props) {
  async function handleRedeem(voucherId: string, menuId: string) {
    const res = await fetch("/api/voucher/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voucher_id: voucherId, menu_id: menuId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Errore riscatto");
    return data;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={navItems} role="ristorante" />
      <main className="flex-1 p-8 pb-20 md:pb-8 bg-[var(--background)]">
        <div className="max-w-md mx-auto">
          <h1 className="font-heading text-3xl text-[var(--foreground)] mb-8">Scansiona voucher</h1>
          <QRScanner onRedeem={handleRedeem} availableMenus={menus} />
        </div>
      </main>
    </div>
  );
}
