import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Managers section layout — only ADMIN (super admin) can access.
 * ADMIN_VIEWER, ADMIN_HR, and ADMIN_ACCOUNTING are redirected to the dashboard.
 */
export default async function ManagersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
