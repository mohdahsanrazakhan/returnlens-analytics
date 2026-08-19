import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  change: number; // percentage-point change, positive = went up
  isGoodDirection?: "up" | "down"; // "down" means a decrease is the good outcome (e.g. return rate)
}

export function TrendIndicator({ change, isGoodDirection = "down" }: TrendIndicatorProps) {
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-text-muted">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }

  const wentUp = change > 0;
  const isGood = isGoodDirection === "up" ? wentUp : !wentUp;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        isGood ? "text-success" : "text-danger"
      )}
    >
      {wentUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}
