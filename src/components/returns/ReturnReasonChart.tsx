"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

const REASON_COLORS: Record<string, string> = {
  changed_mind: "#94a3b8",
  wrong_size: "#4f46e5",
  not_as_described: "#f59e0b",
  damaged: "#f43f5e",
  defective: "#e11d48",
  wrong_item: "#a855f7",
};

export function ReturnReasonChart({ data }: { data: ReturnsResponse["byReason"] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({ name: t(`reason.${d.reason}`), value: d.percentage, reason: d.reason }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.returnReasons")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {chartData.map((entry) => (
                  <Cell key={entry.reason} fill={REASON_COLORS[entry.reason]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {chartData.map((entry) => (
            <div key={entry.reason} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: REASON_COLORS[entry.reason] }}
              />
              {entry.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
