import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/dashboard"); // will redirect to correct dashboard
  }

  return (
    <DashboardLayout role={session.user.role as any} userName={session.user.name || "مدير النظام"}>
      {children}
    </DashboardLayout>
  );
}
