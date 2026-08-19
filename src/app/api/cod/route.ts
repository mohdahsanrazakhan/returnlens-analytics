import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { codQuerySchema } from "@/lib/validators";
import { periodToDays } from "@/lib/utils";
import OrderModel from "@/models/Order";
import { CITY_COD_REJECTION_RATE, COD_REJECTION_REASON_DISTRIBUTION, ORDER_VALUE_COD_REJECTION } from "@/lib/constants";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = codQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
      city: searchParams.get("city") ?? undefined,
    });

    const days = periodToDays(query.period);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const match: Record<string, unknown> = { createdAt: { $gte: start }, status: { $ne: "cancelled" } };
    if (query.city) match.customerCity = query.city;

    const orders = await OrderModel.find(match).lean();

    const codOrders = orders.filter((o) => o.payment.isCOD);
    const prepaidOrders = orders.filter((o) => !o.payment.isCOD);
    const rejections = codOrders.filter((o) => o.status === "cod_rejected");
    const revenueCollected = codOrders.filter((o) => o.status !== "cod_rejected").reduce((s, o) => s + o.payment.totalAmount, 0);
    const totalLoss = rejections.reduce((s, o) => s + o.codRejection.totalLoss, 0);

    // vs Prepaid
    const codReturns = codOrders.filter((o) => o.status === "returned").length;
    const prepaidReturns = prepaidOrders.filter((o) => o.status === "returned").length;
    const codAOV = codOrders.length ? codOrders.reduce((s, o) => s + o.payment.totalAmount, 0) / codOrders.length : 0;
    const prepaidAOV = prepaidOrders.length ? prepaidOrders.reduce((s, o) => s + o.payment.totalAmount, 0) / prepaidOrders.length : 0;

    const vsPrepaid = {
      cod: {
        orders: codOrders.length,
        successRate: codOrders.length ? Math.round(((codOrders.length - rejections.length) / codOrders.length) * 1000) / 10 : 0,
        returnRate: codOrders.length ? Math.round((codReturns / codOrders.length) * 1000) / 10 : 0,
        avgAOV: Math.round(codAOV),
        lossPerOrder: codOrders.length ? Math.round((totalLoss / codOrders.length) * 10) / 10 : 0,
      },
      prepaid: {
        orders: prepaidOrders.length,
        successRate: prepaidOrders.length ? Math.round(((prepaidOrders.length - 0) / prepaidOrders.length) * 1000) / 10 : 100,
        returnRate: prepaidOrders.length ? Math.round((prepaidReturns / prepaidOrders.length) * 1000) / 10 : 0,
        avgAOV: Math.round(prepaidAOV),
        lossPerOrder: prepaidOrders.length
          ? Math.round(
              (prepaidOrders.filter((o) => o.status === "returned").reduce((s, o) => s + o.return.totalReturnCost, 0) / prepaidOrders.length) * 10
            ) / 10
          : 0,
      },
    };

    // By city
    const cityMap = new Map<string, { cod: number; rejected: number; loss: number }>();
    for (const o of codOrders) {
      const c = cityMap.get(o.customerCity) ?? { cod: 0, rejected: 0, loss: 0 };
      c.cod += 1;
      if (o.status === "cod_rejected") {
        c.rejected += 1;
        c.loss += o.codRejection.totalLoss;
      }
      cityMap.set(o.customerCity, c);
    }
    const byCity = Array.from(cityMap.entries())
      .map(([city, v]) => ({
        city,
        successRate: v.cod ? Math.round(((v.cod - v.rejected) / v.cod) * 1000) / 10 : 100,
        rejections: v.rejected,
        loss: Math.round(v.loss),
      }))
      .sort((a, b) => a.successRate - b.successRate);

    // By order value
    const byOrderValue = ORDER_VALUE_COD_REJECTION.map((bucket) => {
      const inBucket = codOrders.filter((o) => o.payment.totalAmount >= bucket.min && o.payment.totalAmount < bucket.max);
      const rejectedInBucket = inBucket.filter((o) => o.status === "cod_rejected");
      return {
        range: bucket.label,
        rejectionRate: inBucket.length ? Math.round((rejectedInBucket.length / inBucket.length) * 1000) / 10 : 0,
        count: inBucket.length,
        loss: Math.round(rejectedInBucket.reduce((s, o) => s + o.codRejection.totalLoss, 0)),
      };
    });

    // By reason
    const reasonCounts: Record<string, number> = {};
    for (const r of Object.keys(COD_REJECTION_REASON_DISTRIBUTION)) reasonCounts[r] = 0;
    for (const o of rejections) if (o.codRejection.reason) reasonCounts[o.codRejection.reason] += 1;
    const byReason = Object.keys(COD_REJECTION_REASON_DISTRIBUTION).map((reason) => ({
      reason,
      count: reasonCounts[reason],
      percentage: rejections.length ? Math.round((reasonCounts[reason] / rejections.length) * 1000) / 10 : 0,
    }));

    // By day of week
    const dayStats = DAY_LABELS.map(() => ({ cod: 0, rejected: 0 }));
    for (const o of codOrders) {
      const dow = new Date(o.createdAt).getDay();
      dayStats[dow].cod += 1;
      if (o.status === "cod_rejected") dayStats[dow].rejected += 1;
    }
    const byDayOfWeek = DAY_LABELS.map((day, i) => ({
      day,
      rejectionRate: dayStats[i].cod ? Math.round((dayStats[i].rejected / dayStats[i].cod) * 1000) / 10 : 0,
    }));

    // By time of day
    const slots = [
      { slot: "Morning (6-12)", min: 6, max: 11 },
      { slot: "Afternoon (12-18)", min: 12, max: 17 },
      { slot: "Evening (18-22)", min: 18, max: 21 },
      { slot: "Night (22-6)", min: 22, max: 5 },
    ];
    const byTimeOfDay = slots.map((s) => {
      const inSlot = codOrders.filter((o) => {
        const h = new Date(o.createdAt).getHours();
        return s.min <= s.max ? h >= s.min && h <= s.max : h >= s.min || h <= s.max;
      });
      const rejectedInSlot = inSlot.filter((o) => o.status === "cod_rejected");
      return { slot: s.slot, rejectionRate: inSlot.length ? Math.round((rejectedInSlot.length / inSlot.length) * 1000) / 10 : 0 };
    });

    // Recovery metrics (demo-modeled)
    const reattempted = Math.round(rejections.length * 0.55);
    const converted = Math.round(rejections.length * 0.18);
    const unrecoverable = rejections.length - converted;

    void CITY_COD_REJECTION_RATE;

    return apiSuccess({
      overview: {
        codOrders: codOrders.length,
        codPercentage: orders.length ? Math.round((codOrders.length / orders.length) * 1000) / 10 : 0,
        revenueCollected: Math.round(revenueCollected),
        rejections: rejections.length,
        rejectionRate: codOrders.length ? Math.round((rejections.length / codOrders.length) * 1000) / 10 : 0,
        totalLoss: Math.round(totalLoss),
      },
      vsPrepaid,
      byCity,
      byOrderValue,
      byReason,
      byDayOfWeek,
      byTimeOfDay,
      recovery: {
        reattempted,
        converted,
        unrecoverable,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
