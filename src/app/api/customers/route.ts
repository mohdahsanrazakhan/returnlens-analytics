import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { customersQuerySchema } from "@/lib/validators";
import CustomerModel from "@/models/Customer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = customersQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      risk: searchParams.get("risk") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const filter: Record<string, unknown> = {};
    if (query.risk && query.risk !== "all") filter.riskLevel = query.risk;
    if (query.city) filter.city = query.city;
    if (query.country) filter.country = query.country;
    if (query.search) {
      filter.$or = [
        { name: { $regex: escapeRegex(query.search), $options: "i" } },
        { email: { $regex: escapeRegex(query.search), $options: "i" } },
      ];
    }

    const sortField =
      query.sort === "riskScore"
        ? "riskScore"
        : query.sort === "totalOrders"
          ? "stats.totalOrders"
          : query.sort === "returnRate"
            ? "stats.returnRate"
            : "stats.codRejectionRate";
    const sortDir = query.order === "asc" ? 1 : -1;

    const [customers, total, distributionRaw] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      CustomerModel.countDocuments(filter),
      CustomerModel.aggregate([{ $group: { _id: "$riskLevel", count: { $sum: 1 } } }]),
    ]);

    const distMap = new Map(distributionRaw.map((d) => [d._id, d.count]));
    const distribution = {
      low: distMap.get("low") ?? 0,
      medium: distMap.get("medium") ?? 0,
      high: distMap.get("high") ?? 0,
      critical: distMap.get("critical") ?? 0,
    };

    return apiSuccess({
      distribution,
      customers: customers.map((c) => ({ ...c, _id: c._id.toString() })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
