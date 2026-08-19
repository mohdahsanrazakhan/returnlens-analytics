import { useLanguage } from "@/components/LanguageProvider";

export function ImpactEstimate({ savings, percent }: { savings: number; percent: number }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
      <p className="text-sm text-emerald-800">
        {t("rec.estimatedSavings")} <span className="font-semibold">SAR {savings.toLocaleString()}</span>
      </p>
      <p className="text-sm text-emerald-800">
        {t("rec.rejectionReduction")} <span className="font-semibold">~{percent}%</span>
      </p>
    </div>
  );
}
