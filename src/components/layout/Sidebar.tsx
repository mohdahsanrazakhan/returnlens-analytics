"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  RotateCcw,
  Wallet,
  Package,
  Users,
  Lightbulb,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

const NAV_ITEMS = [
  { href: "/dashboard", key: "nav.overview", icon: LayoutDashboard },
  { href: "/returns", key: "nav.returns", icon: RotateCcw },
  { href: "/cod", key: "nav.cod", icon: Wallet },
  { href: "/products", key: "nav.products", icon: Package },
  { href: "/customers", key: "nav.customers", icon: Users },
  { href: "/recommendations", key: "nav.recommendations", icon: Lightbulb },
  { href: "/settings", key: "nav.settings", icon: Settings },
] as const;

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = React.useState(false);
  const isMobile = Boolean(onClose);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-e border-border bg-background transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[76px]" : "w-64",
        className
      )}
    >
      <div className={cn("flex items-center gap-2 px-5 py-5", collapsed && !isMobile && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-[0_0_0_4px_rgba(9,13,22,0.1)]">
          <Image src="/returnlens.webp" alt="" width={16} height={16} className="h-4 w-4" priority />
        </div>
        {(!collapsed || isMobile) && <span className="flex-1 text-lg font-bold tracking-tight text-primary">{t("app.name")}</span>}
        {isMobile ? (
          <button
            type="button"
            onClick={onClose}
            title={t("sidebar.close")}
            aria-label={t("sidebar.close")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary",
              collapsed && "hidden"
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && !isMobile && (
        <div className="flex justify-center px-3 pb-2">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title={t("sidebar.expand")}
            aria-label={t("sidebar.expand")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? t(item.key) : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-primary text-white shadow-[0_0_0_1px_rgba(9,13,22,0.4)]"
                  : "text-text-secondary hover:bg-slate-100 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.key && t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border px-3 py-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? t("header.logout") : undefined}
          aria-label={t("header.logout")}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && t("header.logout")}
        </button>
      </div>
    </aside>
  );
}
