CREATE TABLE restaurants (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id     TEXT UNIQUE,
  stripe_onboarded      BOOLEAN NOT NULL DEFAULT false,
  name                  TEXT NOT NULL,
  address               TEXT NOT NULL,
  city                  TEXT NOT NULL,
  province              TEXT NOT NULL,
  lat                   DOUBLE PRECISION,
  lng                   DOUBLE PRECISION,
  cuisine_types         TEXT[] DEFAULT '{}',
  phone                 TEXT,
  website               TEXT,
  image_url             TEXT,
  solidarity_discount   INTEGER NOT NULL DEFAULT 20,
  max_daily_covers      INTEGER NOT NULL DEFAULT 10,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  avg_rating            NUMERIC(2,1) DEFAULT 0,
  total_meals_served    INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE ethical_menus (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id     UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  full_price        INTEGER NOT NULL,
  ethical_price     INTEGER NOT NULL,
  available_days    INTEGER[] DEFAULT '{1,2,3,4,5}',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
