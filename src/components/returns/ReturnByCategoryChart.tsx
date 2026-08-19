"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

function colorFor(rate: number) {
  if (rate > 20) return "#f43f5e";
  if (rate > 10) return "#f59e0b";
  return "#10b981";
}

export function ReturnByCategoryChart({ data }: { data: ReturnsResponse["byCategory"] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({ ...d, categoryLabel: t(`category.${d.category}`) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.returnsByCategory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="#94a3b8" fontSize={12} />
              <YAxis type="category" dataKey="categoryLabel" width={110} stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip formatter={(v, name) => (name === "returnRate" ? `${v}%` : v)} />
              <Bar dataKey="returnRate" radius={[0, 4, 4, 0]} maxBarSize={28}>
                {chartData.map((d) => (
                  <Cell key={d.category} fill={colorFor(d.returnRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
