import { Card, CardContent } from "@/components/ui/card";
import { TrendIndicator } from "@/components/shared/TrendIndicator";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  changeIsGood?: "up" | "down"; // which direction of change counts as good news
  sublabel?: string;
  sparkline?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, change, changeIsGood = "down", sublabel, sparkline, className }: MetricCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</span>
        <span className="text-2xl font-bold tracking-tight tabular-nums text-primary">{value}</span>
        <div className="flex items-center justify-between">
          {change !== undefined ? <TrendIndicator change={change} isGoodDirection={changeIsGood} /> : <span />}
          {sublabel && <span className="text-xs text-text-muted">{sublabel}</span>}
        </div>
        {sparkline && <div className="h-10">{sparkline}</div>}
      </CardContent>
    </Card>
  );
}
