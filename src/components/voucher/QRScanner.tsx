"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "valid"; voucher_id: string; amount: number; beneficiary_code: string; expires_at: string }
  | { status: "error"; message: string }
  | { status: "redeemed"; transfer_id: string };

interface QRScannerProps {
  onRedeem: (voucherId: string, menuId: string) => Promise<{ transfer_id: string }>;
  availableMenus: { id: string; name: string; ethical_price: number }[];
}

export function QRScanner({ onRedeem, availableMenus }: QRScannerProps) {
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const [selectedMenu, setSelectedMenu] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrcodeRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("qr-scanner-region");
      html5QrcodeRef.current = qr;

      try {
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!mounted) return;
            await qr.stop();

            try {
              const res = await fetch("/api/voucher/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qr_content: decodedText }),
              });
              const data = await res.json();
              if (!res.ok) {
                setState({ status: "error", message: data.error ?? "QR non valido" });
              } else {
                setState({ status: "valid", ...data });
              }
            } catch {
              setState({ status: "error", message: "Errore di rete" });
            }
          },
          () => {} // onError ignorato — non loggare frame-level errors
        );
        if (mounted) setState({ status: "scanning" });
      } catch {
        if (mounted) setState({ status: "error", message: "Impossibile accedere alla fotocamera" });
      }
    }

    startScanner();

    return () => {
      mounted = false;
      const qr = html5QrcodeRef.current as { stop?: () => Promise<void> } | null;
      qr?.stop?.().catch(() => {});
    };
  }, []);

  async function handleRedeem() {
    if (state.status !== "valid" || !selectedMenu) return;
    setLoading(true);
    try {
      const result = await onRedeem(state.voucher_id, selectedMenu);
      setState({ status: "redeemed", transfer_id: result.transfer_id });
    } catch {
      setState({ status: "error", message: "Errore durante il riscatto" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Scanner area */}
      <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-black mb-6">
        <div id="qr-scanner-region" ref={scannerRef} className="w-full aspect-square" />
        {/* Corner marks overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-[250px] h-[250px]">
            {["top-0 left-0", "top-0 right-0 rotate-90", "bottom-0 right-0 rotate-180", "bottom-0 left-0 -rotate-90"].map((pos) => (
              <div key={pos} className={`absolute ${pos} w-8 h-8`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary)]" />
                <div className="absolute top-0 left-0 h-full w-1 bg-[var(--primary)]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stato */}
      <div className="text-center text-sm font-medium mb-6 text-[var(--muted-foreground)]">
        {state.status === "idle" && "Inizializzazione fotocamera…"}
        {state.status === "scanning" && "In attesa di scansione…"}
        {state.status === "error" && (
          <span className="text-[var(--destructive)]">{state.message}</span>
        )}
      </div>

      {/* Dettagli voucher valido */}
      {state.status === "valid" && (
        <div className="bg-white rounded-[var(--radius-lg)] p-6 shadow-ps-md">
          <div className="flex items-center gap-2 text-[var(--color-success)] mb-4">
            <span className="text-lg">✓</span>
            <span className="font-semibold">Voucher valido</span>
          </div>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Importo</span>
              <span className="font-mono font-bold text-[var(--primary)]">{formatCurrency(state.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Codice</span>
              <span className="font-mono">{state.beneficiary_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Scadenza</span>
              <span>{new Date(state.expires_at).toLocaleDateString("it-IT")}</span>
            </div>
          </div>

          <label className="block text-sm font-medium mb-2">Seleziona menu servito</label>
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            className="w-full border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-sm mb-4"
          >
            <option value="">— scegli —</option>
            {availableMenus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {formatCurrency(m.ethical_price)}
              </option>
            ))}
          </select>

          <button
            onClick={handleRedeem}
            disabled={!selectedMenu || loading}
            className="w-full bg-[var(--primary)] text-white font-semibold py-3 rounded-[var(--radius-md)] btn-hover disabled:opacity-50"
          >
            {loading ? "Elaborazione…" : "Conferma pasto servito"}
          </button>
        </div>
      )}

      {/* Successo riscatto */}
      {state.status === "redeemed" && (
        <div className="bg-[var(--secondary)] text-white rounded-[var(--radius-lg)] p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <div className="font-heading text-xl mb-2">Pasto confermato!</div>
          <div className="text-sm opacity-80">Il pagamento è in elaborazione.</div>
          <div className="font-mono text-xs mt-3 opacity-60 truncate">{state.transfer_id}</div>
        </div>
      )}
    </div>
  );
}
