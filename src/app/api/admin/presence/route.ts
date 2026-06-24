import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.role?.startsWith("ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch all users except PATIENT
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "PATIENT"
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isOnline: true,
        lastActivityAt: true,
        isSuspended: true,
      },
    });

    const now = new Date();

    // Map through users to enforce 5-minute timeout for 'isOnline'
    // If a user hasn't been active in the last 5 minutes, we force their status to offline
    const processedUsers = users.map(user => {
      const lastActivity = new Date(user.lastActivityAt);
      const diffMins = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      const isActuallyOnline = user.isOnline && diffMins <= 5;

      return {
        ...user,
        isOnline: isActuallyOnline,
      };
    });

    // Sort: Online users first, then by lastActivityAt descending
    processedUsers.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
    });

    return NextResponse.json(processedUsers);
  } catch (error) {
    console.error("Failed to fetch user presence:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
