"use client";

import { useApi, buildQuery } from "@/hooks/useApi";
import type { CustomersResponse } from "@/types";

export interface CustomersFilters {
  page?: number;
  limit?: number;
  risk?: string;
  city?: string;
  country?: string;
  sort?: string;
  order?: string;
  search?: string;
}

export function useCustomers(filters: CustomersFilters) {
  return useApi<CustomersResponse>(
    `/api/customers${buildQuery({
      page: filters.page?.toString(),
      limit: filters.limit?.toString(),
      risk: filters.risk,
      city: filters.city,
      country: filters.country,
      sort: filters.sort,
      order: filters.order,
      search: filters.search,
    })}`
  );
}
