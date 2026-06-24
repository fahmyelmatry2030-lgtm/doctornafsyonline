import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TherapistDetailClient from "./TherapistDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TherapistPage({ params }: Props) {
  const { id } = await params;

  const therapist = await prisma.user.findUnique({
    where: { id, role: "THERAPIST" },
    include: { therapistProfile: true },
  });

  if (!therapist?.therapistProfile) notFound();

  const reviews = await prisma.review.findMany({
    where: { therapistId: id, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      patient: { select: { name: true, avatar: true } }
    }
  });

  return (
    <TherapistDetailClient
      therapist={{
        id: therapist.id,
        name: therapist.name,
        avatar: therapist.avatar,
        isOnline: therapist.isOnline,
        therapistProfile: therapist.therapistProfile,
      }}
      reviews={JSON.parse(JSON.stringify(reviews))}
    />
  );
}
