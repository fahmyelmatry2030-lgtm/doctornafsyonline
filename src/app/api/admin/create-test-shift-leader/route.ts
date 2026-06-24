import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const TEST_PASSWORD = "TestPassword123";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create shift leaders" },
        { status: 403 }
      );
    }

    const shiftLeadersToCreate = [
      {
        email: "shiftleader1@test.com",
        name: "???? ?????? 1",
        phone: "+966501234561",
        shiftId: "shift-1",
        shiftName: "???? ??????",
        dayOfWeek: "WEDNESDAY",
        startTime: "08:00",
        endTime: "16:00",
      },
      {
        email: "shiftleader2@test.com",
        name: "???? ?????? 2",
        phone: "+966501234562",
        shiftId: "shift-2",
        shiftName: "???? ??????",
        dayOfWeek: "THURSDAY",
        startTime: "16:00",
        endTime: "00:00",
      },
      {
        email: "shiftleader3@test.com",
        name: "???? ?????? 3",
        phone: "+966501234563",
        shiftId: "shift-3",
        shiftName: "???? ?????",
        dayOfWeek: "FRIDAY",
        startTime: "18:00",
        endTime: "02:00",
      },
    ];

    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    const createdUsers: Array<{ id: string; email: string; name: string; role: string; status: string; shiftId: string }> = [];

    for (const leaderData of shiftLeadersToCreate) {
      const existingLeader = await prisma.user.findUnique({
        where: { email: leaderData.email },
      });

      const shiftLeader = existingLeader
        ? await prisma.user.update({
            where: { email: leaderData.email },
            data: {
              name: leaderData.name,
              password: hashedPassword,
              role: "SHIFT_LEADER",
              isOnline: false,
              isSuspended: false,
              phone: leaderData.phone,
            },
          })
        : await prisma.user.create({
            data: {
              email: leaderData.email,
              name: leaderData.name,
              password: hashedPassword,
              role: "SHIFT_LEADER",
              isOnline: false,
              isSuspended: false,
              phone: leaderData.phone,
            },
          });

      await prisma.shift.upsert({
        where: { id: leaderData.shiftId },
        update: {
          shiftLeaderId: shiftLeader.id,
          name: leaderData.shiftName,
          dayOfWeek: leaderData.dayOfWeek,
          startTime: leaderData.startTime,
          endTime: leaderData.endTime,
          description: `?? ????? ${shiftLeader.name} ????? ??????.`,
        },
        create: {
          id: leaderData.shiftId,
          name: leaderData.shiftName,
          dayOfWeek: leaderData.dayOfWeek,
          startTime: leaderData.startTime,
          endTime: leaderData.endTime,
          shiftLeaderId: shiftLeader.id,
          description: `?? ????? ${shiftLeader.name} ????? ??????.`,
        },
      });

      createdUsers.push({
        id: shiftLeader.id,
        email: shiftLeader.email,
        name: shiftLeader.name,
        role: shiftLeader.role,
        status: existingLeader ? "exists" : "created",
        shiftId: leaderData.shiftId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shift leaders and shift assignments created successfully",
      users: createdUsers,
      loginInfo: shiftLeadersToCreate.map((leader) => ({
        email: leader.email,
        password: TEST_PASSWORD,
        shiftId: leader.shiftId,
      })),
      note: "?? ???? ???? ?????? ??????? ?????? ?????? ?????? ?????? ???? ???.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const shiftLeaders = await prisma.user.findMany({
      where: { role: "SHIFT_LEADER" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isOnline: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: shiftLeaders.length,
      shiftLeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
