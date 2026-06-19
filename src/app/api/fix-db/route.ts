import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Get database name
    const dbNameResult: any = await prisma.$queryRawUnsafe(`SELECT DATABASE() as dbName;`);
    const dbName = dbNameResult[0]?.dbName || "unknown";

    // 2. Get list of all tables
    const tablesResult: any = await prisma.$queryRawUnsafe(`SHOW TABLES;`);
    const tables = tablesResult.map((row: any) => Object.values(row)[0]);

    // 3. Inspect columns of Appointment table (try both case variations)
    let appointmentColumns: any = [];
    let appointmentTableUsed = "";
    
    for (const tableName of ["Appointment", "appointment"]) {
      if (tables.includes(tableName)) {
        try {
          appointmentTableUsed = tableName;
          const columnsResult: any = await prisma.$queryRawUnsafe(`DESCRIBE \`${tableName}\`;`);
          appointmentColumns = columnsResult.map((col: any) => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key
          }));
          break;
        } catch (e: any) {
          console.error(`Error describing table ${tableName}:`, e.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      database: dbName,
      tables,
      appointmentTable: appointmentTableUsed,
      columns: appointmentColumns
    });
  } catch (error: any) {
    console.error("DB Inspect Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
