import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError, apiError } from "@/lib/api-utils";
import { objectIdSchema } from "@/lib/validators";
import CustomerModel from "@/models/Customer";
import OrderModel from "@/models/Order";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { id } = await context.params;
    const parsed = objectIdSchema.safeParse(id);
    if (!parsed.success) return apiError("Invalid customer id", 400);

    const customer = await CustomerModel.findById(id).lean();
    if (!customer) return apiError("Customer not found", 404);

    const orders = await OrderModel.find({ customerId: id }).sort({ createdAt: -1 }).limit(20).lean();

    // Behavioral pattern summary
    const returned = orders.filter((o) => o.status === "returned");
    const codOrders = orders.filter((o) => o.payment.isCOD);
    const rejectedCod = codOrders.filter((o) => o.status === "cod_rejected");

    const patterns = {
      totalOrdersConsidered: orders.length,
      returnedCount: returned.length,
      codRejectionRateRecent: codOrders.length ? Math.round((rejectedCod.length / codOrders.length) * 1000) / 10 : 0,
      mostCommonReturnTiming:
        returned.length > 0
          ? returned.filter((o) => (o.return.daysAfterDelivery ?? 99) <= 2).length / returned.length > 0.5
            ? "1-2 days after delivery (impulse returns)"
            : "spread across the return window"
          : "no returns yet",
    };

    return apiSuccess({
      customer: { ...customer, _id: customer._id.toString() },
      orders: orders.map((o) => ({ ...o, _id: o._id.toString() })),
      patterns,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
