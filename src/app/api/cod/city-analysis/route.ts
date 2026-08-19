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

    const codOrders = await OrderModel.find({ createdAt: { $gte: start }, "payment.isCOD": true, status: { $ne: "cancelled" } })
      .select("customerCity customerCountry status codRejection.totalLoss")
      .lean();

    const cityMap = new Map<string, { country: string; cod: number; rejected: number; loss: number }>();
    for (const o of codOrders) {
      const c = cityMap.get(o.customerCity) ?? { country: o.customerCountry, cod: 0, rejected: 0, loss: 0 };
      c.cod += 1;
      if (o.status === "cod_rejected") {
        c.rejected += 1;
        c.loss += o.codRejection?.totalLoss ?? 0;
      }
      cityMap.set(o.customerCity, c);
    }

    const cities = Array.from(cityMap.entries())
      .map(([city, v]) => ({
        city,
        country: v.country,
        codOrders: v.cod,
        rejections: v.rejected,
        rejectionRate: v.cod ? Math.round((v.rejected / v.cod) * 1000) / 10 : 0,
        successRate: v.cod ? Math.round(((v.cod - v.rejected) / v.cod) * 1000) / 10 : 100,
        loss: Math.round(v.loss),
      }))
      .sort((a, b) => b.rejectionRate - a.rejectionRate);

    return apiSuccess({ cities });
  } catch (err) {
    return handleApiError(err);
  }
}
