import { TrendingDown, ArrowUpRight, AlertTriangle } from "lucide-react";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { useLanguage } from "@/components/LanguageProvider";

interface LossCalculatorProps {
  totalLoss: number;
  returnsCost: number;
  returnsOrders: number;
  codLoss: number;
  codOrders: number;
  potentialSavings: number;
  currency: "SAR" | "AED";
  periodLabel: string;
}

// Signature "Capital Leakage" hero card, see PROJECT-3-RETURNLENS-ANALYTICS.md §8.3
export function LossCalculator({
  totalLoss,
  returnsCost,
  returnsOrders,
  codLoss,
  codOrders,
  potentialSavings,
  currency,
  periodLabel,
}: LossCalculatorProps) {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-10">
      {/* Soft warm alert wash instead of the old dark-mode ambient blurs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(720px 220px at 50% -10%, rgba(244,63,94,0.07), transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-critical">
              {t("hero.badge")}
            </span>
          </div>
          <InfoTooltip icon={<AlertTriangle className="h-4 w-4 text-text-muted" />} label={t("hero.calcInfoLabel")}>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("hero.calcInfoLabel")}</p>
            <dl className="flex flex-col gap-2.5">
              <div>
                <dt className="text-xs font-semibold text-primary">{t("hero.calcReturnsCostLabel")}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-text-secondary">{t("hero.calcReturnsCostBody")}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-primary">{t("hero.calcCodLossLabel")}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-text-secondary">{t("hero.calcCodLossBody")}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-primary">{t("hero.calcCouldSaveLabel")}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-text-secondary">{t("hero.calcCouldSaveBody")}</dd>
              </div>
            </dl>
          </InfoTooltip>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <TrendingDown className="h-4 w-4" />
          {t("hero.subtitle")}
        </div>

        <div className="animate-loss-glow-light mt-3 bg-gradient-to-r from-[#E11D48] to-[#EA580C] bg-clip-text text-5xl font-extrabold tracking-tight tabular-nums text-transparent sm:text-[3.25rem]">
          <CurrencyDisplay amountSAR={totalLoss} currency={currency} />
        </div>
        <p className="mt-1 text-sm text-text-muted">{periodLabel}</p>

        <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-rose-700">{t("hero.returnsCost")}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              <CurrencyDisplay amountSAR={returnsCost} currency={currency} />
            </p>
            <p className="mt-1 text-xs text-rose-800">
              {returnsOrders.toLocaleString()} {t("hero.orders")}
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-700">{t("hero.codLosses")}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
              <CurrencyDisplay amountSAR={codLoss} currency={currency} />
            </p>
            <p className="mt-1 text-xs text-orange-800">
              {codOrders.toLocaleString()} {t("hero.orders")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-xs text-emerald-700">{t("hero.recoverable")}</span>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {t("hero.couldSave")} <CurrencyDisplay amountSAR={potentialSavings} currency={currency} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
