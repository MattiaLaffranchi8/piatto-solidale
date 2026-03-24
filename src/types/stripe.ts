export interface DonationMetadata {
  donor_profile_id: string;
  is_anonymous: "true" | "false";
  is_recurring: "true" | "false";
  donor_message?: string;
}

export interface VoucherTransferMetadata {
  voucher_id: string;
  beneficiary_code: string;
  restaurant_id: string;
  meal_id: string;
}
