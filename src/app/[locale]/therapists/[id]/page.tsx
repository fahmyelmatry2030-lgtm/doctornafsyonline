import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TherapistDetailClient from "./TherapistDetailClient";
import { getSettings } from "@/app/[locale]/admin/settings/actions";
import { auth } from "@/lib/auth";

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

  const settings = await getSettings();
  
  const session = await auth();
  let currentUserCurrency = undefined;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { currency: true } });
    if (user?.currency) {
      currentUserCurrency = user.currency;
    }
  }

  return (
    <TherapistDetailClient
      therapist={{
        id: therapist.id,
        name: therapist.name,
        avatar: therapist.avatar,
        currency: therapist.currency,
        isOnline: therapist.isOnline && (new Date().getTime() - new Date(therapist.lastActivityAt).getTime()) / 60000 <= 3,
        therapistProfile: therapist.therapistProfile,
      }}
      currentUserCurrency={currentUserCurrency}
      reviews={JSON.parse(JSON.stringify(reviews))}
      sessionDuration={settings.sessionDuration}
    />
  );
}
