import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { prisma } from "@/lib/prisma";

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true }
  });

  return (
    <DashboardLayout role={session.user.role as any} userName={session.user.name || "مدير النظام"} userAvatar={user?.avatar} userId={session.user.id}>
      {children}
    </DashboardLayout>
  );
}
