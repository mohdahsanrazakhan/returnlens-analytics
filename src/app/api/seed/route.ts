import { getAuthenticatedSession } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// Dev-only re-seed endpoint powering the "Reset Demo Data" button (Section 7.9).
// Disabled outright in production to avoid a destructive, unauthenticated-adjacent surface.
export async function POST() {
  try {
    await getAuthenticatedSession();

    if (process.env.NODE_ENV === "production") {
      return apiError("Seeding is disabled in production", 403);
    }

    const { runSeed } = await import("@/seed/seed");
    await runSeed();

    return apiSuccess({ message: "Demo data reset successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
