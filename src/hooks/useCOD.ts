"use client";

import { useApi, buildQuery } from "@/hooks/useApi";
import type { CodResponse } from "@/types";
import type { Period } from "@/components/shared/DateRangePicker";

export interface CodFilters {
  period: Period;
  city?: string;
}

export function useCOD(filters: CodFilters) {
  return useApi<CodResponse>(`/api/cod${buildQuery(filters)}`);
}
