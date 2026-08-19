"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLanguage } from "@/components/LanguageProvider";
import type { DashboardResponse } from "@/types";

export function CityHeatmap({ data }: { data: DashboardResponse["lossByCity"] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({ ...d, cityLabel: t(`city.${d.city}`) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.whereLosingMoney")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title={t("empty.noLosses")} />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="cityLabel" width={80} stroke="#94a3b8" fontSize={12} />
                <Tooltip formatter={(v) => `SAR ${Number(v).toLocaleString()}`} />
                <Bar dataKey="returnLoss" stackId="loss" name={t("chart.returnCostLegend")} fill="#4f46e5" radius={[0, 0, 0, 0]} />
                <Bar dataKey="codLoss" stackId="loss" name={t("chart.codLossLegend")} fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
