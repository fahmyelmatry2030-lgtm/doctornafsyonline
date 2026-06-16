import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";

export default async function PatientReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Fetch completed appointments without reviews
  const reviewableAppointments = await prisma.appointment.findMany({
    where: {
      patientId: session.user.id,
      status: "COMPLETED",
      review: null,
    },
    include: {
      therapist: { select: { name: true, avatar: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  // Fetch existing reviews
  const existingReviews = await prisma.review.findMany({
    where: { patientId: session.user.id },
    include: {
      appointment: {
        include: {
          therapist: { select: { name: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ReviewsClient
      reviewableAppointments={JSON.parse(JSON.stringify(reviewableAppointments))}
      existingReviews={JSON.parse(JSON.stringify(existingReviews))}
    />
  );
}
