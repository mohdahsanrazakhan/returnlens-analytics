import type { RiskLevel } from "@/lib/constants";

// Verbatim implementation of the algorithm in Section 6.3 — do not change the
// thresholds, they were chosen to produce the exact seed distribution.
export interface RiskInput {
  returnRate: number; // customer's personal return rate (0-100%)
  codRejectionRate: number; // customer's COD rejection rate (0-100%)
  totalOrders: number; // order history depth
  recentReturnCount: number; // returns in last 30 days
  avgOrderValue: number; // spending level
  daysSinceLastOrder: number; // recency
  accountAge: number; // days since first order
}

export function calculateRiskScore(input: RiskInput): number {
  let score = 0;

  // Return rate component (0-35 points)
  if (input.returnRate > 40) score += 35;
  else if (input.returnRate > 25) score += 25;
  else if (input.returnRate > 15) score += 15;
  else if (input.returnRate > 8) score += 8;
  else score += 0;

  // COD rejection component (0-30 points)
  if (input.codRejectionRate > 50) score += 30;
  else if (input.codRejectionRate > 30) score += 22;
  else if (input.codRejectionRate > 15) score += 12;
  else score += 0;

  // Recent behavior component (0-20 points)
  if (input.recentReturnCount >= 3) score += 20;
  else if (input.recentReturnCount === 2) score += 12;
  else if (input.recentReturnCount === 1) score += 5;

  // Account maturity adjustment
  if (input.accountAge < 30 && input.totalOrders < 3) score += 10;
  if (input.totalOrders > 20 && input.returnRate < 10) score -= 15;

  // Order value signal (0-5 points)
  if (input.avgOrderValue < 50 && input.codRejectionRate > 30) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return "critical";
  if (score >= 45) return "high";
  if (score >= 20) return "medium";
  return "low";
}

/** Builds the human-readable risk factor pills shown on customer profiles. */
export function buildRiskFactors(input: RiskInput & { returnRateBenchmark?: number }): string[] {
  const factors: string[] = [];
  const benchmark = input.returnRateBenchmark ?? 14;

  if (input.returnRate > benchmark) {
    factors.push(`Return rate ${input.returnRate.toFixed(0)}% (vs ${benchmark}% average)`);
  }
  if (input.recentReturnCount >= 2) {
    factors.push(`${input.recentReturnCount} returns in last 30 days`);
  }
  if (input.codRejectionRate > 15) {
    factors.push(`COD rejection rate ${input.codRejectionRate.toFixed(0)}%`);
  }
  if (input.accountAge < 30 && input.totalOrders < 3) {
    factors.push("New account with high return activity");
  }
  if (input.avgOrderValue < 50 && input.codRejectionRate > 30) {
    factors.push("Low order value with high COD rejection (possible fake orders)");
  }
  if (factors.length === 0) {
    factors.push("No significant risk factors");
  }
  return factors;
}
