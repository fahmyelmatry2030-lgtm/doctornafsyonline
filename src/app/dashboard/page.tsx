import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  let session = null;
  try {
    session = await auth();
  } catch (e) {
    console.error("Dashboard auth error:", e);
  }

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role?.startsWith("ADMIN")) {
    redirect("/admin/dashboard");
  }

  switch (role) {
    case "PATIENT":
      redirect("/patient/dashboard");
    case "THERAPIST":
      redirect("/therapist/dashboard");
    default:
      // Fallback
      redirect("/patient/dashboard");
  }
}
