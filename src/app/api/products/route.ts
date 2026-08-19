import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { productsQuerySchema } from "@/lib/validators";
import ProductModel from "@/models/Product";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = productsQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      risk: searchParams.get("risk") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      order: searchParams.get("order") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      channel: searchParams.get("channel") ?? undefined,
    });

    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.risk && query.risk !== "all") filter.riskLevel = query.risk;
    if (query.search) {
      filter.$or = [
        { nameEn: { $regex: escapeRegex(query.search), $options: "i" } },
        { sku: { $regex: escapeRegex(query.search), $options: "i" } },
      ];
    }

    const sortField =
      query.sort === "returnRate"
        ? "returnStats.returnRate"
        : query.sort === "codRejectionRate"
          ? "codStats.codRejectionRate"
          : query.sort === "totalLoss"
            ? "returnStats.returnCost"
            : "returnStats.totalSold";

    const sortDir = query.order === "asc" ? 1 : -1;

    const [products, total, categoryHeatmapRaw] = await Promise.all([
      ProductModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      ProductModel.countDocuments(filter),
      ProductModel.aggregate([
        {
          $group: {
            _id: "$category",
            returnRate: { $avg: "$returnStats.returnRate" },
            codRejectionRate: { $avg: "$codStats.codRejectionRate" },
            totalLoss: { $sum: "$returnStats.returnCost" },
          },
        },
      ]),
    ]);

    const heatmapMap = new Map(categoryHeatmapRaw.map((c) => [c._id, c]));
    const categoryHeatmap = CATEGORIES.map((category) => {
      const h = heatmapMap.get(category);
      return {
        category,
        returnRate: h ? Math.round(h.returnRate * 10) / 10 : 0,
        codRejectionRate: h ? Math.round(h.codRejectionRate * 10) / 10 : 0,
        totalLoss: h ? Math.round(h.totalLoss) : 0,
      };
    });

    return apiSuccess({
      categoryHeatmap,
      products: products.map((p) => ({ ...p, _id: p._id.toString() })),
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
