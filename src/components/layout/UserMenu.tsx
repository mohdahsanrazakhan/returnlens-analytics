"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Pencil, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ userName, company }: { userName?: string; company?: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const name = userName ?? "Demo User";

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("header.account")}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white shadow-[0_0_0_2px_rgba(79,70,229,0.15)] transition-shadow hover:shadow-[0_0_0_3px_rgba(79,70,229,0.25)]"
      >
        {getInitials(name)}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute end-0 top-full z-[200] mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          )}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-primary">{name}</p>
            {company && <p className="text-xs text-text-muted">{company}</p>}
          </div>

          <div className="flex flex-col p-1.5">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-slate-100 hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
              {t("header.editProfile")}
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              {t("header.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
