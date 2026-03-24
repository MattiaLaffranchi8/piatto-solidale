CREATE TYPE association_status AS ENUM ('pending', 'verified', 'suspended');

CREATE TABLE associations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  fiscal_code       TEXT NOT NULL UNIQUE,
  runts_number      TEXT,
  status            association_status NOT NULL DEFAULT 'pending',
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  province          TEXT NOT NULL,
  region            TEXT NOT NULL,
  contact_email     TEXT NOT NULL,
  contact_phone     TEXT,
  website           TEXT,
  description       TEXT,
  certified_count   INTEGER NOT NULL DEFAULT 0,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER associations_updated_at
  BEFORE UPDATE ON associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
