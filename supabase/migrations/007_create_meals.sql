CREATE TABLE meals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id        UUID NOT NULL REFERENCES vouchers(id),
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id),
  menu_id           UUID NOT NULL REFERENCES ethical_menus(id),
  ethical_price     INTEGER NOT NULL,
  full_price        INTEGER NOT NULL,
  solidarity_saving INTEGER NOT NULL,
  stripe_transfer_id TEXT,
  served_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
