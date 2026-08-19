"use client";

import { Menu, Languages } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface HeaderProps {
  title: string;
  userName?: string;
  company?: string;
  alertCount?: number;
  onMenuClick?: () => void;
}

export function Header({ title, userName, company, alertCount = 0, onMenuClick }: HeaderProps) {
  const { t, toggleLocale } = useLanguage();

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-slate-100 lg:hidden" onClick={onMenuClick} aria-label={t("header.menu")}>
          <Menu className="h-5 w-5 text-primary" />
        </button>
        <h1 className="truncate text-lg font-semibold tracking-tight text-primary">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary"
          onClick={toggleLocale}
          aria-label={t("lang.label")}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{t("lang.switch")}</span>
        </button>

        <NotificationBell alertCount={alertCount} />

        <UserMenu userName={userName} company={company} />
      </div>
    </header>
  );
}
