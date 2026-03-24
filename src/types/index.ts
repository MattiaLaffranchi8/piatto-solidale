export type UserRole = "donor" | "association" | "restaurant";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Association {
  id: string;
  profile_id: string;
  name: string;
  fiscal_code: string;
  runts_number: string | null;
  status: "pending" | "verified" | "suspended";
  address: string;
  city: string;
  province: string;
  region: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  description: string | null;
  certified_count: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  profile_id: string;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  cuisine_types: string[];
  phone: string | null;
  website: string | null;
  image_url: string | null;
  solidarity_discount: number;
  max_daily_covers: number;
  is_active: boolean;
  avg_rating: number;
  total_meals_served: number;
  created_at: string;
  updated_at: string;
}

export interface EthicalMenu {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  full_price: number;
  ethical_price: number;
  available_days: number[];
  is_active: boolean;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  association_id: string;
  anonymous_code: string;
  card_hash: string;
  status: "active" | "suspended" | "expired";
  isee_bracket: "under_3000" | "3000_6000" | "6000_9000";
  monthly_budget: number;
  remaining_budget: number;
  notes_encrypted: string | null;
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Voucher {
  id: string;
  beneficiary_id: string;
  restaurant_id: string | null;
  menu_id: string | null;
  code_hash: string;
  amount: number;
  status: "active" | "redeemed" | "expired" | "revoked";
  issued_at: string;
  redeemed_at: string | null;
  expires_at: string;
  stripe_transfer_id: string | null;
}

export interface Donation {
  id: string;
  donor_profile_id: string;
  stripe_payment_intent: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  donor_message: string | null;
  is_anonymous: boolean;
  is_recurring: boolean;
  created_at: string;
}

export interface VoucherPayload {
  voucher_id: string;
  beneficiary_code: string;
  amount: number;
  expires_at: string;
  issued_at: string;
}
