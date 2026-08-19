import { Dialog } from "@/components/ui/dialog";
import { Gauge } from "@/components/dashboard/ReturnRateGauge";
import { ProductRiskBadge } from "@/components/products/ProductRiskBadge";
import { useLanguage } from "@/components/LanguageProvider";
import type { ProductLite } from "@/types";

function recommendationKey(topReason: string | null | undefined) {
  switch (topReason) {
    case "wrong_size":
      return "product.recSize";
    case "damaged":
      return "product.recDamaged";
    case "not_as_described":
      return "product.recDescribed";
    default:
      return "product.recDefault";
  }
}

export function ProductDetailModal({ product, onClose }: { product: ProductLite | null; onClose: () => void }) {
  const { t } = useLanguage();
  if (!product) return null;

  const reasonEntries = Object.entries(product.returnStats.returnsByReason).sort((a, b) => b[1] - a[1]);
  const maxReasonCount = Math.max(...reasonEntries.map(([, v]) => v), 1);

  return (
    <Dialog open={!!product} onClose={onClose} title={product.nameEn}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <span className="font-medium text-primary">{product.sku}</span>
          <span>·</span>
          <span>{t(`category.${product.category}`)}</span>
          <span>·</span>
          <span>SAR {product.sellingPrice}</span>
          <ProductRiskBadge level={product.riskLevel} />
        </div>

        <div className="flex items-center gap-8">
          <Gauge value={product.returnStats.returnRate} label={t("gauge.returnRate")} />
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <span className="font-semibold text-primary">{product.returnStats.totalSold}</span> {t("product.unitsSold")}
            </p>
            <p>
              <span className="font-semibold text-primary">{product.returnStats.totalReturned}</span> {t("product.unitsReturned")}
            </p>
            <p>
              {t("product.avgPrefix")} <span className="font-semibold text-primary">{product.returnStats.avgDaysToReturn}</span>{" "}
              {t("product.daysToReturn")}
            </p>
            <p>
              {t("product.codRejectionRate")} <span className="font-semibold text-primary">{product.codStats.codRejectionRate}%</span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-primary">{t("product.returnReasonsBreakdown")}</h3>
          <div className="flex flex-col gap-2">
            {reasonEntries.map(([reason, count]) => (
              <div key={reason} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-text-secondary">{t(`reason.${reason}`)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(count / maxReasonCount) * 100}%` }} />
                </div>
                <span className="w-8 text-end text-xs tabular-nums text-primary">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <span className="font-semibold text-primary">{t("product.recommendation")} </span>
          {t(recommendationKey(product.returnStats.topReturnReason))}
        </div>
      </div>
    </Dialog>
  );
}
