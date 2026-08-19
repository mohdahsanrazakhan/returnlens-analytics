import productsData from "@/seed/data/products.json";

export interface SeedProductSource {
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  subcategory: string;
  brand: string;
  sellingPrice: number;
  weight: number;
  returnRateTarget: number; // deliberate per-product target used to bias order outcomes
}

export function loadProductSources(): SeedProductSource[] {
  return productsData as SeedProductSource[];
}
