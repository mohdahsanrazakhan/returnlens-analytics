"use client";

import * as React from "react";
import { useApi } from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { GenerateButton } from "@/components/recommendations/GenerateButton";
import { Select } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import type { RecommendationLite } from "@/types";

export default function RecommendationsPage() {
  const [priority, setPriority] = React.useState("");
  const { t } = useLanguage();
  const { data, loading, refetch } = useApi<{ recommendations: RecommendationLite[] }>(
    `/api/recommendations${priority ? `?priority=${priority}` : ""}`
  );
  const [localOverrides, setLocalOverrides] = React.useState<Record<string, RecommendationLite["status"]>>({});

  async function handleStatusChange(id: string, status: RecommendationLite["status"]) {
    setLocalOverrides((prev) => ({ ...prev, [id]: status }));
    await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const recommendations = (data?.recommendations ?? []).map((r) => ({ ...r, status: localOverrides[r._id] ?? r.status }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-auto">
          <option value="">{t("common.allPriorities")}</option>
          <option value="critical">{t("risk.critical")}</option>
          <option value="high">{t("risk.high")}</option>
          <option value="medium">{t("risk.medium")}</option>
          <option value="low">{t("risk.low")}</option>
        </Select>
        <GenerateButton onGenerated={refetch} />
      </div>

      {loading ? (
        <LoadingSpinner label={t("loading.recommendations")} />
      ) : recommendations.length === 0 ? (
        <EmptyState title={t("rec.noRecommendations")} description={t("rec.noRecommendationsDesc")} />
      ) : (
        <div className="flex flex-col gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec._id} rec={rec} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
