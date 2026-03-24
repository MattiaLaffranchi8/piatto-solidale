CREATE TYPE beneficiary_status AS ENUM ('active', 'suspended', 'expired');
CREATE TYPE isee_bracket AS ENUM ('under_3000', '3000_6000', '6000_9000');

CREATE TABLE beneficiaries (
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

CREATE INDEX idx_beneficiaries_association ON beneficiaries(association_id);
CREATE INDEX idx_beneficiaries_status ON beneficiaries(status) WHERE status = 'active';

CREATE TRIGGER beneficiaries_updated_at
  BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
