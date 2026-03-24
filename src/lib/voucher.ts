import crypto from "crypto";
import type { VoucherPayload } from "@/types";

// Letto lazily — i test possono settare l'env prima di invocare
function getSecret(): string {
  const s = process.env.VOUCHER_HMAC_SECRET;
  if (!s) throw new Error("VOUCHER_HMAC_SECRET non configurato");
  return s;
}

export function generateVoucherQR(payload: VoucherPayload): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", getSecret()).update(data).digest("hex");
  const encoded = Buffer.from(data).toString("base64url");
  return `${encoded}.${hmac}`;
}

export function validateVoucherQR(qrContent: string): VoucherPayload | null {
  const dotIndex = qrContent.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = qrContent.slice(0, dotIndex);
  const signature = qrContent.slice(dotIndex + 1);

  let data: string;
  try {
    data = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expectedHmac = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("hex");

  // Timing-safe comparison — previene timing attacks
  if (
    signature.length !== expectedHmac.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedHmac))
  ) {
    return null;
  }

  let payload: VoucherPayload;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }

  if (new Date(payload.expires_at) < new Date()) return null;

  return payload;
}

export function hashCardCode(cardCode: string): string {
  return crypto.createHmac("sha256", getSecret()).update(cardCode).digest("hex");
}
