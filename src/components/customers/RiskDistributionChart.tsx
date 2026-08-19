import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  distribution: { low: number; medium: number; high: number; critical: number };
}

const COLORS: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ea580c", critical: "#f43f5e" };

export function RiskDistributionChart({ distribution }: Props) {
  const { t } = useLanguage();
  const total = distribution.low + distribution.medium + distribution.high + distribution.critical || 1;
  const data = [
    { key: "low", name: t("risk.low"), count: distribution.low },
    { key: "medium", name: t("risk.medium"), count: distribution.medium },
    { key: "high", name: t("risk.high"), count: distribution.high },
    { key: "critical", name: t("risk.critical"), count: distribution.critical },
  ];
  const criticalShare = Math.round((distribution.critical / total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chart.riskScoreDistribution")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((d) => (
                  <Cell key={d.key} fill={COLORS[d.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          <span className="font-semibold text-primary">{criticalShare}%</span> {t("chart.criticalShareNote")}
        </p>
      </CardContent>
    </Card>
  );
}
