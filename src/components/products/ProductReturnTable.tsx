"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductRiskBadge } from "@/components/products/ProductRiskBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLanguage } from "@/components/LanguageProvider";
import type { ProductLite } from "@/types";

export function ProductReturnTable({ products, onSelect }: { products: ProductLite[]; onSelect: (p: ProductLite) => void }) {
  const { t } = useLanguage();
  if (products.length === 0) return <EmptyState title={t("empty.noProducts")} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("table.product")}</TableHead>
          <TableHead>{t("table.category")}</TableHead>
          <TableHead>{t("table.unitsSold")}</TableHead>
          <TableHead>{t("table.returnRate")}</TableHead>
          <TableHead>{t("table.topReason")}</TableHead>
          <TableHead>{t("table.codRejection")}</TableHead>
          <TableHead>{t("table.totalLoss")}</TableHead>
          <TableHead>{t("table.risk")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p._id}>
            <TableCell>
              <div className="font-medium">{p.nameEn}</div>
              <div className="text-xs text-text-muted">{p.sku}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{t(`category.${p.category}`)}</Badge>
            </TableCell>
            <TableCell>{p.returnStats.totalSold}</TableCell>
            <TableCell>
              <Badge variant={p.returnStats.returnRate > 20 ? "danger" : p.returnStats.returnRate > 10 ? "warning" : "success"}>
                {p.returnStats.returnRate}%
              </Badge>
            </TableCell>
            <TableCell className="text-xs">
              {p.returnStats.topReturnReason ? t(`reason.${p.returnStats.topReturnReason}`) : t("common.na")}
            </TableCell>
            <TableCell>
              <Badge variant={p.codStats.codRejectionRate > 15 ? "danger" : p.codStats.codRejectionRate > 8 ? "warning" : "success"}>
                {p.codStats.codRejectionRate}%
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">SAR {Math.round(p.returnStats.returnCost).toLocaleString()}</TableCell>
            <TableCell>
              <ProductRiskBadge level={p.riskLevel} />
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onSelect(p)}>
                {t("common.details")}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
