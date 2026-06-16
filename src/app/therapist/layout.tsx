import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "THERAPIST") {
    redirect("/dashboard"); // will redirect to correct dashboard
  }

  return (
    <DashboardLayout role="THERAPIST" userName={session.user.name || "أخصائي"}>
      {children}
    </DashboardLayout>
  );
}
