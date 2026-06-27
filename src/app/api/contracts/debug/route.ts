import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Debug endpoint: GET /api/contracts/debug
// Shows exactly what's stored in the DB for contracts
export async function GET() {
  try {
    const results: any = {};

    for (const type of ["trial", "marketing", "annual"]) {
      const dbKey = `contract_pdf_${type}`;
      const record = await prisma.systemSetting.findUnique({
        where: { key: dbKey },
      });

      if (!record) {
        results[type] = { status: "NOT_FOUND", message: "لا يوجد عقد مخزن" };
        continue;
      }

      const base64Length = record.value.length;
      const buffer = Buffer.from(record.value, "base64");
      const pdfHeader = buffer.slice(0, 5).toString("ascii");
      const isPdf = pdfHeader.startsWith("%PDF");

      results[type] = {
        status: isPdf ? "VALID_PDF" : "CORRUPTED",
        base64Length,
        decodedSize: buffer.length,
        decodedSizeKB: (buffer.length / 1024).toFixed(1) + " KB",
        first5Bytes: pdfHeader,
        isPdf,
      };
    }

    // Also check site_settings
    const settingsRecord = await prisma.systemSetting.findUnique({
      where: { key: "site_settings" },
    });
    const settings = settingsRecord ? JSON.parse(settingsRecord.value) : {};
    results.urls = {
      trial: settings.trialContractUrl || "NOT SET",
      marketing: settings.marketingContractUrl || "NOT SET",
      annual: settings.annualContractUrl || "NOT SET",
    };

    // Check column type
    const columnInfo = await prisma.$queryRawUnsafe(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SystemSetting' AND COLUMN_NAME = 'value'`
    );
    results.columnInfo = columnInfo;

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
