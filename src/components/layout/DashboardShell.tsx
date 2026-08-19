"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/components/LanguageProvider";

interface DashboardShellProps {
  title?: string;
  userName?: string;
  company?: string;
  alertCount?: number;
  children: React.ReactNode;
}

const TITLE_KEYS: Record<string, string> = {
  "/dashboard": "nav.overview",
  "/returns": "nav.returns",
  "/cod": "nav.cod",
  "/products": "nav.products",
  "/customers": "nav.customers",
  "/recommendations": "nav.recommendations",
  "/settings": "nav.settings",
};

export function DashboardShell({ title, userName, company, alertCount, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const resolvedTitle = title ?? t(TITLE_KEYS[pathname] ?? "nav.default");

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar className="hidden lg:flex" />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={resolvedTitle} userName={userName} company={company} alertCount={alertCount} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
