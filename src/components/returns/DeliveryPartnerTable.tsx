import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

export function DeliveryPartnerTable({ data }: { data: ReturnsResponse["byDeliveryPartner"] }) {
  const { t } = useLanguage();
  const worst = data.reduce((max, d) => (d.damageRate > max.damageRate ? d : max), data[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.deliveryPartnerImpact")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.partner")}</TableHead>
              <TableHead>{t("table.deliveries")}</TableHead>
              <TableHead>{t("table.damagedReturnRate")}</TableHead>
              <TableHead>{t("table.avgProcessingDays")}</TableHead>
              <TableHead>{t("table.totalReturns")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.partner} className={row.partner === worst?.partner ? "bg-red-50/60" : undefined}>
                <TableCell className="font-medium">{t(`partner.${row.partner}`)}</TableCell>
                <TableCell>{row.deliveriesHandled.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={row.damageRate > 3 ? "danger" : row.damageRate > 1.5 ? "warning" : "success"}>{row.damageRate}%</Badge>
                  {row.partner === worst?.partner && <span className="ms-2 text-xs text-danger">{t("common.highest")}</span>}
                </TableCell>
                <TableCell>{row.avgProcessingDays}d</TableCell>
                <TableCell>{row.totalReturns.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
