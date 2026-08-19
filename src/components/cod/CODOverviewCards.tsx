import { MetricCard } from "@/components/shared/MetricCard";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

export function CODOverviewCards({ overview }: { overview: CodResponse["overview"] }) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label={t("metric.codOrders")}
        value={overview.codOrders.toLocaleString()}
        sublabel={`${overview.codPercentage}% ${t("metric.pctOfOrders")}`}
      />
      <MetricCard label={t("metric.codRevenueCollected")} value={`SAR ${overview.revenueCollected.toLocaleString()}`} />
      <MetricCard
        label={t("metric.codRejections")}
        value={overview.rejections.toLocaleString()}
        sublabel={`${overview.rejectionRate}% ${t("metric.rejectionRateSuffix")}`}
      />
      <MetricCard label={t("metric.codLoss")} value={`SAR ${overview.totalLoss.toLocaleString()}`} />
    </div>
  );
}
