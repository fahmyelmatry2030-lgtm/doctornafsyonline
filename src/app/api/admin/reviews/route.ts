import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { patient: { select: { name: true } }, appointment: { include: { therapist: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const mapped = reviews.map(r => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, patient: r.patient, therapist: r.appointment.therapist }));
  return NextResponse.json(mapped);
}
