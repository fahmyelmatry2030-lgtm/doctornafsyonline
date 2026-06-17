import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const debugInfo: any = {};
  
  // 1. Try Prisma query
  try {
    await prisma.user.findMany({
      where: { role: "THERAPIST" },
      include: {
        therapistProfile: true,
        _count: { select: { therapistAppointments: true } }
      },
      take: 1
    });
    debugInfo.prismaQuery = "Success! No Prisma Error.";
  } catch (err: any) {
    debugInfo.prismaQueryError = err.message || String(err);
  }

  // 2. Read logs if they exist
  try {
    const logPath = path.join(process.cwd(), "startup-error.log");
    if (fs.existsSync(logPath)) {
      debugInfo.startupLog = fs.readFileSync(logPath, "utf-8").split("\n").slice(-20);
    } else {
      debugInfo.startupLog = "No startup-error.log found.";
    }
  } catch (err: any) {
    debugInfo.logError = err.message;
  }

  return NextResponse.json(debugInfo);
}
