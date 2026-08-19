"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
  children: React.ReactNode;
}

// Click-to-toggle info popover for a plain icon trigger. Same open/close pattern as
// UserMenu and NotificationBell (click-outside + Escape to dismiss), so it behaves
// consistently with the rest of the app's dropdowns and works on touch, not just hover.
export function InfoTooltip({ icon, label, className, children }: InfoTooltipProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className="rounded-md p-1 text-inherit transition-opacity hover:opacity-70"
      >
        {icon}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute end-0 top-full z-[200] mt-2 w-64 rounded-xl border border-border bg-surface p-3.5 text-start shadow-2xl"
        >
          {children}
        </div>
      )}
    </div>
  );
}
