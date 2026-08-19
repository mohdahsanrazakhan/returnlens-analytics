import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, riskBadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLanguage } from "@/components/LanguageProvider";
import type { CustomerLite } from "@/types";

export function CustomerRiskTable({ customers, onSelect }: { customers: CustomerLite[]; onSelect: (c: CustomerLite) => void }) {
  const { t } = useLanguage();
  if (customers.length === 0) return <EmptyState title={t("empty.noCustomers")} />;

  return (
    <>
      {/* Mobile: stacked cards — a 9-column table can't fit a small screen without squashing */}
      <div className="flex flex-col gap-3 md:hidden">
        {customers.map((c) => (
          <div key={c._id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-primary">{c.name}</div>
                <div className="text-xs text-text-muted">{c.customerId}</div>
                <div className="mt-0.5 text-xs text-text-secondary">
                  {t(`city.${c.city}`)}, {c.country}
                </div>
              </div>
              <Badge variant={riskBadgeVariant(c.riskLevel)}>{t(`risk.${c.riskLevel}`)}</Badge>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-danger" style={{ width: `${c.riskScore}%` }} />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-primary">{t("table.riskScore")} {c.riskScore}</span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background p-2">
                <div className="text-sm font-semibold tabular-nums text-primary">{c.stats.totalOrders}</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">{t("table.orders")}</div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="text-sm font-semibold tabular-nums text-primary">{c.stats.returnRate}%</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">{t("table.returnRate")}</div>
              </div>
              <div className="rounded-lg bg-background p-2">
                <div className="text-sm font-semibold tabular-nums text-primary">{c.stats.codRejectionRate}%</div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted">{t("table.codRejection")}</div>
              </div>
            </div>

            {c.riskFactors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {c.riskFactors.slice(0, 2).map((f, i) => (
                  <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-text-secondary">
                    {f}
                  </span>
                ))}
              </div>
            )}

            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => onSelect(c)}>
              {t("common.profile")}
            </Button>
          </div>
        ))}
      </div>

      {/* Tablet/desktop: full table. Enforces a min-width so narrower viewports scroll
          horizontally (wrapper already has overflow-x-auto) instead of squeezing every
          column. Without this, the Risk Factors pills wrap into a single-word-per-line mess. */}
      <div className="hidden md:block">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.customer")}</TableHead>
              <TableHead>{t("table.city")}</TableHead>
              <TableHead>{t("table.riskScore")}</TableHead>
              <TableHead>{t("table.riskLevel")}</TableHead>
              <TableHead>{t("table.orders")}</TableHead>
              <TableHead>{t("table.returnRate")}</TableHead>
              <TableHead>{t("table.codRejection")}</TableHead>
              <TableHead>{t("table.riskFactors")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c._id}>
                <TableCell>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-text-muted">{c.customerId}</div>
                </TableCell>
                <TableCell>
                  {t(`city.${c.city}`)}, {c.country}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-danger" style={{ width: `${c.riskScore}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-primary">{c.riskScore}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={riskBadgeVariant(c.riskLevel)}>{t(`risk.${c.riskLevel}`)}</Badge>
                </TableCell>
                <TableCell>{c.stats.totalOrders}</TableCell>
                <TableCell>{c.stats.returnRate}%</TableCell>
                <TableCell>{c.stats.codRejectionRate}%</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.riskFactors.slice(0, 2).map((f, i) => (
                      <span
                        key={i}
                        className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-text-secondary"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onSelect(c)}>
                    {t("common.profile")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
