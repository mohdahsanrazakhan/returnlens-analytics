import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { periodSchema } from "@/lib/validators";
import { periodToDays } from "@/lib/utils";
import OrderModel from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = periodSchema.parse(searchParams.get("period") ?? undefined);
    const days = periodToDays(period);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await OrderModel.find({ createdAt: { $gte: start }, status: { $ne: "cancelled" } })
      .select("createdAt status return.totalReturnCost return.refundAmount")
      .lean();

    const byDay = new Map<string, { returned: number; total: number; cost: number }>();
    for (const o of orders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const d = byDay.get(key) ?? { returned: 0, total: 0, cost: 0 };
      d.total += 1;
      if (o.status === "returned") {
        d.returned += 1;
        d.cost += (o.return?.totalReturnCost ?? 0) + (o.return?.refundAmount ?? 0);
      }
      byDay.set(key, d);
    }

    const data = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        rate: d.total ? Math.round((d.returned / d.total) * 1000) / 10 : 0,
        count: d.returned,
        cost: Math.round(d.cost),
      }));

    return apiSuccess({ trend: data });
  } catch (err) {
    return handleApiError(err);
  }
}
