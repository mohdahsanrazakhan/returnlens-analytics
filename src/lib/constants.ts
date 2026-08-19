// Central constants — single source of truth for enums, distributions, and defaults.
// Mirrors PROJECT-3-RETURNLENS-ANALYTICS.md Section 6 exactly. Do not randomize these.

export const CHANNELS = ["noon", "amazon", "shopify", "website"] as const;
export type Channel = (typeof CHANNELS)[number];

export const PAYMENT_METHODS = [
  "cod",
  "credit_card",
  "debit_card",
  "mada",
  "apple_pay",
  "tabby",
  "tamara",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ORDER_STATUSES = ["delivered", "returned", "cod_rejected", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const RETURN_REASONS = [
  "wrong_size",
  "damaged",
  "not_as_described",
  "changed_mind",
  "defective",
  "wrong_item",
] as const;
export type ReturnReason = (typeof RETURN_REASONS)[number];

export const COD_REJECTION_REASONS = [
  "customer_refused",
  "customer_unavailable",
  "wrong_address",
  "cannot_pay",
  "fake_order",
] as const;
export type CodRejectionReason = (typeof COD_REJECTION_REASONS)[number];

export const SHIPPING_PARTNERS = ["aramex", "smsa", "fetchr", "jt_express", "dhl"] as const;
export type ShippingPartner = (typeof SHIPPING_PARTNERS)[number];

export const COUNTRIES = ["UAE", "KSA"] as const;
export type Country = (typeof COUNTRIES)[number];

export const CURRENCIES = ["SAR", "AED"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const PRODUCT_RISK_LEVELS = ["low", "medium", "high"] as const;
export type ProductRiskLevel = (typeof PRODUCT_RISK_LEVELS)[number];

export const CATEGORIES = [
  "Fashion & Apparel",
  "Shoes & Footwear",
  "Electronics",
  "Beauty & Skincare",
  "Home & Kitchen",
  "Sports & Outdoors",
  "Baby & Kids",
  "Accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const RECOMMENDATION_TYPES = ["returns", "cod", "product", "customer", "operational"] as const;
export const RECOMMENDATION_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export const RECOMMENDATION_STATUSES = ["new", "viewed", "implementing", "implemented", "dismissed"] as const;
export const RECOMMENDATION_DIFFICULTY = ["easy", "medium", "hard"] as const;

// ---- Section 6.2 distribution rules (used by the seed generators) ----

export const ORDER_STATUS_DISTRIBUTION: Record<OrderStatus, number> = {
  delivered: 0.68,
  returned: 0.14,
  cod_rejected: 0.12,
  cancelled: 0.06,
};

export const CHANNEL_DISTRIBUTION: Record<Channel, number> = {
  noon: 0.35,
  amazon: 0.25,
  shopify: 0.25,
  website: 0.15,
};

// Section 6.2 lists "Credit/Debit Card: 25%" as one combined line; split across the two
// distinct enum values so every PaymentMethod has an explicit weight.
export const PAYMENT_METHOD_DISTRIBUTION: Record<PaymentMethod, number> = {
  cod: 0.35,
  credit_card: 0.15,
  debit_card: 0.1,
  mada: 0.15,
  apple_pay: 0.1,
  tabby: 0.08,
  tamara: 0.07,
};

// City -> COD rejection rate (Section 6.2 "vary by city")
export const CITY_COD_REJECTION_RATE: Record<string, number> = {
  Riyadh: 0.18,
  Jeddah: 0.14,
  Dammam: 0.11,
  Dubai: 0.08,
  "Abu Dhabi": 0.06,
  Sharjah: 0.13,
  Ajman: 0.16,
  Makkah: 0.15,
};

export const COD_REJECTION_REASON_DISTRIBUTION: Record<CodRejectionReason, number> = {
  customer_refused: 0.35,
  customer_unavailable: 0.25,
  wrong_address: 0.15,
  cannot_pay: 0.12,
  fake_order: 0.13,
};

export const RETURN_REASON_DISTRIBUTION: Record<ReturnReason, number> = {
  changed_mind: 0.3,
  wrong_size: 0.22,
  not_as_described: 0.18,
  damaged: 0.12,
  defective: 0.1,
  wrong_item: 0.08,
};

export const CATEGORY_RETURN_RATE: Record<Category, number> = {
  "Fashion & Apparel": 0.28,
  "Shoes & Footwear": 0.24,
  Electronics: 0.12,
  "Beauty & Skincare": 0.06,
  "Home & Kitchen": 0.09,
  "Sports & Outdoors": 0.11,
  "Baby & Kids": 0.07,
  Accessories: 0.15,
};

// Return timing buckets — cumulative shares of returns that happen within N days after delivery
export const RETURN_TIMING_DISTRIBUTION = [
  { label: "1-3", min: 1, max: 3, share: 0.35 },
  { label: "4-7", min: 4, max: 7, share: 0.3 },
  { label: "8-14", min: 8, max: 14, share: 0.25 },
  { label: "15-30", min: 15, max: 30, share: 0.1 },
];

// Order value bucket -> COD rejection rate (Section 6.2)
export const ORDER_VALUE_COD_REJECTION = [
  { label: "< SAR 100", min: 0, max: 100, rate: 0.08 },
  { label: "SAR 100-300", min: 100, max: 300, rate: 0.11 },
  { label: "SAR 300-500", min: 300, max: 500, rate: 0.16 },
  { label: "SAR 500-1000", min: 500, max: 1000, rate: 0.22 },
  { label: "> SAR 1000", min: 1000, max: Infinity, rate: 0.28 },
];

// Country -> city -> share of total orders (Section 6.2 Geographic Distribution)
export const GEO_DISTRIBUTION: {
  country: Country;
  countryShare: number;
  cities: { city: string; share: number }[];
}[] = [
  {
    country: "KSA",
    countryShare: 0.55,
    cities: [
      { city: "Riyadh", share: 0.3 },
      { city: "Jeddah", share: 0.15 },
      { city: "Dammam", share: 0.05 },
      { city: "Makkah", share: 0.03 },
      { city: "Other", share: 0.02 },
    ],
  },
  {
    country: "UAE",
    countryShare: 0.45,
    cities: [
      { city: "Dubai", share: 0.25 },
      { city: "Abu Dhabi", share: 0.1 },
      { city: "Sharjah", share: 0.05 },
      { city: "Ajman", share: 0.03 },
      { city: "RAK", share: 0.02 },
    ],
  },
];

export const SHIPPING_PARTNER_DISTRIBUTION: Record<ShippingPartner, number> = {
  aramex: 0.3,
  smsa: 0.25,
  fetchr: 0.2,
  jt_express: 0.15,
  dhl: 0.1,
};

export const SHIPPING_PARTNER_RETURN_DAYS: Record<ShippingPartner, number> = {
  aramex: 3,
  smsa: 4,
  fetchr: 5,
  jt_express: 3.5,
  dhl: 2,
};

export const RISK_DISTRIBUTION: Record<RiskLevel, number> = {
  low: 0.55,
  medium: 0.25,
  high: 0.14,
  critical: 0.06,
};

// ---- Default cost assumptions (Settings page can override) ----
export const DEFAULT_COST_ASSUMPTIONS = {
  avgReturnShippingCost: 15, // SAR
  avgRestockingCost: 8, // SAR
  avgCodRejectionCost: 25, // SAR
  vatRateUAE: 0.05,
  vatRateKSA: 0.15,
};

export const RISK_THRESHOLDS = {
  low: { min: 0, max: 19 },
  medium: { min: 20, max: 44 },
  high: { min: 45, max: 69 },
  critical: { min: 70, max: 100 },
};

export const VOLUME = {
  users: 1,
  customers: 800,
  products: 65,
  orders: 8000,
  recommendations: 20,
};
