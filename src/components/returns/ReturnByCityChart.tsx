"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

export function ReturnByCityChart({ data }: { data: ReturnsResponse["byCity"] }) {
  const { t } = useLanguage();
  const avg = data.length ? data.reduce((s, d) => s + d.returnRate, 0) / data.length : 0;
  const chartData = data.map((d) => ({ ...d, cityLabel: t(`city.${d.city}`) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.returnsByCity")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="cityLabel" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <ReferenceLine y={avg} stroke="#4f46e5" strokeDasharray="4 4" label={{ value: t("chart.gulfAvg"), fontSize: 11, fill: "#4f46e5" }} />
              <Bar dataKey="returnRate" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
