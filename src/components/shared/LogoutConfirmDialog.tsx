"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutConfirmDialog({ open, onClose }: LogoutConfirmDialogProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, loading]);

  if (!mounted || !open) return null;

  function handleConfirm() {
    setLoading(true);
    signOut({ callbackUrl: "/login" });
  }

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <LogOut className="h-7 w-7 text-accent" />
        </div>

        <h2 id="logout-title" className="text-xl font-bold tracking-tight text-primary">
          {t("logout.title")}
        </h2>
        <p id="logout-desc" className="mt-1.5 text-sm text-text-secondary">
          {t("logout.message")}
        </p>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            {t("logout.cancel")}
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleConfirm} disabled={loading}>
            {loading ? t("logout.loggingOut") : t("logout.confirm")}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
