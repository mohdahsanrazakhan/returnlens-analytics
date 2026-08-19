"use client";

import { useApi, buildQuery } from "@/hooks/useApi";
import type { DashboardResponse } from "@/types";
import type { Period } from "@/components/shared/DateRangePicker";

export function useDashboard(period: Period, currency: "SAR" | "AED") {
  return useApi<DashboardResponse>(`/api/dashboard${buildQuery({ period, currency })}`);
}
