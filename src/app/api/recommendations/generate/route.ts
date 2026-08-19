import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import OrderModel from "@/models/Order";
import ProductModel from "@/models/Product";
import RecommendationModel from "@/models/Recommendation";
import { generateRecommendations } from "@/lib/openai";
import { CITY_COD_REJECTION_RATE, RETURN_REASONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// AI calls are server-side only, capped, and fed a sanitized numeric summary — never raw user text (Section 3.5).
export async function POST() {
  try {
    await getAuthenticatedSession();
    await connectDB();

    if (!process.env.OPENAI_API_KEY) {
      return apiError("AI recommendations are not configured on this deployment", 503);
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orders = await OrderModel.find({ createdAt: { $gte: thirtyDaysAgo }, status: { $ne: "cancelled" } }).lean();

    const totalNonCancelled = orders.length || 1;
    const returned = orders.filter((o) => o.status === "returned");
    const codOrders = orders.filter((o) => o.payment.isCOD);
    const codRejected = codOrders.filter((o) => o.status === "cod_rejected");

    const reasonCounts: Record<string, number> = {};
    for (const r of RETURN_REASONS) reasonCounts[r] = 0;
    for (const o of returned) if (o.return.reason) reasonCounts[o.return.reason] += 1;
    const topReturnReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);

    const worstCity = Object.entries(CITY_COD_REJECTION_RATE).sort((a, b) => b[1] - a[1])[0];

    const worstCategoryAgg = await ProductModel.aggregate([
      { $group: { _id: "$category", avgReturnRate: { $avg: "$returnStats.returnRate" } } },
      { $sort: { avgReturnRate: -1 } },
      { $limit: 1 },
    ]);

    const returnCost = returned.reduce((s, o) => s + o.return.totalReturnCost + o.return.refundAmount, 0);
    const codLoss = codRejected.reduce((s, o) => s + o.codRejection.totalLoss, 0);

    const summary = {
      overallReturnRate: Math.round((returned.length / totalNonCancelled) * 1000) / 10,
      codRejectionRate: codOrders.length ? Math.round((codRejected.length / codOrders.length) * 1000) / 10 : 0,
      topReturnReasons,
      worstCodCity: { city: worstCity?.[0] ?? "Riyadh", rate: Math.round((worstCity?.[1] ?? 0.18) * 100) },
      worstCategory: { category: worstCategoryAgg[0]?._id ?? "Fashion & Apparel", rate: Math.round(worstCategoryAgg[0]?.avgReturnRate ?? 28) },
      totalMonthlyLoss: Math.round(returnCost + codLoss),
    };

    const generated = await generateRecommendations(summary);
    if (generated.length === 0) {
      return apiError("AI did not return any recommendations. Please try again.", 502);
    }

    const docs = generated.slice(0, 3).map((r) => ({
      type: "operational" as const,
      priority: "medium" as const,
      title: r.title.slice(0, 200),
      problem: r.problem,
      impact: r.impact,
      recommendation: r.recommendation,
      estimatedSavings: extractSavingsNumber(r.impact),
      estimatedSavingsPercent: 15,
      implementationSteps: Array.isArray(r.implementationSteps) ? r.implementationSteps.slice(0, 10) : [],
      implementationDifficulty: (["easy", "medium", "hard"] as const).includes(r.difficulty) ? r.difficulty : "medium",
      timeToImplement: r.timeToImplement ?? "1 week",
      dataPoints: [],
      status: "new" as const,
      isAIGenerated: true,
    }));

    const created = await RecommendationModel.insertMany(docs);

    return apiSuccess({ recommendations: created.map((r) => ({ ...r.toObject(), _id: r._id.toString() })) });
  } catch (err) {
    return handleApiError(err);
  }
}

function extractSavingsNumber(impact: string): number {
  const match = impact.match(/[\d,]+/);
  if (!match) return 0;
  return Number(match[0].replace(/,/g, "")) || 0;
}
