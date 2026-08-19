import { auth } from "@/auth";

/**
 * Every API route must call this before touching the database (Section 3.1).
 * Throws "UNAUTHENTICATED" (caught by handleApiError -> 401) when there is no session.
 */
export async function getAuthenticatedSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}
