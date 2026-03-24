ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Associations
CREATE POLICY "Association owner full access"
  ON associations FOR ALL USING (profile_id = auth.uid());

-- Restaurants
CREATE POLICY "Restaurant owner full access"
  ON restaurants FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "Public read active restaurants"
  ON restaurants FOR SELECT USING (is_active = true);

-- Beneficiaries
CREATE POLICY "Association manages own beneficiaries"
  ON beneficiaries FOR ALL
  USING (association_id IN (
    SELECT id FROM associations WHERE profile_id = auth.uid()
  ));

-- Vouchers
CREATE POLICY "Association reads own vouchers"
  ON vouchers FOR SELECT
  USING (beneficiary_id IN (
    SELECT b.id FROM beneficiaries b
    JOIN associations a ON b.association_id = a.id
    WHERE a.profile_id = auth.uid()
  ));
CREATE POLICY "Restaurant reads redeemed vouchers"
  ON vouchers FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE profile_id = auth.uid()
  ));

-- Donations
CREATE POLICY "Donor reads own donations"
  ON donations FOR SELECT USING (donor_profile_id = auth.uid());

-- Meals
CREATE POLICY "Restaurant reads own meals"
  ON meals FOR SELECT
  USING (restaurant_id IN (
    SELECT id FROM restaurants WHERE profile_id = auth.uid()
  ));
