"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

export function ReturnTimeline({ data }: { data: ReturnsResponse["timeline"] }) {
  const { t } = useLanguage();
  const within7 = data.filter((d) => ["1", "2", "3", "4-7"].includes(d.daysAfterDelivery)).reduce((s, d) => s + d.percentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.whenDoCustomersReturn")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="daysAfterDelivery" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="percentage" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          <span className="font-semibold text-primary">{within7.toFixed(0)}%</span> {t("chart.returnWindowNote")}
        </p>
      </CardContent>
    </Card>
  );
}
