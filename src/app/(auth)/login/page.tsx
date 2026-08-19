import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "@/components/shared/LoginCard";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-4">
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent-glow/10 blur-3xl" />

      <LoginCard />
    </div>
  );
}
