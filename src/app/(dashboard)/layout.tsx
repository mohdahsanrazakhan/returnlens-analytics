import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import RecommendationModel from "@/models/Recommendation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let alertCount = 0;
  try {
    await connectDB();
    alertCount = await RecommendationModel.countDocuments({ priority: "critical", status: { $nin: ["dismissed", "implemented"] } });
  } catch {
    alertCount = 0;
  }

  const user = session.user as typeof session.user & { company?: string };

  return (
    <DashboardShell userName={user.name ?? undefined} company={user.company} alertCount={alertCount}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardShell>
  );
}
