import { NextRequest } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, handleApiError, apiError } from "@/lib/api-utils";
import { objectIdSchema, recommendationPatchSchema } from "@/lib/validators";
import RecommendationModel from "@/models/Recommendation";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await getAuthenticatedSession();
    await connectDB();

    const { id } = await context.params;
    const idCheck = objectIdSchema.safeParse(id);
    if (!idCheck.success) return apiError("Invalid recommendation id", 400);

    const body = await req.json().catch(() => null);
    const { status } = recommendationPatchSchema.parse(body);

    const updated = await RecommendationModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!updated) return apiError("Recommendation not found", 404);

    return apiSuccess({ recommendation: { ...updated, _id: updated._id.toString() } });
  } catch (err) {
    return handleApiError(err);
  }
}
