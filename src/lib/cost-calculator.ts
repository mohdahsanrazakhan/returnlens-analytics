import { DEFAULT_COST_ASSUMPTIONS } from "@/lib/constants";

export interface CostAssumptions {
  avgReturnShippingCost: number;
  avgRestockingCost: number;
  avgCodRejectionCost: number;
  vatRateUAE: number;
  vatRateKSA: number;
}

export function getCostAssumptions(overrides?: Partial<CostAssumptions>): CostAssumptions {
  return { ...DEFAULT_COST_ASSUMPTIONS, ...overrides };
}

export function calculateReturnCost(assumptions: CostAssumptions = DEFAULT_COST_ASSUMPTIONS) {
  return assumptions.avgReturnShippingCost + assumptions.avgRestockingCost;
}

export function calculateCodRejectionLoss(assumptions: CostAssumptions = DEFAULT_COST_ASSUMPTIONS) {
  return assumptions.avgCodRejectionCost;
}

export function vatRateForCountry(country: "UAE" | "KSA", assumptions: CostAssumptions = DEFAULT_COST_ASSUMPTIONS) {
  return country === "UAE" ? assumptions.vatRateUAE : assumptions.vatRateKSA;
}

/** SAR <-> AED demo conversion (fixed peg-like rate for display purposes only). */
const SAR_TO_AED = 0.98;

export function convertCurrency(amountSAR: number, target: "SAR" | "AED"): number {
  if (target === "SAR") return amountSAR;
  return amountSAR * SAR_TO_AED;
}

export function formatCurrency(amount: number, currency: "SAR" | "AED" = "SAR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
