"use client";

import { Select } from "@/components/ui/input";
import { useLanguage } from "@/components/LanguageProvider";

export type Period = "7d" | "30d" | "90d" | "12m";

const PERIODS: Period[] = ["7d", "30d", "90d", "12m"];

export function DateRangePicker({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  const { t } = useLanguage();

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as Period)}
      className="w-auto"
      aria-label={t("common.dateRange")}
    >
      {PERIODS.map((p) => (
        <option key={p} value={p}>
          {t(`period.${p}`)}
        </option>
      ))}
    </Select>
  );
}
