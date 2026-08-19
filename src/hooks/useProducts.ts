"use client";

import { useApi, buildQuery } from "@/hooks/useApi";
import type { ProductsResponse } from "@/types";

export interface ProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  risk?: string;
  sort?: string;
  order?: string;
  search?: string;
}

export function useProducts(filters: ProductsFilters) {
  return useApi<ProductsResponse>(
    `/api/products${buildQuery({
      page: filters.page?.toString(),
      limit: filters.limit?.toString(),
      category: filters.category,
      risk: filters.risk,
      sort: filters.sort,
      order: filters.order,
      search: filters.search,
    })}`
  );
}
