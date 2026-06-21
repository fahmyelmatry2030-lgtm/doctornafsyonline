import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { 
  getCertificates, 
  addCertificate, 
  deleteCertificate 
} from "@/lib/certificates";

// GET: List all certificates (Admin, HR, Viewer)
export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_HR" && role !== "ADMIN_VIEWER")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const certs = await getCertificates();
    return NextResponse.json({ success: true, certificates: certs });
  } catch (error) {
    return NextResponse.json({ error: "فشل تحميل الشهادات" }, { status: 500 });
  }
}

// POST: Add a new certificate (Admin, HR only)
export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_HR")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      traineeName, 
      courseName, 
      issueDate, 
      grade, 
      hours, 
      instructor, 
      status = "ACTIVE" 
    } = body;

    let { code } = body;

    if (!traineeName || !courseName || !issueDate) {
      return NextResponse.json({ error: "الاسم، الدورة، وتاريخ الإصدار حقول مطلوبة" }, { status: 400 });
    }

    // Generate unique code if not provided
    if (!code || !code.trim()) {
      code = `NAFSI-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const cert = await addCertificate({
      code: code.trim(),
      traineeName: traineeName.trim(),
      courseName: courseName.trim(),
      issueDate,
      grade: grade ? grade.trim() : undefined,
      hours: hours ? Number(hours) : undefined,
      instructor: instructor ? instructor.trim() : undefined,
      status
    });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    console.error("Error creating certificate:", error);
    return NextResponse.json({ error: error.message || "فشل إضافة الشهادة" }, { status: 500 });
  }
}

// DELETE: Remove a certificate (Admin, HR only)
export async function DELETE(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_HR")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "كود الشهادة مطلوب للحذف" }, { status: 400 });
    }

    const deleted = await deleteCertificate(code);
    if (!deleted) {
      return NextResponse.json({ error: "الشهادة غير موجودة أو تم حذفها بالفعل" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "تم حذف الشهادة بنجاح" });
  } catch (error) {
    return NextResponse.json({ error: "فشل حذف الشهادة" }, { status: 500 });
  }
}
