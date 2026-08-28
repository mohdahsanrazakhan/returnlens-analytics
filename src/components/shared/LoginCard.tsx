"use client";

import Image from "next/image";
import { Languages } from "lucide-react";
import { LoginForm } from "@/components/shared/LoginForm";
import { useLanguage } from "@/components/LanguageProvider";

// Client wrapper around the login branding + form so it can read the language
// context (the parent page stays a server component for the `auth()` redirect check).
export function LoginCard() {
  const { t, toggleLocale } = useLanguage();

  return (
    <div className="relative w-full max-w-md">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          onClick={toggleLocale}
          aria-label={t("lang.label")}
        >
          <Languages className="h-4 w-4" />
          <span>{t("lang.switch")}</span>
        </button>
      </div>

      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent shadow-[0_0_0_6px_rgba(79,70,229,0.15)]">
          <Image src="/returnlens.webp" alt="" width={24} height={24} className="h-6 w-6" priority />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("app.name")}</h1>
        <p className="text-sm text-slate-400">{t("app.tagline")}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-2xl sm:p-8">
        <LoginForm />
        <div className="mt-6 rounded-lg bg-background p-3 text-center text-xs text-text-secondary">
          {t("login.demoCredentials")} <span className="font-medium text-primary">demo@returnlens.com</span> /{" "}
          <span className="font-medium text-primary">ReturnLens@2026!</span>
        </div>
      </div>
    </div>
  );
}
