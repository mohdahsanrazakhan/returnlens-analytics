"use client";

import { useApi, buildQuery } from "@/hooks/useApi";
import type { ReturnsResponse } from "@/types";
import type { Period } from "@/components/shared/DateRangePicker";

export interface ReturnsFilters {
  period: Period;
  category?: string;
  city?: string;
  channel?: string;
  reason?: string;
}

export function useReturns(filters: ReturnsFilters) {
  return useApi<ReturnsResponse>(`/api/returns${buildQuery(filters)}`);
}
