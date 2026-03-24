"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Import Leaflet solo client-side — non funziona SSR
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

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
  ethical_menus: { id: string; name: string; ethical_price: number }[];
}

export function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const cities = [...new Set(restaurants.map((r) => r.city))].sort();
  const filtered = restaurants.filter((r) => {
    if (selectedCity && r.city !== selectedCity) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const withCoords = filtered.filter((r) => r.lat && r.lng);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
      {/* Sidebar filtri */}
      <aside className="md:w-80 flex-shrink-0 bg-white border-r border-[var(--border)] overflow-y-auto p-4">
        <h1 className="font-heading text-2xl text-[var(--foreground)] mb-4">Ristoranti</h1>

        <input
          type="text"
          placeholder="Cerca per nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm mb-3 focus:border-[var(--primary)] outline-none"
        />

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm mb-4 focus:border-[var(--primary)] outline-none"
        >
          <option value="">Tutte le città</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors cursor-pointer">
              <div className="font-semibold text-sm text-[var(--foreground)]">{r.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{r.address}, {r.city}</div>
              {r.ethical_menus.length > 0 && (
                <div className="mt-1 text-xs text-[var(--primary)]">
                  Da €{(Math.min(...r.ethical_menus.map(m => m.ethical_price)) / 100).toFixed(2)}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">Nessun ristorante trovato.</p>
          )}
        </div>
      </aside>

      {/* Mappa */}
      <div className="flex-1 relative">
        <MapContainer
          center={[41.9028, 12.4964]}
          zoom={6}
          className="h-full w-full"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {withCoords.map((r) => (
            <Marker key={r.id} position={[r.lat!, r.lng!]}>
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{r.address}</div>
                  {r.ethical_menus.slice(0, 2).map((m) => (
                    <div key={m.id} className="text-xs">
                      {m.name} — €{(m.ethical_price / 100).toFixed(2)}
                    </div>
                  ))}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
