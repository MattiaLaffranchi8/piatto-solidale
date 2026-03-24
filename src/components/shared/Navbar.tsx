"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-ps-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-heading text-xl text-[var(--foreground)]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <circle cx="14" cy="14" r="13" stroke="var(--primary)" strokeWidth="2" />
            <path d="M7 14 Q14 6 21 14" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M9 17 Q14 12 19 17" stroke="var(--secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="14" cy="20" r="2" fill="var(--primary)" />
          </svg>
          PiattoSolidale
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/come-funziona" className="hover:text-[var(--foreground)] transition-colors">
            Come funziona
          </Link>
          <Link href="/ristoranti" className="hover:text-[var(--foreground)] transition-colors">
            Ristoranti
          </Link>
          <Link href="/dona" className="hover:text-[var(--foreground)] transition-colors">
            Dona ora
          </Link>
        </div>

        {/* CTA desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-[var(--muted-foreground)] truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-[var(--radius-md)] hover:border-red-400 hover:text-red-500 transition-colors"
              >
                Esci
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-[var(--radius-md)] hover:border-[var(--primary)] transition-colors"
              >
                Accedi
              </Link>
              <Link
                href="/dona"
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] btn-hover"
              >
                Dona
              </Link>
            </>
          )}
        </div>

        {/* Hamburger mobile */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
          <span className="block w-5 h-0.5 bg-current transition-all" />
        </button>
      </div>

      {/* Slide-in mobile */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-4 py-6 flex flex-col gap-4">
          <Link href="/come-funziona" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Come funziona</Link>
          <Link href="/ristoranti" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Ristoranti</Link>
          <Link href="/dona" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Dona ora</Link>
          <hr className="border-[var(--border)]" />
          {user ? (
            <>
              <span className="text-sm text-[var(--muted-foreground)]">{user.email}</span>
              <button onClick={handleLogout} className="text-sm font-medium text-red-500 text-left">
                Esci
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Accedi</Link>
              <Link
                href="/dona"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-center"
              >
                Dona ora
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
