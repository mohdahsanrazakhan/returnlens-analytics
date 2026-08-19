import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLanguage } from "@/components/LanguageProvider";
import type { DashboardResponse } from "@/types";

export function TopReturnedProducts({ items }: { items: DashboardResponse["topReturnedProducts"] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.mostReturnedProducts")}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title={t("empty.noReturnedProducts")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.product")}</TableHead>
                <TableHead>{t("table.returnRate")}</TableHead>
                <TableHead>{t("table.units")}</TableHead>
                <TableHead>{t("table.loss")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.product._id}>
                  <TableCell>
                    <div className="font-medium">{item.product.nameEn}</div>
                    <div className="text-xs text-text-muted">{item.product.sku}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.returnRate > 20 ? "danger" : item.returnRate > 10 ? "warning" : "success"}>
                      {item.returnRate.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{item.unitsReturned}</TableCell>
                  <TableCell className="tabular-nums">SAR {Math.round(item.totalLoss).toLocaleString()}</TableCell>
                  <TableCell>
                    <Link href="/products" className="text-xs font-medium text-accent hover:underline">
                      {t("common.view")}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
