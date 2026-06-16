import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  switch (role) {
    case "PATIENT":
      redirect("/patient/dashboard");
    case "THERAPIST":
      redirect("/therapist/dashboard");
    case "ADMIN":
      redirect("/admin/dashboard");
    default:
      // Fallback
      redirect("/patient/dashboard");
  }
}
