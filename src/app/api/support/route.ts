import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Allow unauthenticated users too, or require auth based on design.
    // Assuming anyone can submit a support ticket if they provide name/email.
    
    const { subject, message, userName, userEmail } = await req.json();

    if (!subject || !message || (!session?.user && (!userName || !userEmail))) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        userName: session?.user?.name || userName,
        userEmail: session?.user?.email || userEmail,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Support API Error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
