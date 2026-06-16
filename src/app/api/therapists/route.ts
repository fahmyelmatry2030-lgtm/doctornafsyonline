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

  return NextResponse.json(therapists);
}
