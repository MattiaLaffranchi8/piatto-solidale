import { describe, it, expect, beforeAll } from "vitest";
import { generateVoucherQR, validateVoucherQR, hashCardCode } from "./voucher";
import type { VoucherPayload } from "@/types";

beforeAll(() => {
  process.env.VOUCHER_HMAC_SECRET = "test-secret-for-unit-tests-only-not-production";
});

const validPayload: VoucherPayload = {
  voucher_id: "11111111-1111-1111-1111-111111111111",
  beneficiary_code: "BEN-ABC123",
  amount: 1200,
  expires_at: new Date(Date.now() + 86400 * 1000 * 30).toISOString(),
  issued_at: new Date().toISOString(),
};

describe("generateVoucherQR", () => {
  it("restituisce una stringa con un punto separatore", () => {
    const qr = generateVoucherQR(validPayload);
    expect(qr).toContain(".");
    const parts = qr.split(".");
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });

  it("genera QR differenti per payload differenti", () => {
    const qr1 = generateVoucherQR(validPayload);
    const qr2 = generateVoucherQR({ ...validPayload, voucher_id: "22222222-2222-2222-2222-222222222222" });
    expect(qr1).not.toBe(qr2);
  });
});

describe("validateVoucherQR", () => {
  it("valida un QR generato correttamente", () => {
    const qr = generateVoucherQR(validPayload);
    const result = validateVoucherQR(qr);
    expect(result).not.toBeNull();
    expect(result?.voucher_id).toBe(validPayload.voucher_id);
    expect(result?.beneficiary_code).toBe(validPayload.beneficiary_code);
    expect(result?.amount).toBe(validPayload.amount);
  });

  it("restituisce null per una firma invalida", () => {
    const qr = generateVoucherQR(validPayload);
    const tampered = qr.slice(0, -4) + "0000";
    expect(validateVoucherQR(tampered)).toBeNull();
  });

  it("restituisce null per un QR senza punto separatore", () => {
    expect(validateVoucherQR("invalidqrwithoutdot")).toBeNull();
  });

  it("restituisce null per payload malformato (JSON non valido)", () => {
    const badEncoded = Buffer.from("{not json}").toString("base64url");
    // firma qualsiasi — sarà comunque invalida
    expect(validateVoucherQR(`${badEncoded}.invalidsignature`)).toBeNull();
  });

  it("restituisce null se il voucher è scaduto", () => {
    const expired: VoucherPayload = {
      ...validPayload,
      expires_at: new Date(Date.now() - 1000).toISOString(),
    };
    const qr = generateVoucherQR(expired);
    const result = validateVoucherQR(qr);
    expect(result).toBeNull();
  });
});

describe("hashCardCode", () => {
  it("restituisce un hash esadecimale di 64 caratteri (SHA-256)", () => {
    const hash = hashCardCode("some-card-code");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("lo stesso input produce sempre lo stesso hash", () => {
    const code = "BEN-XYZ789";
    expect(hashCardCode(code)).toBe(hashCardCode(code));
  });

  it("input diversi producono hash diversi", () => {
    expect(hashCardCode("code1")).not.toBe(hashCardCode("code2"));
  });
});
