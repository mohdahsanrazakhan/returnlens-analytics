import { useLanguage } from "@/components/LanguageProvider";

export function ImplementationSteps({ steps }: { steps: string[] }) {
  const { t } = useLanguage();
  if (steps.length === 0) return null;
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">{t("rec.howToImplement")}</h4>
      <ol className="flex flex-col gap-1">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-primary">
            <span className="font-semibold text-accent">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
