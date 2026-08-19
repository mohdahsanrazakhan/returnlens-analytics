import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

export function CODRecoveryTracker({ data, totalRejections }: { data: CodResponse["recovery"]; totalRejections: number }) {
  const { t } = useLanguage();
  const items = [
    { label: t("chart.reattempted"), value: data.reattempted, color: "bg-accent" },
    { label: t("chart.converted"), value: data.converted, color: "bg-success" },
    { label: t("chart.unrecoverable"), value: data.unrecoverable, color: "bg-danger" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.codRecoveryMetrics")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          {t("chart.afterRejectionPrefix")} {totalRejections.toLocaleString()} {t("chart.afterRejectionSuffix")}
        </p>
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{item.label}</span>
              <span className="font-semibold tabular-nums text-primary">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${totalRejections ? (item.value / totalRejections) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
