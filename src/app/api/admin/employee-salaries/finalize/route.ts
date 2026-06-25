import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "ADMIN_ACCOUNTING")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const month = parseInt(formData.get("month") as string, 10);
    const year = parseInt(formData.get("year") as string, 10);
    const baseSalary = parseInt(formData.get("baseSalary") as string, 10);
    const totalBonuses = parseInt(formData.get("totalBonuses") as string, 10);
    const totalDeductions = parseInt(formData.get("totalDeductions") as string, 10);
    const netSalary = parseInt(formData.get("netSalary") as string, 10);
    const file = formData.get("screenshot") as File | null;

    if (!userId || !month || !year) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    let screenshotUrl = null;

    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "حجم الملف يجب ألا يتجاوز 8 ميجابايت" }, { status: 400 });
      }

      const fileExtension = file.name.split(".").pop() || "png";
      const fileName = `salary_${userId}_${month}_${year}_${Date.now()}.${fileExtension}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        screenshotUrl = await uploadToCloudinary(buffer, "salaries", fileName);
      } catch (cloudinaryError) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "salaries");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        screenshotUrl = `/uploads/salaries/${fileName}`;
      }
    }

    const record = await prisma.monthlySalaryRecord.upsert({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        }
      },
      update: {
        baseSalary,
        totalBonuses,
        totalDeductions,
        netSalary,
        status: "PAID",
        ...(screenshotUrl && { transferScreenshot: screenshotUrl }),
        paidAt: new Date(),
      },
      create: {
        userId,
        month,
        year,
        baseSalary,
        totalBonuses,
        totalDeductions,
        netSalary,
        status: "PAID",
        transferScreenshot: screenshotUrl,
        paidAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("Salary finalize error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الدفع" }, { status: 500 });
  }
}
