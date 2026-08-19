import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import type { CodResponse } from "@/types";

export function CODTimeAnalysis({ byDayOfWeek, byTimeOfDay }: { byDayOfWeek: CodResponse["byDayOfWeek"]; byTimeOfDay: CodResponse["byTimeOfDay"] }) {
  const { t } = useLanguage();
  const best = [...byTimeOfDay].sort((a, b) => a.rejectionRate - b.rejectionRate)[0];
  const worst = [...byTimeOfDay].sort((a, b) => b.rejectionRate - a.rejectionRate)[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("chart.rejectionByDayOfWeek")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayOfWeek} margin={{ left: -16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rejectionRate" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm text-text-secondary">{t("chart.gulfWeekendNote")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("chart.rejectionByTimeOfDay")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byTimeOfDay} margin={{ left: -16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="slot" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rejectionRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {best && worst && (
            <p className="mt-3 text-sm text-text-secondary">
              <span className="font-medium text-primary">{best.slot}</span> {t("chart.lowestVsHighest")}{" "}
              <span className="font-medium text-primary">{worst.slot}</span>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
