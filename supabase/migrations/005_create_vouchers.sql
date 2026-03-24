CREATE TYPE voucher_status AS ENUM ('active', 'redeemed', 'expired', 'revoked');

CREATE TABLE vouchers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id    UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  restaurant_id     UUID REFERENCES restaurants(id),
  menu_id           UUID REFERENCES ethical_menus(id),
  code_hash         TEXT NOT NULL UNIQUE,
  amount            INTEGER NOT NULL,
  status            voucher_status NOT NULL DEFAULT 'active',
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ NOT NULL,
  stripe_transfer_id TEXT
);

CREATE INDEX idx_vouchers_beneficiary ON vouchers(beneficiary_id);
CREATE INDEX idx_vouchers_status ON vouchers(status) WHERE status = 'active';
