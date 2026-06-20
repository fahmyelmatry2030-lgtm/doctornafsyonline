import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { prisma } from "@/lib/prisma";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard"); // will redirect to correct dashboard
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true }
  });

  return (
    <DashboardLayout role="PATIENT" userName={session.user.name || "مستخدم"} userAvatar={user?.avatar}>
      {children}
    </DashboardLayout>
  );
}
