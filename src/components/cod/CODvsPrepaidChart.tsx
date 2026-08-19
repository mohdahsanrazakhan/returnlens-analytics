import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

function Row({
  label,
  cod,
  prepaid,
  suffix = "",
  codLabel,
  prepaidLabel,
}: {
  label: string;
  cod: number;
  prepaid: number;
  suffix?: string;
  codLabel: string;
  prepaidLabel: string;
}) {
  const max = Math.max(cod, prepaid, 1);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{label}</span>
      </div>

      {/* Mobile: full-width stacked bars, each tagged with its own label */}
      <div className="flex flex-col gap-1.5 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 truncate text-[11px] font-medium text-warning">{codLabel}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-warning" style={{ width: `${(cod / max) * 100}%` }} />
          </div>
          <span className="w-16 shrink-0 text-end text-sm font-semibold tabular-nums text-primary">
            {cod.toLocaleString()}
            {suffix}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 truncate text-[11px] font-medium text-accent">{prepaidLabel}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(prepaid / max) * 100}%` }} />
          </div>
          <span className="w-16 shrink-0 text-end text-sm font-semibold tabular-nums text-primary">
            {prepaid.toLocaleString()}
            {suffix}
          </span>
        </div>
      </div>

      {/* Tablet/desktop: mirrored two-column layout */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-warning" style={{ width: `${(cod / max) * 100}%` }} />
          </div>
          <span className="w-16 shrink-0 text-end text-sm font-semibold tabular-nums text-primary">
            {cod.toLocaleString()}
            {suffix}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-sm font-semibold tabular-nums text-primary">
            {prepaid.toLocaleString()}
            {suffix}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="ms-auto h-full rounded-full bg-accent" style={{ width: `${(prepaid / max) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CODvsPrepaidChart({ data }: { data: CodResponse["vsPrepaid"] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.codVsPrepaid")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="hidden text-center text-xs font-semibold uppercase tracking-wide text-text-secondary sm:grid sm:grid-cols-2">
          <span>{t("chart.codOrders")}</span>
          <span>{t("chart.prepaidOrders")}</span>
        </div>
        <Row
          label={t("chart.codOrdersRow")}
          cod={data.cod.orders}
          prepaid={data.prepaid.orders}
          codLabel={t("chart.codOrders")}
          prepaidLabel={t("chart.prepaidOrders")}
        />
        <Row
          label={t("chart.successRateRow")}
          cod={data.cod.successRate}
          prepaid={data.prepaid.successRate}
          suffix="%"
          codLabel={t("chart.codOrders")}
          prepaidLabel={t("chart.prepaidOrders")}
        />
        <Row
          label={t("chart.returnRateRow")}
          cod={data.cod.returnRate}
          prepaid={data.prepaid.returnRate}
          suffix="%"
          codLabel={t("chart.codOrders")}
          prepaidLabel={t("chart.prepaidOrders")}
        />
        <Row
          label={t("chart.avgOrderValueRow")}
          cod={data.cod.avgAOV}
          prepaid={data.prepaid.avgAOV}
          codLabel={t("chart.codOrders")}
          prepaidLabel={t("chart.prepaidOrders")}
        />
        <Row
          label={t("chart.lossPerOrderRow")}
          cod={data.cod.lossPerOrder}
          prepaid={data.prepaid.lossPerOrder}
          codLabel={t("chart.codOrders")}
          prepaidLabel={t("chart.prepaidOrders")}
        />

        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-text-secondary">
          {t("chart.prepaidHaveLower")}{" "}
          <span className="font-semibold text-primary">
            {data.cod.returnRate && data.prepaid.returnRate ? (data.cod.returnRate / Math.max(data.prepaid.returnRate, 0.1)).toFixed(1) : "—"}x
          </span>{" "}
          {t("chart.lowerReturnRateAnd")}{" "}
          <span className="font-semibold text-primary">{(data.prepaid.avgAOV / Math.max(data.cod.avgAOV, 1)).toFixed(1)}x</span>{" "}
          {t("chart.higherAvgOrderValue")}
        </p>
      </CardContent>
    </Card>
  );
}
