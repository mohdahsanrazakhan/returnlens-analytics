import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { loginSchema } from "@/lib/validators";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        // IP comes from request headers server-side, never trusting client-supplied input (Section 3.1).
        const ip = getClientIp(request.headers);

        const limit = checkRateLimit(`login:${ip}`);
        if (!limit.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        await connectDB();
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
        };
      },
    }),
  ],
});
