"use client";

import { Dialog } from "@/components/ui/dialog";
import { Badge, riskBadgeVariant } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import { useLanguage } from "@/components/LanguageProvider";
import type { CustomerLite, OrderLite } from "@/types";

interface CustomerDetail {
  customer: CustomerLite;
  orders: OrderLite[];
  patterns: { totalOrdersConsidered: number; returnedCount: number; codRejectionRateRecent: number; mostCommonReturnTiming: string };
}

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-50",
  returned: "bg-red-50",
  cod_rejected: "bg-orange-50",
  cancelled: "bg-slate-50",
};

function recommendedActionKey(level: string) {
  switch (level) {
    case "critical":
      return "profile.actionCritical";
    case "high":
      return "profile.actionHigh";
    case "medium":
      return "profile.actionMedium";
    default:
      return "profile.actionDefault";
  }
}

export function CustomerProfileCard({ customerId, onClose }: { customerId: string | null; onClose: () => void }) {
  const { data, loading } = useApi<CustomerDetail>(customerId ? `/api/customers/${customerId}` : null);
  const { t } = useLanguage();

  return (
    <Dialog open={!!customerId} onClose={onClose} title={data?.customer.name ?? t("profile.title")}>
      {loading || !data ? (
        <LoadingSpinner label={t("profile.loading")} />
      ) : (
        <div className="flex flex-col gap-6">
          <section className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="font-medium text-primary">{data.customer.email}</span>
            <span>·</span>
            <span>{data.customer.phone}</span>
            <span>·</span>
            <span>
              {t(`city.${data.customer.city}`)}, {data.customer.country}
            </span>
          </section>

          <section className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">{t("profile.riskScore")}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-danger" style={{ width: `${data.customer.riskScore}%` }} />
                </div>
                <span className="text-sm font-semibold tabular-nums text-primary">{data.customer.riskScore}/100</span>
              </div>
            </div>
            <Badge variant={riskBadgeVariant(data.customer.riskLevel)}>{t(`risk.${data.customer.riskLevel}`)}</Badge>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-primary">{t("profile.riskFactors")}</h3>
            <ul className="flex flex-col gap-1.5">
              {data.customer.riskFactors.map((f, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-text-secondary">
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-primary">{t("profile.behavioralPattern")}</h3>
            <p className="text-sm text-text-secondary">
              {t("profile.behaviorPrefix")} {data.patterns.returnedCount} {t("profile.behaviorReturnsOutOf")} {data.patterns.totalOrdersConsidered}{" "}
              {t("profile.behaviorOrders")} {data.patterns.codRejectionRateRecent}%.{" "}
              {data.patterns.mostCommonReturnTiming === "1-2 days after delivery (impulse returns)"
                ? t("profile.impulseReturns")
                : t("profile.spreadReturns")}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-primary">{t("profile.orderHistory")}</h3>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
              {data.orders.map((o) => (
                <div key={o._id} className={`flex items-center justify-between border-b border-border px-3 py-2 text-xs last:border-b-0 ${STATUS_STYLES[o.status]}`}>
                  <span className="font-medium text-primary">{o.orderId}</span>
                  <span className="text-text-muted">{new Date(o.createdAt).toLocaleDateString()}</span>
                  <span className="tabular-nums text-primary">{o.payment.currency} {o.payment.totalAmount}</span>
                  <span className="capitalize text-text-secondary">{t(`orderStatus.${o.status}`)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-slate-50 p-4 text-sm">
            <span className="font-semibold text-primary">{t("profile.recommendedAction")} </span>
            {t(recommendedActionKey(data.customer.riskLevel))}
          </section>
        </div>
      )}
    </Dialog>
  );
}
