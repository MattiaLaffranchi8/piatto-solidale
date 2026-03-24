-- ============================================================
-- PiattoSolidale — Setup completo DB (esegui tutto in una volta)
-- Supabase → SQL Editor → incolla → Run
-- ============================================================

-- 001 Profiles
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('donor', 'association', 'restaurant'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 002 Associations
DO $$ BEGIN CREATE TYPE association_status AS ENUM ('pending', 'verified', 'suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS associations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  fiscal_code     TEXT NOT NULL UNIQUE,
  runts_number    TEXT,
  status          association_status NOT NULL DEFAULT 'pending',
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  province        TEXT NOT NULL,
  region          TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  contact_phone   TEXT,
  website         TEXT,
  description     TEXT,
  certified_count INTEGER NOT NULL DEFAULT 0,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS associations_updated_at ON associations;
CREATE TRIGGER associations_updated_at
  BEFORE UPDATE ON associations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 003 Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id   TEXT UNIQUE,
  stripe_onboarded    BOOLEAN NOT NULL DEFAULT false,
  name                TEXT NOT NULL,
  address             TEXT NOT NULL,
  city                TEXT NOT NULL,
  province            TEXT NOT NULL,
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  cuisine_types       TEXT[] DEFAULT '{}',
  phone               TEXT,
  website             TEXT,
  image_url           TEXT,
  solidarity_discount INTEGER NOT NULL DEFAULT 20,
  max_daily_covers    INTEGER NOT NULL DEFAULT 10,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  avg_rating          NUMERIC(2,1) DEFAULT 0,
  total_meals_served  INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS restaurants_updated_at ON restaurants;
CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS ethical_menus (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL,
  full_price      INTEGER NOT NULL,
  ethical_price   INTEGER NOT NULL,
  available_days  INTEGER[] DEFAULT '{1,2,3,4,5}',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 004 Beneficiaries
DO $$ BEGIN CREATE TYPE beneficiary_status AS ENUM ('active', 'suspended', 'expired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE isee_bracket AS ENUM ('under_3000', '3000_6000', '6000_9000'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS beneficiaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id    UUID NOT NULL REFERENCES associations(id) ON DELETE RESTRICT,
  anonymous_code    TEXT NOT NULL UNIQUE,
  card_hash         TEXT NOT NULL UNIQUE,
  status            beneficiary_status NOT NULL DEFAULT 'active',
  isee_bracket      isee_bracket NOT NULL,
  monthly_budget    INTEGER NOT NULL,
  remaining_budget  INTEGER NOT NULL,
  notes_encrypted   TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_association ON beneficiaries(association_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status) WHERE status = 'active';

DROP TRIGGER IF EXISTS beneficiaries_updated_at ON beneficiaries;
CREATE TRIGGER beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 005 Vouchers
DO $$ BEGIN CREATE TYPE voucher_status AS ENUM ('active', 'redeemed', 'expired', 'revoked'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS vouchers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id      UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  restaurant_id       UUID REFERENCES restaurants(id),
  menu_id             UUID REFERENCES ethical_menus(id),
  code_hash           TEXT NOT NULL UNIQUE,
  amount              INTEGER NOT NULL,
  status              voucher_status NOT NULL DEFAULT 'active',
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at         TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ NOT NULL,
  stripe_transfer_id  TEXT
);

CREATE INDEX IF NOT EXISTS idx_vouchers_beneficiary ON vouchers(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status) WHERE status = 'active';

-- 006 Donations
DO $$ BEGIN CREATE TYPE donation_status AS ENUM ('pending', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS donations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_profile_id      UUID REFERENCES profiles(id),
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

CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_profile_id);

-- 007 Meals
CREATE TABLE IF NOT EXISTS meals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id          UUID NOT NULL REFERENCES vouchers(id),
  restaurant_id       UUID NOT NULL REFERENCES restaurants(id),
  menu_id             UUID NOT NULL REFERENCES ethical_menus(id),
  ethical_price       INTEGER NOT NULL,
  full_price          INTEGER NOT NULL,
  solidarity_saving   INTEGER NOT NULL,
  stripe_transfer_id  TEXT,
  served_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 008 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Association owner full access" ON associations;
CREATE POLICY "Association owner full access" ON associations FOR ALL USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Restaurant owner full access" ON restaurants;
CREATE POLICY "Restaurant owner full access" ON restaurants FOR ALL USING (profile_id = auth.uid());
DROP POLICY IF EXISTS "Public read active restaurants" ON restaurants;
CREATE POLICY "Public read active restaurants" ON restaurants FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Association manages own beneficiaries" ON beneficiaries;
CREATE POLICY "Association manages own beneficiaries" ON beneficiaries FOR ALL
  USING (association_id IN (SELECT id FROM associations WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Association reads own vouchers" ON vouchers;
CREATE POLICY "Association reads own vouchers" ON vouchers FOR SELECT
  USING (beneficiary_id IN (
    SELECT b.id FROM beneficiaries b JOIN associations a ON b.association_id = a.id WHERE a.profile_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Restaurant reads redeemed vouchers" ON vouchers;
CREATE POLICY "Restaurant reads redeemed vouchers" ON vouchers FOR SELECT
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE profile_id = auth.uid()));

DROP POLICY IF EXISTS "Donor reads own donations" ON donations;
CREATE POLICY "Donor reads own donations" ON donations FOR SELECT USING (donor_profile_id = auth.uid());

DROP POLICY IF EXISTS "Restaurant reads own meals" ON meals;
CREATE POLICY "Restaurant reads own meals" ON meals FOR SELECT
  USING (restaurant_id IN (SELECT id FROM restaurants WHERE profile_id = auth.uid()));

SELECT 'Setup completato con successo!' AS risultato;
