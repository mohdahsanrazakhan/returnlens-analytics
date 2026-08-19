import { Inbox } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-text-secondary">
      <Inbox className="h-8 w-8 text-text-muted" />
      <p className="text-sm font-medium text-primary">{title ?? t("empty.noData")}</p>
      {description && <p className="max-w-sm text-xs text-text-muted">{description}</p>}
    </div>
  );
}
