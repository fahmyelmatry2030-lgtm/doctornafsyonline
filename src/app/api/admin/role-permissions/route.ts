import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const PERMISSIONS_FILE_PATH = path.join(process.cwd(), "src/data/role-permissions.json");

// Default permissions for each role - which nav pages they can access
export const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  ADMIN_HR: [
    "/admin/dashboard",
    "/admin/shift-leader",
    "/admin/therapists",
    "/admin/patients",
    "/admin/customer-service",
    "/admin/my-salary",
  ],
  ADMIN_ACCOUNTING: [
    "/admin/dashboard",
    "/admin/reports",
    "/admin/salaries",
    "/admin/employee-salaries",
    "/admin/my-salary",
  ],
  ADMIN_VIEWER: [
    "/admin/dashboard",
    "/admin/shift-leader",
    "/admin/therapists",
    "/admin/patients",
    "/admin/reports",
    "/admin/content",
    "/admin/marketing",
    "/admin/support",
    "/admin/certificates",
    "/admin/customer-service",
    "/admin/settings",
    "/admin/my-salary",
  ],
  ADMIN_CUSTOMER_SERVICE: [
    "/admin/dashboard",
    "/admin/customer-service",
    "/admin/shift-leader",
    "/admin/my-salary",
  ],
  ADMIN_SALES: [
    "/admin/dashboard",
    "/admin/my-salary",
  ],
  ADMIN_MARKETING: [
    "/admin/dashboard",
    "/admin/marketing",
    "/admin/my-salary",
  ],
};

export async function readPermissions(): Promise<Record<string, string[]>> {
  try {
    const data = await fs.readFile(PERMISSIONS_FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    // Return defaults if file doesn't exist
    return DEFAULT_PERMISSIONS;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.role?.startsWith("ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  const perms = await readPermissions();
  return NextResponse.json(perms);
}

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح - فقط المدير العام" }, { status: 403 });
  }

  try {
    const body = await req.json();
    // Validate structure
    const validRoles = [
      "ADMIN_HR", "ADMIN_ACCOUNTING", "ADMIN_VIEWER", 
      "ADMIN_CUSTOMER_SERVICE", "ADMIN_SALES", "ADMIN_MARKETING"
    ];
    const validPages = [
      "/admin/dashboard", "/admin/operations", "/admin/therapists",
      "/admin/patients", "/admin/reports", "/admin/salaries",
      "/admin/content", "/admin/marketing", "/admin/support",
      "/admin/certificates", "/admin/settings", "/admin/shift-leader",
      "/admin/managers", "/admin/customer-service", "/admin/my-salary",
      "/admin/activity", "/admin/employee-salaries"
    ];

    const validated: Record<string, string[]> = {};
    for (const role of validRoles) {
      if (Array.isArray(body[role])) {
        // Always include dashboard
        const pages = body[role].filter((p: string) => validPages.includes(p));
        if (!pages.includes("/admin/dashboard")) pages.unshift("/admin/dashboard");
        validated[role] = pages;
      } else {
        validated[role] = DEFAULT_PERMISSIONS[role];
      }
    }

    await fs.mkdir(path.dirname(PERMISSIONS_FILE_PATH), { recursive: true });
    await fs.writeFile(PERMISSIONS_FILE_PATH, JSON.stringify(validated, null, 2), "utf8");

    return NextResponse.json({ success: true, permissions: validated });
  } catch (error) {
    console.error("Permissions update error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الحفظ" }, { status: 500 });
  }
}
