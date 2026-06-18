import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Attempt to add the gender column if it doesn't exist
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN gender VARCHAR(191) NULL;`);
    
    return NextResponse.json({ 
      success: true, 
      message: "تم تحديث قاعدة البيانات بنجاح! تم إضافة حقل الجنس." 
    });
  } catch (error: any) {
    // If the column already exists, MySQL will throw an error (Duplicate column name)
    if (error.message && error.message.includes("Duplicate column name")) {
      return NextResponse.json({ 
        success: true, 
        message: "حقل الجنس موجود بالفعل في قاعدة البيانات. لا حاجة لتحديثه." 
      });
    }

    console.error("DB Fix Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error) 
    }, { status: 500 });
  }
}
