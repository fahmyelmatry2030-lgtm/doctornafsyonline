import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

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

  return (
    <DashboardLayout role="PATIENT" userName={session.user.name || "مستخدم"}>
      {children}
    </DashboardLayout>
  );
}
