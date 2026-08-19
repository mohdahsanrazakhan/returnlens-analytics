import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

function colorFor(rate: number) {
  if (rate > 90) return "#10b981";
  if (rate >= 80) return "#f59e0b";
  return "#f43f5e";
}

export function CODSuccessByCity({ data }: { data: CodResponse["byCity"] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.codSuccessByCity")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.map((row) => (
          <div key={row.city} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-primary">{t(`city.${row.city}`)}</span>
              <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-sm font-semibold tabular-nums text-primary">{row.successRate}%</span>
                <span className="text-xs text-text-muted">
                  ({row.rejections} {t("chart.rejectionsSuffix")})
                </span>
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${row.successRate}%`, backgroundColor: colorFor(row.successRate) }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
