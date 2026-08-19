import { cn } from "@/lib/utils";
import { convertCurrency } from "@/lib/cost-calculator";

interface CurrencyDisplayProps {
  amountSAR: number;
  currency?: "SAR" | "AED";
  className?: string;
}

export function CurrencyDisplay({ amountSAR, currency = "SAR", className }: CurrencyDisplayProps) {
  const amount = convertCurrency(amountSAR, currency);
  return (
    <span className={cn("tabular-nums", className)}>
      {currency} {Math.round(amount).toLocaleString("en-US")}
    </span>
  );
}
