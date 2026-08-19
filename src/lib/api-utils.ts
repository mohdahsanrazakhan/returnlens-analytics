import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Consistent response envelope across every API route (Section 3.2).
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code: number;
}

export function apiSuccess<T>(data: T, init?: number) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status: init ?? 200 });
}

export function apiError(message: string, code: number = 500) {
  return NextResponse.json<ApiError>({ success: false, error: message, code }, { status: code });
}

/**
 * Central error handler for API routes. Never leaks stack traces or internal
 * details to the client (Section 3.2) — logs server-side only.
 */
export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    // eslint-disable-next-line no-console
    console.error("Validation error:", err.flatten());
    return apiError("Invalid request parameters", 400);
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error("API error:", err.message, err.stack);
    if (err.message === "UNAUTHENTICATED") return apiError("Authentication required", 401);
    if (err.message === "FORBIDDEN") return apiError("Forbidden", 403);
    if (err.message === "NOT_FOUND") return apiError("Not found", 404);
  } else {
    // eslint-disable-next-line no-console
    console.error("Unknown API error:", err);
  }

  return apiError("Something went wrong. Please try again.", 500);
}
