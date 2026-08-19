import { Badge, riskBadgeVariant } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";

export function ProductRiskBadge({ level }: { level: string }) {
  const { t } = useLanguage();
  return <Badge variant={riskBadgeVariant(level)}>{t(`risk.${level}`)}</Badge>;
}
