import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  distribution: { low: number; medium: number; high: number; critical: number };
}

export function RiskSummaryCards({ distribution }: Props) {
  const { t } = useLanguage();
  const total = distribution.low + distribution.medium + distribution.high + distribution.critical || 1;
  const items = [
    { label: t("risk.low"), value: distribution.low, dot: "bg-success", color: "text-success" },
    { label: t("risk.medium"), value: distribution.medium, dot: "bg-warning", color: "text-warning" },
    { label: t("risk.high"), value: distribution.high, dot: "bg-risk-high", color: "text-risk-high" },
    { label: t("risk.critical"), value: distribution.critical, dot: "bg-danger", color: "text-danger" },
  ];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${item.dot}`} />
              {item.label}
            </span>
            <span className={`font-semibold tabular-nums ${item.color}`}>
              {item.value.toLocaleString()} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
