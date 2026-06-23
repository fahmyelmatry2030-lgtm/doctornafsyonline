import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const isSecretValid = secret === "NafsiDatabaseSetup2026";

  if (!isSecretValid) {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  try {
    const results = [];
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN certificates TEXT NULL;`);
      results.push("Added certificates to TherapistProfile");
    } catch (e: any) { results.push("certificates: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN contractUrl TEXT NULL;`);
      results.push("Added contractUrl to TherapistProfile");
    } catch (e: any) { results.push("contractUrl: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN isSuspended BOOLEAN NOT NULL DEFAULT false;`);
      results.push("Added isSuspended to User");
    } catch (e: any) { results.push("isSuspended: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN salary INT NOT NULL DEFAULT 0;`);
      results.push("Added salary to TherapistProfile");
    } catch (e: any) { results.push("salary: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN salaryType VARCHAR(191) NOT NULL DEFAULT 'FIXED';`);
      results.push("Added salaryType to TherapistProfile");
    } catch (e: any) { results.push("salaryType: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN paymentMethod VARCHAR(191) NOT NULL DEFAULT 'VODAFONE_CASH';`);
      results.push("Added paymentMethod to TherapistProfile");
    } catch (e: any) { results.push("paymentMethod: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN paymentDetails VARCHAR(191) NOT NULL DEFAULT '';`);
      results.push("Added paymentDetails to TherapistProfile");
    } catch (e: any) { results.push("paymentDetails: " + e.message); }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
