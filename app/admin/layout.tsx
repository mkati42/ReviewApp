import { auth } from "@/lib/auth";
import { DashboardLayoutClient } from "@/components/dashboard/layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return <DashboardLayoutClient user={session!.user}>{children}</DashboardLayoutClient>;
}