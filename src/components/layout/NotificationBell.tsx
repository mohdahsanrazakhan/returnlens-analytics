"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, ArrowRight, Inbox } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useApi } from "@/hooks/useApi";
import { Badge, riskBadgeVariant } from "@/components/ui/badge";
import type { RecommendationLite } from "@/types";

// Real data, not decoration: reuses the same critical-recommendations feed the
// header badge count is computed from server-side in the dashboard layout.
export function NotificationBell({ alertCount = 0 }: { alertCount?: number }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [fetchEnabled, setFetchEnabled] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const { data, loading, error } = useApi<{ recommendations: RecommendationLite[] }>(
    fetchEnabled ? "/api/recommendations?priority=critical" : null
  );

  const alerts = React.useMemo(
    () => (data?.recommendations ?? []).filter((r) => r.status !== "dismissed" && r.status !== "implemented").slice(0, 6),
    [data]
  );

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleToggle() {
    setOpen((prev) => !prev);
    setFetchEnabled(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("header.alerts")}
        className="relative rounded-md p-2 transition-colors hover:bg-slate-100"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {alertCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white ring-2 ring-surface rtl:-left-0.5 rtl:right-auto">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-[200] mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-primary">{t("header.alerts")}</p>
            {alertCount > 0 && <Badge variant="critical">{alertCount}</Badge>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex flex-col gap-2 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            )}

            {!loading && error && <p className="p-4 text-sm text-danger">{t("common.networkError")}</p>}

            {!loading && !error && alerts.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <Inbox className="h-8 w-8 text-text-muted" />
                <p className="text-sm font-medium text-primary">{t("header.noAlerts")}</p>
                <p className="text-xs text-text-muted">{t("header.noAlertsDesc")}</p>
              </div>
            )}

            {!loading &&
              !error &&
              alerts.map((rec) => (
                <Link
                  key={rec._id}
                  href="/recommendations"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-1 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-background"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={riskBadgeVariant(rec.priority)}>{t(`risk.${rec.priority}`)}</Badge>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-success">
                      SAR {rec.estimatedSavings.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary">{rec.title}</p>
                  <p className="line-clamp-2 text-xs text-text-secondary">{rec.problem}</p>
                </Link>
              ))}
          </div>

          <Link
            href="/recommendations"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 border-t border-border px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-background"
          >
            {t("header.viewAllRecommendations")}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  );
}
