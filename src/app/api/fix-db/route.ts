import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];
  
  // 1. Attempt to add the gender column to User if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN gender VARCHAR(191) NULL;`);
    results.push("تم إضافة حقل الجنس بنجاح.");
  } catch (error: any) {
    if (error.message && (error.message.includes("Duplicate column name") || error.message.includes("1060"))) {
      results.push("حقل الجنس موجود بالفعل.");
    } else {
      results.push(`خطأ في إضافة الجنس: ${error.message}`);
    }
  }

  // 2. Attempt to add the paymentScreenshot column to Appointment if it doesn't exist
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE Appointment ADD COLUMN paymentScreenshot TEXT NULL;`);
    results.push("تم إضافة حقل لقطة الشاشة للدفع بنجاح.");
  } catch (error: any) {
    if (error.message && (error.message.includes("Duplicate column name") || error.message.includes("1060"))) {
      results.push("حقل لقطة الشاشة للدفع موجود بالفعل.");
    } else {
      results.push(`خطأ في إضافة لقطة الشاشة للدفع: ${error.message}`);
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: "تم تشغيل عمليات تحديث قاعدة البيانات.",
    results
  });
}
