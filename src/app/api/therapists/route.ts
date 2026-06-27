import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialization = searchParams.get("specialization");

  const rawTherapists = await prisma.user.findMany({
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

  // Filter out therapists whose 14-day trial has expired and who have not uploaded / had approved their annual contract
  const therapists = rawTherapists.filter(t => {
    if (!t.therapistProfile) return false;
    
    const profileCreatedAt = new Date(t.therapistProfile.createdAt);
    const daysSinceCreation = (now.getTime() - profileCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation >= 14) {
      const contractVal = t.therapistProfile.contractUrl;
      let annualApproved = false;
      if (contractVal && contractVal.startsWith("{")) {
        try {
          const parsed = JSON.parse(contractVal);
          if (parsed.annual && parsed.annual.status === "APPROVED") {
            annualApproved = true;
          }
        } catch {}
      }
      if (!annualApproved) {
        return false;
      }
    }
    return true;
  });

  const processedTherapists = therapists.map(t => ({
    ...t,
    isOnline: t.isOnline && (now.getTime() - new Date(t.lastActivityAt).getTime()) / 60000 <= 15
  }));

  return NextResponse.json(processedTherapists);
}
