import { NextResponse } from "next/server";
import { getSettings } from "@/app/admin/settings/actions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await getSettings();
    
    // Check if database is reachable
    let dbStatus = "unreachable";
    let therapistCount = 0;
    try {
      therapistCount = await prisma.user.count({ where: { role: "THERAPIST" } });
      dbStatus = "connected";
    } catch (dbErr: any) {
      dbStatus = `failed: ${dbErr?.message || dbErr}`;
    }

    return NextResponse.json({
      status: "success",
      dbStatus,
      therapistCount,
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
