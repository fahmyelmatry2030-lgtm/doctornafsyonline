import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { appointmentId, rating, comment } = await req.json();

    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    // Verify the appointment belongs to this patient and is completed
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: session.user.id,
        status: "COMPLETED",
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "الموعد غير موجود أو غير مكتمل" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "تم تقييم هذه الجلسة مسبقاً" },
        { status: 409 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        appointmentId,
        patientId: session.user.id,
        therapistId: appointment.therapistId,
        rating,
        comment: comment || null,
      },
    });

    // Update therapist's average rating
    const therapistReviews = await prisma.review.findMany({
      where: { therapistId: appointment.therapistId },
      select: { rating: true },
    });

    const avgRating =
      therapistReviews.reduce((sum, r) => sum + r.rating, 0) /
      therapistReviews.length;

    await prisma.therapistProfile.update({
      where: { userId: appointment.therapistId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: therapistReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
