"use client";

import * as React from "react";
import { useReturns } from "@/hooks/useReturns";
import { MetricCard } from "@/components/shared/MetricCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DateRangePicker, type Period } from "@/components/shared/DateRangePicker";
import { ReturnTrendChart } from "@/components/returns/ReturnTrendChart";
import { ReturnReasonChart } from "@/components/returns/ReturnReasonChart";
import { ReturnByCategoryChart } from "@/components/returns/ReturnByCategoryChart";
import { ReturnByCityChart } from "@/components/returns/ReturnByCityChart";
import { ReturnByChannelChart } from "@/components/returns/ReturnByChannelChart";
import { ReturnTimeline } from "@/components/returns/ReturnTimeline";
import { DeliveryPartnerTable } from "@/components/returns/DeliveryPartnerTable";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ReturnsPage() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const { data, loading, error } = useReturns({ period });
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <DateRangePicker value={period} onChange={setPeriod} />
      </div>

      {error && (
        <Card>
          <CardContent className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {loading || !data ? (
        <LoadingSpinner label={t("loading.returns")} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={t("metric.totalReturns")} value={data.overview.totalReturns.toLocaleString()} />
            <MetricCard label={t("metric.returnCost")} value={`SAR ${data.overview.returnCost.toLocaleString()}`} />
            <MetricCard label={t("metric.avgProcessingTime")} value={`${data.overview.avgProcessingDays}d`} />
            <MetricCard label={t("metric.returnToRefundTime")} value={`${data.overview.avgRefundDays}d`} />
          </div>

          <ReturnTrendChart data={data.trend} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ReturnReasonChart data={data.byReason} />
            <ReturnByCategoryChart data={data.byCategory} />
          </div>

          <ReturnByCityChart data={data.byCity} />
          <ReturnTimeline data={data.timeline} />
          <ReturnByChannelChart data={data.byChannel} />
          <DeliveryPartnerTable data={data.byDeliveryPartner} />
        </>
      )}
    </div>
  );
}
