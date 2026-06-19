import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "./actions";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  const role = session?.user?.role;

  // Only ADMIN and ADMIN_VIEWER can access settings
  if (!isAdminRole(role)) {
    redirect("/dashboard");
  }

  const isReadOnly = role === "ADMIN_VIEWER";
  const settings = await getSettings();

  return <SettingsPageClient initialSettings={settings} isReadOnly={isReadOnly} />;
}
