import { NextResponse } from "next/server";
import { getSettings } from "@/app/admin/settings/actions";
import { prisma } from "@/lib/prisma";
import { PLATFORM_PHONE } from "@/lib/constants";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getSettings();
    
    let dbStatus = "unreachable";
    let therapistCount = 0;
    let adminAuthTest = "not tested";
    let adminPasswordTest = "not tested";
    let testTherapistRegister = "not tested";
    
    try {
      therapistCount = await prisma.user.count({ where: { role: "THERAPIST" } });
      dbStatus = "connected";

      // Test admin credentials
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

      // Test therapist registration query
      try {
        const testEmail = `temp-test-therapist-${Date.now()}@nafsi.com`;
        const testHashedPassword = await bcrypt.hash("password123", 12);
        const testUser = await prisma.user.create({
          data: {
            name: "دكتور تجريبي",
            email: testEmail,
            password: testHashedPassword,
            phone: "01010423661",
            role: "THERAPIST",
            therapistProfile: {
              create: {
                bio: "أخصائي نفسي جديد تجريبي",
                specializations: JSON.stringify(["القلق", "الاكتئاب"]),
                pricePerSession: 300,
                yearsExperience: 5,
              },
            },
          },
        });
        
        // Delete right after
        await prisma.user.delete({
          where: { id: testUser.id },
        });
        
        testTherapistRegister = "success ✅";
      } catch (err: any) {
        testTherapistRegister = `failed ❌: ${err?.message || err}`;
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
      testTherapistRegister,
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
