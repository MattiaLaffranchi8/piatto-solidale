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
  return (
    <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-ps-lg max-w-sm mx-auto text-center">
      <div className="font-heading text-xl text-[var(--foreground)] mb-2">Voucher Solidale</div>
      <div className="text-sm text-[var(--muted-foreground)] mb-6 font-mono">{beneficiaryCode}</div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrImageBase64} alt={`QR Code voucher ${voucherId}`} width={200} height={200} className="rounded-[var(--radius-sm)]" />
      </div>

      <div className="space-y-2 text-sm">
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

      <p className="mt-6 text-xs text-[var(--muted-foreground)]">
        Mostra questo QR al ristorante aderente per ottenere il pasto.
      </p>
    </div>
  );
}
