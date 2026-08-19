import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useLanguage } from "@/components/LanguageProvider";
import type { ProductsResponse } from "@/types";

function heatColor(value: number, max: number) {
  const ratio = max ? Math.min(1, value / max) : 0;
  // interpolate from a light tint to danger red
  const alpha = 0.1 + ratio * 0.55;
  return `rgba(239, 68, 68, ${alpha.toFixed(2)})`;
}

export function CategoryHeatmap({ data }: { data: ProductsResponse["categoryHeatmap"] }) {
  const { t } = useLanguage();
  const maxReturn = Math.max(...data.map((d) => d.returnRate), 1);
  const maxCod = Math.max(...data.map((d) => d.codRejectionRate), 1);
  const maxLoss = Math.max(...data.map((d) => d.totalLoss), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.categoryHeatmap")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.category")}</TableHead>
              <TableHead>{t("table.returnRate")}</TableHead>
              <TableHead>{t("table.codRejectionRate")}</TableHead>
              <TableHead>{t("table.totalLoss")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium">{t(`category.${row.category}`)}</TableCell>
                <TableCell>
                  <span className="inline-block rounded px-2 py-1 tabular-nums" style={{ background: heatColor(row.returnRate, maxReturn) }}>
                    {row.returnRate}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-block rounded px-2 py-1 tabular-nums" style={{ background: heatColor(row.codRejectionRate, maxCod) }}>
                    {row.codRejectionRate}%
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-block rounded px-2 py-1 tabular-nums" style={{ background: heatColor(row.totalLoss, maxLoss) }}>
                    SAR {row.totalLoss.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
