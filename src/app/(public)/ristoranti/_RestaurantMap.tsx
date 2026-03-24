"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

interface EthicalMenu {
  id: string;
  name: string;
  ethical_price: number;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  cuisine_types: string[];
  solidarity_discount: number;
  avg_rating: number;
  ethical_menus: EthicalMenu[];
}

const DEMO_RESTAURANTS: Restaurant[] = [
  { id: "1", name: "Trattoria da Maria", address: "Via Roma 12", city: "Milano", province: "MI", lat: 45.4642, lng: 9.1900, cuisine_types: ["italiana"], solidarity_discount: 50, avg_rating: 4.5, ethical_menus: [{ id: "m1", name: "Menù pranzo solidale", ethical_price: 650 }] },
  { id: "2", name: "Osteria del Sole", address: "Corso Vittorio 45", city: "Roma", province: "RM", lat: 41.9028, lng: 12.4964, cuisine_types: ["italiana", "vegetariana"], solidarity_discount: 40, avg_rating: 4.2, ethical_menus: [{ id: "m2", name: "Piatto del giorno", ethical_price: 700 }] },
  { id: "3", name: "Pizzeria Napoli Mia", address: "Via Toledo 88", city: "Napoli", province: "NA", lat: 40.8518, lng: 14.2681, cuisine_types: ["pizza"], solidarity_discount: 60, avg_rating: 4.8, ethical_menus: [{ id: "m3", name: "Pizza + bevanda", ethical_price: 550 }] },
  { id: "4", name: "Il Ristorantino", address: "Via Garibaldi 3", city: "Torino", province: "TO", lat: 45.0703, lng: 7.6869, cuisine_types: ["italiana"], solidarity_discount: 45, avg_rating: 4.0, ethical_menus: [{ id: "m4", name: "Menù completo", ethical_price: 800 }] },
  { id: "5", name: "La Cucina di Nonna", address: "Lungarno Corsini 2", city: "Firenze", province: "FI", lat: 43.7696, lng: 11.2558, cuisine_types: ["toscana"], solidarity_discount: 50, avg_rating: 4.6, ethical_menus: [{ id: "m5", name: "Piatto solidale", ethical_price: 600 }] },
  { id: "6", name: "Ristorante Aurora", address: "Via Maqueda 12", city: "Palermo", province: "PA", lat: 38.1157, lng: 13.3615, cuisine_types: ["siciliana"], solidarity_discount: 55, avg_rating: 4.3, ethical_menus: [{ id: "m6", name: "Menù tradizionale", ethical_price: 580 }] },
];

const LeafletMap = dynamic(() => import("./_LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-sm text-gray-500">Caricamento mappa…</div>
    </div>
  ),
});

export function RestaurantMap({ restaurants: dbRestaurants }: { restaurants: Restaurant[] }) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const restaurants = dbRestaurants.length > 0 ? dbRestaurants : DEMO_RESTAURANTS;
  const isDemo = dbRestaurants.length === 0;

  const cities = [...new Set(restaurants.map((r) => r.city))].sort();
  const filtered = restaurants.filter((r) => {
    if (selectedCity && r.city !== selectedCity) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !r.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row" style={{ height: "calc(100vh - 64px)" }}>
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="font-heading text-2xl text-[var(--foreground)] mb-3">Ristoranti aderenti</h1>
          <input
            type="text"
            placeholder="Cerca per nome o città…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm mb-2 focus:border-[var(--primary)] outline-none"
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm focus:border-[var(--primary)] outline-none bg-white"
          >
            <option value="">Tutte le città</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {isDemo && (
          <div className="mx-3 mt-3 p-2 rounded bg-amber-50 border border-amber-200 text-xs text-amber-700">
            Dati di esempio — aggiungi ristoranti reali dal pannello ristoratore.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              className={"w-full text-left p-3 rounded-[var(--radius-md)] border transition-all " +
                (selected?.id === r.id
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm text-[var(--foreground)] leading-snug">{r.name}</div>
                {r.avg_rating > 0 && (
                  <div className="text-xs text-amber-500 font-medium shrink-0">★ {r.avg_rating.toFixed(1)}</div>
                )}
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{r.city}</div>
              {r.ethical_menus.length > 0 && (
                <div className="mt-1.5 inline-block text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full">
                  Da €{(Math.min(...r.ethical_menus.map((m) => m.ethical_price)) / 100).toFixed(2)}
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)] text-center pt-8">Nessun ristorante trovato.</p>
          )}
        </div>

        <div className="p-3 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
          {filtered.length} ristorante{filtered.length !== 1 ? "i" : ""}
        </div>
      </aside>

      <div className="flex-1 relative">
        <LeafletMap restaurants={filtered} selected={selected} onSelect={setSelected} />

        {selected && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-[var(--radius-lg)] shadow-ps-lg p-4 z-[1000]">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-heading text-lg text-[var(--foreground)] leading-tight">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] ml-2 shrink-0 text-lg leading-none">✕</button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">{selected.address}, {selected.city} ({selected.province})</p>
            {selected.cuisine_types.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.cuisine_types.map((t) => (
                  <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">{t}</span>
                ))}
              </div>
            )}
            {selected.ethical_menus.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)] mb-1.5">Menù solidale</p>
                <div className="space-y-1">
                  {selected.ethical_menus.map((m) => (
                    <div key={m.id} className="flex justify-between text-xs">
                      <span className="text-[var(--muted-foreground)]">{m.name}</span>
                      <span className="font-semibold text-[var(--primary)]">€{(m.ethical_price / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
