import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { recommendationsQuerySchema } from "@/lib/validators";
import RecommendationModel from "@/models/Recommendation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = recommendationsQuerySchema.parse({
      priority: searchParams.get("priority") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      type: searchParams.get("type") ?? undefined,
    });

    const filter: Record<string, unknown> = {};
    if (query.priority) filter.priority = query.priority;
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const recommendations = await RecommendationModel.find(filter).lean();
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.estimatedSavings - a.estimatedSavings);

    return apiSuccess({ recommendations: recommendations.map((r) => ({ ...r, _id: r._id.toString() })) });
  } catch (err) {
    return handleApiError(err);
  }
}
