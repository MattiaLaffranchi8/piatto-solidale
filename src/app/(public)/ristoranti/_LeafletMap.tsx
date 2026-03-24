"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icone marker rotte in webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "selected-marker",
});

interface EthicalMenu { id: string; name: string; ethical_price: number; }
interface Restaurant {
  id: string; name: string; address: string; city: string; province: string;
  lat: number | null; lng: number | null; cuisine_types: string[];
  solidarity_discount: number; avg_rating: number; ethical_menus: EthicalMenu[];
}

function FlyToSelected({ selected }: { selected: Restaurant | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected?.lat && selected?.lng) {
      map.flyTo([selected.lat, selected.lng], 14, { duration: 0.8 });
    }
  }, [selected, map]);
  return null;
}

export default function LeafletMap({
  restaurants,
  selected,
  onSelect,
}: {
  restaurants: Restaurant[];
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
}) {
  const withCoords = restaurants.filter((r) => r.lat && r.lng);

  return (
    <MapContainer
      center={[42.5, 12.5]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FlyToSelected selected={selected} />
      {withCoords.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat!, r.lng!]}
          icon={selected?.id === r.id ? selectedIcon : new L.Icon.Default()}
          eventHandlers={{ click: () => onSelect(r) }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <div className="font-semibold text-sm">{r.name}</div>
              <div className="text-xs text-gray-500">{r.city}</div>
              {r.ethical_menus.length > 0 && (
                <div className="text-xs text-orange-600 mt-1 font-medium">
                  Da €{(Math.min(...r.ethical_menus.map(m => m.ethical_price)) / 100).toFixed(2)}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
