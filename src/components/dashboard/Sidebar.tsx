"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  role: "donatore" | "associazione" | "ristorante";
}

export function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname();

  const roleLabels = {
    donatore: "Area Donatore",
    associazione: "Area Associazione",
    ristorante: "Area Ristorante",
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] min-h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex-shrink-0">
        <div className="p-6 border-b border-[var(--sidebar-border)]">
          <Link href="/" className="font-heading text-xl text-white">
            PiattoSolidale
          </Link>
          <p className="text-xs text-white/50 mt-1">{roleLabels[role]}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "text-white/70 hover:bg-[var(--sidebar-accent)] hover:text-white"
                }`}
              >
                <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--sidebar-border)]">
          <form action="/api/auth/signout" method="post">
            <button className="w-full text-left px-3 py-2 text-sm text-white/50 hover:text-white transition-colors">
              Esci
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar)] border-t border-[var(--sidebar-border)] flex">
        {items.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                active ? "text-[var(--primary-light)]" : "text-white/50"
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="truncate max-w-[60px] text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
