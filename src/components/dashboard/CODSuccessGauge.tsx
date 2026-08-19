import { Gauge } from "@/components/dashboard/ReturnRateGauge";
import { useLanguage } from "@/components/LanguageProvider";

export function CODSuccessGauge({ value }: { value: number }) {
  const { t } = useLanguage();
  return <Gauge value={value} label={t("gauge.codSuccessRate")} invert />;
}
