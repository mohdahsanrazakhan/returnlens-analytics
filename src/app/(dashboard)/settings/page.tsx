"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_COST_ASSUMPTIONS, RISK_THRESHOLDS } from "@/lib/constants";
import { RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [currency, setCurrency] = React.useState<"SAR" | "AED">("SAR");
  const [costs, setCosts] = React.useState(DEFAULT_COST_ASSUMPTIONS);
  const [saved, setSaved] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState<{ ok: boolean; text: string } | null>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Demo scope: cost assumptions are held client-side; a real deployment would
    // persist these per-account and feed them into the server-side calculators.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleReset() {
    setResetting(true);
    setResetMessage(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      setResetMessage({ ok: res.ok && json.success, text: json.success ? t("settings.resetSuccess") : json.error ?? t("settings.resetFailed") });
    } catch {
      setResetMessage({ ok: false, text: t("common.networkError") });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <Row label={t("settings.name")} value={session?.user?.name ?? "Demo User"} />
          <Row label={t("settings.email")} value={session?.user?.email ?? "demo@returnlens.com"} />
          <Row label={t("settings.company")} value={(session?.user as { company?: string })?.company ?? "Gulf Electronics Trading LLC"} />
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.costAssumptions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label={t("settings.currencyPreference")}>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as "SAR" | "AED")} className="w-32">
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
              </Select>
            </Field>
            <Field label={t("settings.avgReturnShipping")}>
              <Input
                type="number"
                min={0}
                max={1000}
                value={costs.avgReturnShippingCost}
                onChange={(e) => setCosts({ ...costs, avgReturnShippingCost: Number(e.target.value) })}
                className="w-32"
              />
            </Field>
            <Field label={t("settings.avgRestocking")}>
              <Input
                type="number"
                min={0}
                max={1000}
                value={costs.avgRestockingCost}
                onChange={(e) => setCosts({ ...costs, avgRestockingCost: Number(e.target.value) })}
                className="w-32"
              />
            </Field>
            <Field label={t("settings.avgCodRejectionCost")}>
              <Input
                type="number"
                min={0}
                max={1000}
                value={costs.avgCodRejectionCost}
                onChange={(e) => setCosts({ ...costs, avgCodRejectionCost: Number(e.target.value) })}
                className="w-32"
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="cta">{t("common.save")}</Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> {t("common.saved")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.riskScoreThresholds")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-text-secondary">
          {Object.entries(RISK_THRESHOLDS).map(([level, range]) => (
            <Row key={level} label={t(`risk.${level}`)} value={`${range.min} – ${range.max}`} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.demoData")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-text-secondary">{t("settings.demoDataDescription")}</p>
          <Button variant="destructive" onClick={handleReset} disabled={resetting} className="w-fit">
            <RefreshCw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? t("button.resetting") : t("button.resetDemoData")}
          </Button>
          {resetMessage && (
            <span className={`flex items-center gap-1 text-sm ${resetMessage.ok ? "text-success" : "text-danger"}`}>
              {resetMessage.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {resetMessage.text}
            </span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-b-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-primary">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-text-secondary">{label}</label>
      {children}
    </div>
  );
}
