import { NextResponse } from "next/server";
import { getSettings } from "@/app/admin/settings/actions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await getSettings();
    
    // Check if database is reachable
    let dbStatus = "unreachable";
    let therapistCount = 0;
    let adminAuthTest = "not tested";
    let patientAuthTest = "not tested";
    
    try {
      therapistCount = await prisma.user.count({ where: { role: "THERAPIST" } });
      dbStatus = "connected";

      // Test admin credentials
      const bcrypt = require("bcryptjs");
      const adminUser = await prisma.user.findUnique({ where: { email: "admin@nafsi.com" } });
      if (adminUser) {
        const adminValid = await bcrypt.compare("123456", adminUser.password);
        adminAuthTest = adminValid ? "success" : "failed: password mismatch";
      } else {
        adminAuthTest = "failed: user not found";
      }

      // Test patient credentials
      const patientUser = await prisma.user.findUnique({ where: { email: "patient@nafsi.com" } });
      if (patientUser) {
        const patientValid = await bcrypt.compare("123456", patientUser.password);
        patientAuthTest = patientValid ? "success" : "failed: password mismatch";
      } else {
        patientAuthTest = "failed: user not found";
      }

    } catch (dbErr: any) {
      dbStatus = `failed: ${dbErr?.message || dbErr}`;
    }

    return NextResponse.json({
      status: "success",
      dbStatus,
      therapistCount,
      adminAuthTest,
      patientAuthTest,
      settings,
      timestamp: new Date().toISOString(),
      envAuthTrustHost: process.env.AUTH_TRUST_HOST || "not set",
      envAuthUrl: process.env.AUTH_URL || "not set",
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err?.message || err,
    }, { status: 500 });
  }
}
