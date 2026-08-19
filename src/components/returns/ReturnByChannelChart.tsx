"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

export function ReturnByChannelChart({ data }: { data: ReturnsResponse["byChannel"] }) {
  const { t } = useLanguage();
  const chartData = data.map((d) => ({ ...d, label: t(`channel.${d.channel}`) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.returnsByChannel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Bar dataKey="returnRate" name={t("chart.returnRateLegend")} fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="codRejectionRate" name={t("chart.codRejectionRateLegend")} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
