import { NextResponse } from "next/server";
import { getSettings } from "@/app/admin/settings/actions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await getSettings();
    
    let dbStatus = "unreachable";
    let therapistCount = 0;
    let adminAuthTest = "not tested";
    let adminPasswordTest = "not tested";
    
    try {
      therapistCount = await prisma.user.count({ where: { role: "THERAPIST" } });
      dbStatus = "connected";

      const bcrypt = require("bcryptjs");
      const adminUser = await prisma.user.findUnique({ where: { email: "admin@nafsi.com" } });
      if (adminUser) {
        // Test new password
        const validNew = await bcrypt.compare("Doctor1346790", adminUser.password);
        // Test old password
        const validOld = await bcrypt.compare("123456", adminUser.password);
        adminPasswordTest = validNew ? "Doctor1346790 ✅" : (validOld ? "123456 ✅" : "UNKNOWN ❌");
        adminAuthTest = `role=${adminUser.role}, suspended=${adminUser.isSuspended}, passwordWorks=${validNew}`;
      } else {
        adminAuthTest = "failed: user not found";
      }

    } catch (dbErr: any) {
      dbStatus = `failed: ${dbErr?.message || dbErr}`;
    }

    // Get auth secret info (partial only for security)
    const authSecret = process.env.AUTH_SECRET || "";
    const authSecretInfo = authSecret 
      ? `set (length=${authSecret.length}, starts=${authSecret.substring(0, 6)}...)` 
      : "NOT SET ❌";

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      dbStatus,
      therapistCount,
      adminAuthTest,
      adminPasswordTest,
      authSecretInfo,
      envAuthTrustHost: process.env.AUTH_TRUST_HOST || "not set",
      envAuthUrl: process.env.AUTH_URL || "not set",
      envNextAuthUrl: process.env.NEXTAUTH_URL || "not set",
      nodeEnv: process.env.NODE_ENV || "not set",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err?.message || err,
    }, { status: 500 });
  }
}
