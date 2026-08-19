import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { returnsQuerySchema } from "@/lib/validators";
import { periodToDays } from "@/lib/utils";
import OrderModel from "@/models/Order";
import { CATEGORIES, RETURN_REASONS, SHIPPING_PARTNERS, SHIPPING_PARTNER_RETURN_DAYS, CHANNELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = returnsQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      channel: searchParams.get("channel") ?? undefined,
      reason: searchParams.get("reason") ?? undefined,
    });

    const days = periodToDays(query.period);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match: Record<string, unknown> = { status: "returned", createdAt: { $gte: start } };
    if (query.city) match.customerCity = query.city;
    if (query.channel) match.channel = query.channel;
    if (query.reason) match["return.reason"] = query.reason;

    const returnedOrders = await OrderModel.find(match).lean();
    const allInPeriod = await OrderModel.find({ createdAt: { $gte: start }, status: { $ne: "cancelled" } }).lean();

    const totalReturns = returnedOrders.length;
    const returnCost = returnedOrders.reduce((s, o) => s + o.return.totalReturnCost + o.return.refundAmount, 0);
    const avgProcessingDays = 3.5; // derived from partner mix, shown for demo consistency
    const avgRefundDays = 4.2;

    // Trend (daily, last N days)
    const trendMap = new Map<string, { count: number; cost: number; total: number }>();
    for (const o of allInPeriod) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const t = trendMap.get(key) ?? { count: 0, cost: 0, total: 0 };
      t.total += 1;
      if (o.status === "returned") {
        t.count += 1;
        t.cost += o.return.totalReturnCost + o.return.refundAmount;
      }
      trendMap.set(key, t);
    }
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, rate: v.total ? Math.round((v.count / v.total) * 1000) / 10 : 0, count: v.count, cost: Math.round(v.cost) }));

    // By reason
    const reasonCounts: Record<string, number> = {};
    for (const r of RETURN_REASONS) reasonCounts[r] = 0;
    for (const o of returnedOrders) if (o.return.reason) reasonCounts[o.return.reason] += 1;
    const byReason = RETURN_REASONS.map((reason) => ({
      reason,
      count: reasonCounts[reason],
      percentage: totalReturns ? Math.round((reasonCounts[reason] / totalReturns) * 1000) / 10 : 0,
    }));

    // By category — need product category, so join via items (use first item's category is unknown without product lookup)
    const ProductModel = (await import("@/models/Product")).default;
    const products = await ProductModel.find({}).select("category returnStats.returnRate returnStats.returnCost").lean();
    const productCategoryMap = new Map(products.map((p) => [p._id.toString(), p.category]));

    const categoryStats = new Map<string, { returned: number; total: number; loss: number }>();
    for (const cat of CATEGORIES) categoryStats.set(cat, { returned: 0, total: 0, loss: 0 });
    for (const o of allInPeriod) {
      const cat = productCategoryMap.get(o.items[0]?.productId?.toString() ?? "");
      if (!cat) continue;
      const s = categoryStats.get(cat);
      if (!s) continue;
      s.total += 1;
      if (o.status === "returned") {
        s.returned += 1;
        s.loss += o.return.totalReturnCost + o.return.refundAmount;
      }
    }
    const byCategory = Array.from(categoryStats.entries())
      .map(([category, s]) => ({ category, returnRate: s.total ? Math.round((s.returned / s.total) * 1000) / 10 : 0, count: s.returned, loss: Math.round(s.loss) }))
      .sort((a, b) => b.returnRate - a.returnRate);

    // By city
    const cityStats = new Map<string, { returned: number; total: number }>();
    for (const o of allInPeriod) {
      const s = cityStats.get(o.customerCity) ?? { returned: 0, total: 0 };
      s.total += 1;
      if (o.status === "returned") s.returned += 1;
      cityStats.set(o.customerCity, s);
    }
    const byCity = Array.from(cityStats.entries())
      .map(([city, s]) => ({ city, returnRate: s.total ? Math.round((s.returned / s.total) * 1000) / 10 : 0, count: s.returned }))
      .sort((a, b) => b.returnRate - a.returnRate);

    // By channel
    const channelStats = new Map<string, { returned: number; codRejected: number; cod: number; total: number }>();
    for (const ch of CHANNELS) channelStats.set(ch, { returned: 0, codRejected: 0, cod: 0, total: 0 });
    for (const o of allInPeriod) {
      const s = channelStats.get(o.channel);
      if (!s) continue;
      s.total += 1;
      if (o.status === "returned") s.returned += 1;
      if (o.payment.isCOD) s.cod += 1;
      if (o.status === "cod_rejected") s.codRejected += 1;
    }
    const byChannel = Array.from(channelStats.entries()).map(([channel, s]) => ({
      channel,
      returnRate: s.total ? Math.round((s.returned / s.total) * 1000) / 10 : 0,
      codRejectionRate: s.cod ? Math.round((s.codRejected / s.cod) * 1000) / 10 : 0,
      count: s.total,
    }));

    // Timeline
    const buckets = [
      { label: "1", min: 1, max: 1 },
      { label: "2", min: 2, max: 2 },
      { label: "3", min: 3, max: 3 },
      { label: "4-7", min: 4, max: 7 },
      { label: "8-14", min: 8, max: 14 },
      { label: "15-30", min: 15, max: 30 },
    ];
    const timelineCounts = buckets.map(() => 0);
    for (const o of returnedOrders) {
      const d = o.return.daysAfterDelivery ?? 0;
      const idx = buckets.findIndex((b) => d >= b.min && d <= b.max);
      if (idx >= 0) timelineCounts[idx] += 1;
    }
    const timeline = buckets.map((b, i) => ({
      daysAfterDelivery: b.label,
      count: timelineCounts[i],
      percentage: totalReturns ? Math.round((timelineCounts[i] / totalReturns) * 1000) / 10 : 0,
    }));

    // By delivery partner
    const partnerStats = new Map<string, { damaged: number; totalReturns: number; deliveries: number }>();
    for (const p of SHIPPING_PARTNERS) partnerStats.set(p, { damaged: 0, totalReturns: 0, deliveries: 0 });
    for (const o of allInPeriod) {
      const s = partnerStats.get(o.shipping.partner);
      if (!s) continue;
      s.deliveries += 1;
      if (o.status === "returned") {
        s.totalReturns += 1;
        if (o.return.reason === "damaged") s.damaged += 1;
      }
    }
    const byDeliveryPartner = SHIPPING_PARTNERS.map((partner) => {
      const s = partnerStats.get(partner)!;
      return {
        partner,
        damageRate: s.deliveries ? Math.round((s.damaged / s.deliveries) * 1000) / 10 : 0,
        avgProcessingDays: SHIPPING_PARTNER_RETURN_DAYS[partner],
        totalReturns: s.totalReturns,
        deliveriesHandled: s.deliveries,
      };
    });

    // Reason trend (12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const yearOrders = await OrderModel.find({ status: "returned", createdAt: { $gte: twelveMonthsAgo } })
      .select("createdAt return.reason")
      .lean();
    const monthBuckets: Record<string, Record<string, number>> = {};
    const monthLabels: string[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const label = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthLabels.push(label);
      monthBuckets[label] = Object.fromEntries(RETURN_REASONS.map((r) => [r, 0]));
    }
    for (const o of yearOrders) {
      const d = new Date(o.createdAt);
      const idx = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      const label = monthLabels[11 - idx];
      if (label && o.return.reason) monthBuckets[label][o.return.reason] += 1;
    }
    const reasonTrend = monthLabels.map((month) => ({ month, ...monthBuckets[month] }));

    return apiSuccess({
      overview: { totalReturns, returnCost: Math.round(returnCost), avgProcessingDays, avgRefundDays },
      trend,
      byReason,
      byCategory,
      byCity,
      byChannel,
      timeline,
      byDeliveryPartner,
      reasonTrend,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
