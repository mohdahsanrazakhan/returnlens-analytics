import type { NextAuthConfig } from "next-auth";

// Edge-safe subset of the NextAuth config — no Credentials provider here (it pulls in
// bcryptjs + Mongoose, which are Node-only and can't run in the Edge/proxy runtime).
// middleware.ts uses only this config to read/validate the JWT session cookie;
// src/auth.ts extends it with the real provider for API routes and server components.
export const authConfig = {
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 }, // 24 hours (Section 3.1)
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.company = (user as { company?: string }).company;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role?: string; company?: string }).role =
          token.role as string | undefined;
        (session.user as typeof session.user & { role?: string; company?: string }).company =
          token.company as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
