"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useLanguage } from "@/components/LanguageProvider";

export function GenerateButton({ onGenerated }: { onGenerated: () => void }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const { t } = useLanguage();

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recommendations/generate", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // No AI key on this demo deployment. Explain the feature instead of surfacing a raw error.
        if (res.status === 503) {
          setShowInfoModal(true);
        } else {
          setError(json.error ?? "Failed to generate recommendations");
        }
        return;
      }
      onGenerated();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="cta" onClick={handleClick} disabled={loading}>
        <Sparkles className="h-4 w-4" />
        {loading ? t("button.generating") : t("button.generateNew")}
      </Button>
      {error && <span className="text-xs text-danger">{error}</span>}

      <Dialog open={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <div className="flex flex-col gap-4 text-sm">
          <div className="-mt-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-primary">{t("aiModal.title")}</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{t("aiModal.whatItDoesLabel")}</span>
            <p className="text-text-secondary">{t("aiModal.whatItDoesBody")}</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-lg bg-background p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{t("aiModal.demoNoteLabel")}</span>
            <p className="text-text-secondary">{t("aiModal.demoNoteBody")}</p>
          </div>
          <Button variant="cta" className="self-end" onClick={() => setShowInfoModal(false)}>
            {t("aiModal.cta")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
