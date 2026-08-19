import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

// Uses the edge-safe config only (no Credentials provider / bcryptjs / Mongoose) so this
// stays runnable in the Edge runtime — see auth.config.ts.
const { auth } = NextAuth(authConfig);

// Security headers applied to every response (Section 3.3).
function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com"
  );
  return res;
}

const PUBLIC_PATHS = ["/login", "/api/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;

  const isLoggedIn = !!req.auth;
  const isApi = pathname.startsWith("/api");

  if (!isPublicPath(pathname) && !isLoggedIn) {
    if (isApi) {
      return withSecurityHeaders(
        NextResponse.json({ success: false, error: "Authentication required", code: 401 }, { status: 401 })
      );
    }
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (pathname === "/login" && isLoggedIn) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin)));
  }

  return withSecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
