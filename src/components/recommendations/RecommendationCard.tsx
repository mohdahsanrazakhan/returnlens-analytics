"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ImpactEstimate } from "@/components/recommendations/ImpactEstimate";
import { ImplementationSteps } from "@/components/recommendations/ImplementationSteps";
import { useLanguage } from "@/components/LanguageProvider";
import type { RecommendationLite } from "@/types";

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-danger",
  high: "bg-risk-high",
  medium: "bg-warning",
  low: "bg-success",
};
const PRIORITY_VARIANT: Record<string, "critical" | "danger" | "warning" | "default"> = {
  critical: "critical",
  high: "danger",
  medium: "warning",
  low: "default",
};

export function RecommendationCard({
  rec,
  onStatusChange,
}: {
  rec: RecommendationLite;
  onStatusChange: (id: string, status: RecommendationLite["status"]) => void;
}) {
  const [updating, setUpdating] = React.useState(false);
  const { t } = useLanguage();

  async function updateStatus(status: RecommendationLite["status"]) {
    setUpdating(true);
    try {
      await onStatusChange(rec._id, status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card className={rec.status === "dismissed" ? "opacity-50" : undefined}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={PRIORITY_VARIANT[rec.priority]}>
            <span className={`me-1.5 inline-block h-2 w-2 rounded-full ${PRIORITY_DOT[rec.priority]}`} />
            {t(`risk.${rec.priority}`)}
          </Badge>
          {rec.isAIGenerated && <Badge variant="accent">{t("rec.aiGenerated")}</Badge>}
        </div>

        <h3 className="text-lg font-semibold text-primary">{rec.title}</h3>

        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("rec.problem")}</h4>
          <p className="text-sm text-text-secondary">{rec.problem}</p>
        </div>

        <ImpactEstimate savings={rec.estimatedSavings} percent={rec.estimatedSavingsPercent} />

        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("rec.recommendation")}</h4>
          <p className="text-sm text-primary">{rec.recommendation}</p>
        </div>

        <ImplementationSteps steps={rec.implementationSteps} />

        {rec.dataPoints.length > 0 && (
          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("rec.supportingData")}</h4>
            <div className="rl-table overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-start font-semibold text-text-secondary">{t("table.metric")}</th>
                    <th className="p-2 text-start font-semibold text-text-secondary">{t("table.current")}</th>
                    <th className="p-2 text-start font-semibold text-text-secondary">{t("table.benchmark")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.dataPoints.map((dp, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-2 text-primary">{dp.metric}</td>
                      <td className="p-2 tabular-nums text-primary">{dp.currentValue}</td>
                      <td className="p-2 tabular-nums text-text-secondary">{dp.benchmarkValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-text-secondary">
          <span>
            {t("rec.difficulty")}: <span className="font-medium capitalize text-primary">{t(`difficulty.${rec.implementationDifficulty}`)}</span> ·{" "}
            {t("rec.time")}:{" "}
            <span className="font-medium text-primary">{rec.timeToImplement}</span>
          </span>
          <Select
            value={rec.status}
            disabled={updating}
            onChange={(e) => updateStatus(e.target.value as RecommendationLite["status"])}
            className="w-auto"
          >
            <option value="new">{t("recStatus.new")}</option>
            <option value="viewed">{t("recStatus.viewed")}</option>
            <option value="implementing">{t("recStatus.implementing")}</option>
            <option value="implemented">{t("recStatus.implemented")}</option>
            <option value="dismissed">{t("recStatus.dismissed")}</option>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={updating} onClick={() => updateStatus("implementing")}>
            {t("button.markImplementing")}
          </Button>
          <Button size="sm" variant="ghost" disabled={updating} onClick={() => updateStatus("dismissed")}>
            {t("button.dismiss")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
