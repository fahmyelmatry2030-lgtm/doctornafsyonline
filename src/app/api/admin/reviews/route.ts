import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || (role !== "ADMIN" && role !== "ADMIN_VIEWER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    include: { patient: { select: { name: true } }, appointment: { include: { therapist: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const mapped = reviews.map(r => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, patient: r.patient, therapist: r.appointment.therapist }));
  return NextResponse.json(mapped);
}
