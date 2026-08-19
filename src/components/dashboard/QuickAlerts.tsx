import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";
import type { DashboardResponse } from "@/types";

const SEVERITY_STYLES: Record<string, { dot: string; bg: string }> = {
  critical: { dot: "bg-danger", bg: "bg-red-50" },
  warning: { dot: "bg-warning", bg: "bg-amber-50" },
  good: { dot: "bg-success", bg: "bg-emerald-50" },
};

export function QuickAlerts({ insights }: { insights: DashboardResponse["quickInsights"] }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.topIssues")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight, i) => {
          const style = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.warning;
          return (
            <Link
              key={i}
              href={insight.link}
              className={cn("flex items-center gap-3 rounded-lg p-3 text-sm transition-colors hover:opacity-90", style.bg)}
            >
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
              <span className="text-primary">{insight.text}</span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
