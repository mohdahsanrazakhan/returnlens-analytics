import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: PaginationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-text-secondary">
      <span className="tabular-nums">
        Page {page} of {totalPages} · {total.toLocaleString()} total
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {t("common.previous")}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          {t("common.next")}
        </Button>
      </div>
    </div>
  );
}
