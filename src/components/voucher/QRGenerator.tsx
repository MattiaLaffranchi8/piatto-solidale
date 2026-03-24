"use client";

interface QRGeneratorProps {
  qrImageBase64: string;
  voucherId: string;
  amount: number;
  expiresAt: string;
  beneficiaryCode: string;
}

export function QRGenerator({
  qrImageBase64,
  voucherId,
  amount,
  expiresAt,
  beneficiaryCode,
}: QRGeneratorProps) {
  function handleDownload() {
    const a = document.createElement("a");
    a.href = qrImageBase64;
    a.download = `voucher-${beneficiaryCode}.png`;
    a.click();
  }

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Voucher Solidale</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; }
        img { width: 220px; height: 220px; }
        .code { font-family: monospace; color: #666; margin: 8px 0 16px; }
        .row { display: flex; justify-content: space-between; max-width: 260px; margin: 6px auto; font-size: 14px; }
        .label { color: #888; }
        .footer { margin-top: 20px; font-size: 12px; color: #aaa; }
      </style></head><body>
      <h2 style="font-size:20px;margin-bottom:4px">Voucher Solidale</h2>
      <div class="code">${beneficiaryCode}</div>
      <img src="${qrImageBase64}" alt="QR" />
      <div style="margin-top:16px">
        <div class="row"><span class="label">Importo</span><strong>€${(amount / 100).toFixed(2)}</strong></div>
        <div class="row"><span class="label">Scade il</span><span>${new Date(expiresAt).toLocaleDateString("it-IT")}</span></div>
      </div>
      <p class="footer">Mostra questo QR al ristorante aderente per ottenere il pasto.</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-lg max-w-sm mx-auto text-center">
      <div className="font-heading text-xl text-[var(--foreground)] mb-2">Voucher Solidale</div>
      <div className="text-sm text-[var(--muted-foreground)] mb-6 font-mono">{beneficiaryCode}</div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrImageBase64} alt={`QR Code voucher ${voucherId}`} width={200} height={200} className="rounded-[var(--radius-sm)]" />
      </div>

      <div className="space-y-2 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Importo</span>
          <span className="font-mono font-semibold text-[var(--primary)]">
            €{(amount / 100).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">Scade il</span>
          <span className="font-mono text-xs">
            {new Date(expiresAt).toLocaleDateString("it-IT")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted-foreground)]">ID</span>
          <span className="font-mono text-xs truncate max-w-[140px]">{voucherId}</span>
        </div>
      </div>

      {/* Azioni consegna */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-[var(--radius-md)] text-sm font-medium btn-hover"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2v10M6 8l4 4 4-4M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          Scarica PNG
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-[var(--radius-md)] text-sm font-medium hover:border-[var(--primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 7V3h10v4M5 15H3a1 1 0 01-1-1V9a1 1 0 011-1h14a1 1 0 011 1v5a1 1 0 01-1 1h-2M5 11h10v6H5v-6z" strokeLinecap="round"/>
          </svg>
          Stampa
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Consegna questo QR alla persona — lo mostrerà al ristorante per il pasto.
      </p>
    </div>
  );
}
