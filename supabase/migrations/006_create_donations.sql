CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE donations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_profile_id      UUID NOT NULL REFERENCES profiles(id),
  stripe_payment_intent TEXT NOT NULL UNIQUE,
  amount                INTEGER NOT NULL,
  fee_amount            INTEGER NOT NULL DEFAULT 0,
  net_amount            INTEGER NOT NULL,
  status                donation_status NOT NULL DEFAULT 'pending',
  donor_message         TEXT,
  is_anonymous          BOOLEAN NOT NULL DEFAULT false,
  is_recurring          BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
