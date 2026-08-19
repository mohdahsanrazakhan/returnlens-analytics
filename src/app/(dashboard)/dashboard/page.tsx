"use client";

import * as React from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { LossCalculator } from "@/components/dashboard/LossCalculator";
import { MetricCard } from "@/components/shared/MetricCard";
import { ReturnRateGauge } from "@/components/dashboard/ReturnRateGauge";
import { CODSuccessGauge } from "@/components/dashboard/CODSuccessGauge";
import { TrendSparkline } from "@/components/dashboard/TrendSparklines";
import { ReturnCodTrendChart } from "@/components/dashboard/ReturnCodTrendChart";
import { CityHeatmap } from "@/components/dashboard/CityHeatmap";
import { QuickAlerts } from "@/components/dashboard/QuickAlerts";
import { TopReturnedProducts } from "@/components/dashboard/TopReturnedProducts";
import { DateRangePicker, type Period } from "@/components/shared/DateRangePicker";
import { Select } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

const PERIOD_LABEL_KEYS: Record<Period, string> = {
  "7d": "period.last7d",
  "30d": "period.last30d",
  "90d": "period.last90d",
  "12m": "period.last12m",
};

export default function DashboardPage() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const [currency, setCurrency] = React.useState<"SAR" | "AED">("SAR");
  const { data, loading, error } = useDashboard(period, currency);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div />
        <div className="flex items-center gap-2">
          <DateRangePicker value={period} onChange={setPeriod} />
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as "SAR" | "AED")} className="w-auto">
            <option value="SAR">SAR</option>
            <option value="AED">AED</option>
          </Select>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {loading || !data ? (
        <LoadingSpinner label={t("loading.dashboard")} />
      ) : (
        <>
          <LossCalculator
            totalLoss={data.totalLoss.total}
            returnsCost={data.totalLoss.returns}
            returnsOrders={data.returnsCostOrders}
            codLoss={data.totalLoss.cod}
            codOrders={data.codLossOrders}
            potentialSavings={data.totalLoss.potentialSavings}
            currency={currency}
            periodLabel={t(PERIOD_LABEL_KEYS[period])}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <ReturnRateGauge value={data.kpis.returnRate.current} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-center py-6">
                <CODSuccessGauge value={data.kpis.codSuccessRate.current} />
              </CardContent>
            </Card>
            <MetricCard
              label={t("dashboard.avgDaysToReturn")}
              value={`${data.kpis.avgDaysToReturn.current.toFixed(1)}d`}
              change={data.kpis.avgDaysToReturn.change}
              sparkline={<TrendSparkline data={data.kpis.returnRate.sparkline} color="#4f46e5" />}
            />
            <MetricCard
              label={t("dashboard.costPerReturn")}
              value={`SAR ${Math.round(data.kpis.costPerReturn.current).toLocaleString()}`}
              change={data.kpis.costPerReturn.change}
              sparkline={<TrendSparkline data={data.kpis.codSuccessRate.sparkline} color="#f59e0b" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ReturnCodTrendChart data={data.returnTrend} />
            <CityHeatmap data={data.lossByCity} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <QuickAlerts insights={data.quickInsights} />
            <TopReturnedProducts items={data.topReturnedProducts} />
          </div>
        </>
      )}
    </div>
  );
}
