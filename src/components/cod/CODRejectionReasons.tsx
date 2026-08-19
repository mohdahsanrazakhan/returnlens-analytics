"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

const COLORS: Record<string, string> = {
  customer_refused: "#f43f5e",
  customer_unavailable: "#f59e0b",
  wrong_address: "#4f46e5",
  cannot_pay: "#0ea5e9",
  fake_order: "#e11d48",
};

export function CODRejectionReasons({ data }: { data: CodResponse["byReason"] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({ name: t(`codReason.${d.reason}`), value: d.percentage, reason: d.reason }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.codRejectionReasons")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {chartData.map((entry) => (
                  <Cell key={entry.reason} fill={COLORS[entry.reason]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {chartData.map((entry) => (
            <div key={entry.reason} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[entry.reason] }} />
              {entry.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
