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

  return (
    <TherapistDetailClient
      therapist={{
        id: therapist.id,
        name: therapist.name,
        therapistProfile: therapist.therapistProfile,
      }}
    />
  );
}
