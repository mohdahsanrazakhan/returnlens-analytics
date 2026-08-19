import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { dashboardQuerySchema } from "@/lib/validators";
import { periodToDays } from "@/lib/utils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const { period } = dashboardQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      currency: searchParams.get("currency") ?? undefined,
    });

    const days = periodToDays(period);
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);

    const [returnedOrders, codRejectedOrders, allOrdersInPeriod, prevOrdersInPeriod] = await Promise.all([
      OrderModel.find({ status: "returned", createdAt: { $gte: start } }).lean(),
      OrderModel.find({ status: "cod_rejected", createdAt: { $gte: start } }).lean(),
      OrderModel.find({ createdAt: { $gte: start }, status: { $ne: "cancelled" } }).lean(),
      OrderModel.find({ createdAt: { $gte: prevStart, $lt: start }, status: { $ne: "cancelled" } }).lean(),
    ]);

    const returnsCost = returnedOrders.reduce((s, o) => s + (o.return?.totalReturnCost ?? 0) + (o.return?.refundAmount ?? 0), 0);
    const codLoss = codRejectedOrders.reduce((s, o) => s + (o.codRejection?.totalLoss ?? 0), 0);

    // Top 3 recommendations' estimated savings as "could save"
    const RecommendationModel = (await import("@/models/Recommendation")).default;
    const topRecs = await RecommendationModel.find({ status: { $ne: "dismissed" } })
      .sort({ estimatedSavings: -1 })
      .limit(3)
      .lean();
    const potentialSavings = topRecs.reduce((s, r) => s + r.estimatedSavings, 0);

    const currentReturned = allOrdersInPeriod.filter((o) => o.status === "returned").length;
    const currentReturnRate = allOrdersInPeriod.length ? (currentReturned / allOrdersInPeriod.length) * 100 : 0;
    const prevReturned = prevOrdersInPeriod.filter((o) => o.status === "returned").length;
    const prevReturnRate = prevOrdersInPeriod.length ? (prevReturned / prevOrdersInPeriod.length) * 100 : 0;

    const currentCOD = allOrdersInPeriod.filter((o) => o.payment.isCOD);
    const currentCodRejected = currentCOD.filter((o) => o.status === "cod_rejected").length;
    const currentCodSuccessRate = currentCOD.length ? ((currentCOD.length - currentCodRejected) / currentCOD.length) * 100 : 100;
    const prevCOD = prevOrdersInPeriod.filter((o) => o.payment.isCOD);
    const prevCodRejected = prevCOD.filter((o) => o.status === "cod_rejected").length;
    const prevCodSuccessRate = prevCOD.length ? ((prevCOD.length - prevCodRejected) / prevCOD.length) * 100 : 100;

    const returnedInPeriod = allOrdersInPeriod.filter((o) => o.status === "returned" && o.return?.daysAfterDelivery != null);
    const avgDaysToReturn = returnedInPeriod.length
      ? returnedInPeriod.reduce((s, o) => s + (o.return.daysAfterDelivery ?? 0), 0) / returnedInPeriod.length
      : 0;
    const prevReturnedList = prevOrdersInPeriod.filter((o) => o.status === "returned" && o.return?.daysAfterDelivery != null);
    const prevAvgDaysToReturn = prevReturnedList.length
      ? prevReturnedList.reduce((s, o) => s + (o.return.daysAfterDelivery ?? 0), 0) / prevReturnedList.length
      : 0;

    const costPerReturn = currentReturned ? returnsCost / currentReturned : 0;
    const prevReturnsCost = prevOrdersInPeriod
      .filter((o) => o.status === "returned")
      .reduce((s, o) => s + (o.return?.totalReturnCost ?? 0) + (o.return?.refundAmount ?? 0), 0);
    const prevCostPerReturn = prevReturned ? prevReturnsCost / prevReturned : 0;

    // 12-month trend
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const trendOrders = await OrderModel.find({ createdAt: { $gte: twelveMonthsAgo }, status: { $ne: "cancelled" } })
      .select("createdAt status payment.isCOD")
      .lean();

    const monthBuckets: { month: string; total: number; returned: number; cod: number; codRejected: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      monthBuckets.push({ month: d.toLocaleString("en-US", { month: "short", year: "2-digit" }), total: 0, returned: 0, cod: 0, codRejected: 0 });
    }
    for (const o of trendOrders) {
      const monthIdx = 11 - monthDiff(now, new Date(o.createdAt));
      if (monthIdx < 0 || monthIdx > 11) continue;
      const bucket = monthBuckets[monthIdx];
      if (!bucket) continue;
      bucket.total += 1;
      if (o.status === "returned") bucket.returned += 1;
      if (o.payment.isCOD) bucket.cod += 1;
      if (o.status === "cod_rejected") bucket.codRejected += 1;
    }
    const returnTrend = monthBuckets.map((b) => ({
      month: b.month,
      returnRate: b.total ? Math.round((b.returned / b.total) * 1000) / 10 : 0,
      codRejectionRate: b.cod ? Math.round((b.codRejected / b.cod) * 1000) / 10 : 0,
    }));

    // Loss by city (top 5)
    const cityMap = new Map<string, { returnLoss: number; codLoss: number }>();
    for (const o of returnedOrders) {
      const c = cityMap.get(o.customerCity) ?? { returnLoss: 0, codLoss: 0 };
      c.returnLoss += (o.return?.totalReturnCost ?? 0) + (o.return?.refundAmount ?? 0);
      cityMap.set(o.customerCity, c);
    }
    for (const o of codRejectedOrders) {
      const c = cityMap.get(o.customerCity) ?? { returnLoss: 0, codLoss: 0 };
      c.codLoss += o.codRejection?.totalLoss ?? 0;
      cityMap.set(o.customerCity, c);
    }
    const lossByCity = Array.from(cityMap.entries())
      .map(([city, v]) => ({ city, returnLoss: Math.round(v.returnLoss), codLoss: Math.round(v.codLoss), total: Math.round(v.returnLoss + v.codLoss) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Top returned products
    const productAgg = await ProductModel.find({}).sort({ "returnStats.returnCost": -1 }).limit(5).lean();
    const topReturnedProducts = productAgg.map((p) => ({
      product: { ...p, _id: p._id.toString() },
      returnRate: p.returnStats.returnRate,
      unitsReturned: p.returnStats.totalReturned,
      totalLoss: p.returnStats.returnCost,
    }));

    // Quick insights
    const worstCategory = await ProductModel.aggregate([
      { $group: { _id: "$category", avgReturnRate: { $avg: "$returnStats.returnRate" }, totalLoss: { $sum: "$returnStats.returnCost" } } },
      { $sort: { avgReturnRate: -1 } },
      { $limit: 1 },
    ]);
    const bestCategory = await ProductModel.aggregate([
      { $group: { _id: "$category", avgReturnRate: { $avg: "$returnStats.returnRate" } } },
      { $sort: { avgReturnRate: 1 } },
      { $limit: 1 },
    ]);

    const quickInsights = [];
    if (worstCategory[0]) {
      quickInsights.push({
        severity: "critical" as const,
        text: `${worstCategory[0]._id} returns at ${worstCategory[0].avgReturnRate.toFixed(0)}%, SAR ${Math.round(worstCategory[0].totalLoss).toLocaleString()} lost this month`,
        link: "/products",
      });
    }
    quickInsights.push({
      severity: "warning" as const,
      text: `Riyadh COD rejection at 18%, 2x the average`,
      link: "/cod",
    });
    if (bestCategory[0]) {
      quickInsights.push({
        severity: "good" as const,
        text: `${bestCategory[0]._id} returns at ${bestCategory[0].avgReturnRate.toFixed(0)}%, your best category`,
        link: "/products",
      });
    }

    return apiSuccess({
      totalLoss: {
        returns: Math.round(returnsCost),
        cod: Math.round(codLoss),
        total: Math.round(returnsCost + codLoss),
        potentialSavings: Math.round(potentialSavings),
      },
      returnsCostOrders: returnedOrders.length,
      codLossOrders: codRejectedOrders.length,
      kpis: {
        returnRate: {
          current: Math.round(currentReturnRate * 10) / 10,
          previous: Math.round(prevReturnRate * 10) / 10,
          change: Math.round((currentReturnRate - prevReturnRate) * 10) / 10,
          sparkline: returnTrend.slice(-8).map((t) => t.returnRate),
        },
        codSuccessRate: {
          current: Math.round(currentCodSuccessRate * 10) / 10,
          previous: Math.round(prevCodSuccessRate * 10) / 10,
          change: Math.round((currentCodSuccessRate - prevCodSuccessRate) * 10) / 10,
          sparkline: returnTrend.slice(-8).map((t) => 100 - t.codRejectionRate),
        },
        avgDaysToReturn: {
          current: Math.round(avgDaysToReturn * 10) / 10,
          previous: Math.round(prevAvgDaysToReturn * 10) / 10,
          change: Math.round((avgDaysToReturn - prevAvgDaysToReturn) * 10) / 10,
        },
        costPerReturn: {
          current: Math.round(costPerReturn),
          previous: Math.round(prevCostPerReturn),
          change: Math.round(costPerReturn - prevCostPerReturn),
        },
      },
      returnTrend,
      lossByCity,
      topReturnedProducts,
      quickInsights,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

function monthDiff(now: Date, d: Date): number {
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}
