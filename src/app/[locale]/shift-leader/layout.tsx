import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { prisma } from "@/lib/prisma";

export default async function ShiftLeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAuthorized =
    session.user.role === "ADMIN" ||
    session.user.role === "SHIFT_LEADER";

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true }
  });

  return (
    <DashboardLayout 
      role={session.user.role as any} 
      userName={session.user.name || "قائد الشيفت"} 
      userAvatar={user?.avatar} 
      userId={session.user.id}
    >
      {children}
    </DashboardLayout>
  );
}
