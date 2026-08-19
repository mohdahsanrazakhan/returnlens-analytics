"use client";

import * as React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import type { ReturnsResponse } from "@/types";

type Mode = "rate" | "count" | "cost";

export function ReturnTrendChart({ data }: { data: ReturnsResponse["trend"] }) {
  const [mode, setMode] = React.useState<Mode>("rate");
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("chart.returnTrend")}</CardTitle>
        <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="w-auto">
          <option value="rate">{t("chart.byRate")}</option>
          <option value="count">{t("chart.byCount")}</option>
          <option value="cost">{t("chart.byCost")}</option>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              {mode === "rate" && <ReferenceLine y={15} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: t("chart.industryAvg"), fontSize: 11, fill: "#94a3b8" }} />}
              <Area type="monotone" dataKey={mode} stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
