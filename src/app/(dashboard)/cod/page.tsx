"use client";

import * as React from "react";
import { useCOD } from "@/hooks/useCOD";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DateRangePicker, type Period } from "@/components/shared/DateRangePicker";
import { CODOverviewCards } from "@/components/cod/CODOverviewCards";
import { CODvsPrepaidChart } from "@/components/cod/CODvsPrepaidChart";
import { CODSuccessByCity } from "@/components/cod/CODSuccessByCity";
import { CODValueAnalysis } from "@/components/cod/CODValueAnalysis";
import { CODRejectionReasons } from "@/components/cod/CODRejectionReasons";
import { CODTimeAnalysis } from "@/components/cod/CODTimeAnalysis";
import { CODRecoveryTracker } from "@/components/cod/CODRecoveryTracker";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function CodPage() {
  const [period, setPeriod] = React.useState<Period>("30d");
  const { data, loading, error } = useCOD({ period });
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
        <LoadingSpinner label={t("loading.cod")} />
      ) : (
        <>
          <CODOverviewCards overview={data.overview} />
          <CODvsPrepaidChart data={data.vsPrepaid} />
          <CODSuccessByCity data={data.byCity} />
          <CODValueAnalysis data={data.byOrderValue} />
          <CODRejectionReasons data={data.byReason} />
          <CODTimeAnalysis byDayOfWeek={data.byDayOfWeek} byTimeOfDay={data.byTimeOfDay} />
          <CODRecoveryTracker data={data.recovery} totalRejections={data.overview.rejections} />
        </>
      )}
    </div>
  );
}
