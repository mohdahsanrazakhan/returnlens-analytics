"use client";

import * as React from "react";
import { useProducts } from "@/hooks/useProducts";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Pagination } from "@/components/shared/Pagination";
import { CategoryHeatmap } from "@/components/products/CategoryHeatmap";
import { ProductReturnTable } from "@/components/products/ProductReturnTable";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import type { ProductLite } from "@/types";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ProductsPage() {
  const [page, setPage] = React.useState(1);
  const [category, setCategory] = React.useState("");
  const [risk, setRisk] = React.useState("all");
  const [sort, setSort] = React.useState("returnRate");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<ProductLite | null>(null);
  const { t } = useLanguage();

  const { data, loading, error } = useProducts({ page, limit: 20, category: category || undefined, risk, sort, order: "desc", search });

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Card>
          <CardContent className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {data && <CategoryHeatmap data={data.categoryHeatmap} />}

      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t("page.products")}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder={t("common.searchNameSku")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-48"
              maxLength={100}
            />
            <Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-auto"
            >
              <option value="">{t("common.allCategories")}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`category.${c}`)}
                </option>
              ))}
            </Select>
            <Select
              value={risk}
              onChange={(e) => {
                setRisk(e.target.value);
                setPage(1);
              }}
              className="w-auto"
            >
              <option value="all">{t("common.allRisk")}</option>
              <option value="low">{t("risk.low")}</option>
              <option value="medium">{t("risk.medium")}</option>
              <option value="high">{t("risk.high")}</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
              <option value="returnRate">{t("common.sortReturnRate")}</option>
              <option value="codRejectionRate">{t("common.sortCodRejection")}</option>
              <option value="totalLoss">{t("common.sortTotalLoss")}</option>
              <option value="unitsSold">{t("common.sortUnitsSold")}</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading || !data ? (
            <LoadingSpinner label={t("loading.products")} />
          ) : (
            <>
              <ProductReturnTable products={data.products} onSelect={setSelected} />
              <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
