import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialization = searchParams.get("specialization");

  const therapists = await prisma.user.findMany({
    where: {
      role: "THERAPIST",
      therapistProfile: {
        isAvailable: true,
        ...(specialization && {
          specializations: { contains: specialization },
        }),
      },
    },
    include: { therapistProfile: true },
    orderBy: { therapistProfile: { rating: "desc" } },
  });

  const now = new Date();
  const processedTherapists = therapists.map(t => ({
    ...t,
    isOnline: t.isOnline && (now.getTime() - new Date(t.lastActivityAt).getTime()) / 60000 <= 15
  }));

  return NextResponse.json(processedTherapists);
}
