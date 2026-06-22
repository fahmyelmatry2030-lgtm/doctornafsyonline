const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 بدء إضافة بيانات الاختبار...");

  try {
    // 1. إنشاء فترات عمل (Shifts)
    const shifts = await Promise.all([
      prisma.shift.upsert({
        where: { id: "shift-1" },
        update: {},
        create: {
          id: "shift-1",
          dayOfWeek: 3,
          startTime: "16:00",
          endTime: "00:00",
          capacity: 8,
        },
      }),
      prisma.shift.upsert({
        where: { id: "shift-2" },
        update: {},
        create: {
          id: "shift-2",
          dayOfWeek: 4,
          startTime: "18:00",
          endTime: "02:00",
          capacity: 8,
        },
      }),
      prisma.shift.upsert({
        where: { id: "shift-3" },
        update: {},
        create: {
          id: "shift-3",
          dayOfWeek: 5,
          startTime: "16:00",
          endTime: "23:59",
          capacity: 8,
        },
      }),
    ]);

    console.log("✅ تم إنشاء 3 فترات عمل");

    // 2. إنشاء فترات متاحة (Available Slots)
    const today = new Date();
    const slots = [];

    for (let i = 0; i < 12; i++) {
      const startTime = new Date(today);
      startTime.setHours(16 + Math.floor(i / 3), 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      slots.push(
        prisma.availableSlot.create({
          data: {
            therapistId: `therapist-${(i % 4) + 1}`,
            slotStartTime: startTime,
            slotEndTime: endTime,
            duration: 50,
            isBooked: i % 3 === 0,
          },
        }).catch(() => null)
      );
    }

    await Promise.all(slots);
    console.log("✅ تم إنشاء 12 موعد متاح");

    // 3. إنشاء حالات جلسات (Session Status)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const sessions = [
      {
        appointmentId: "apt-001",
        status: "IN_PROGRESS",
        patientJoinedAt: twoHoursAgo,
        therapistJoinedAt: twoHoursAgo,
        sessionStartedAt: twoHoursAgo,
      },
      {
        appointmentId: "apt-002",
        status: "THERAPIST_JOINED",
        patientJoinedAt: null,
        therapistJoinedAt: oneHourAgo,
        sessionStartedAt: null,
      },
      {
        appointmentId: "apt-003",
        status: "PATIENT_JOINED",
        patientJoinedAt: oneHourAgo,
        therapistJoinedAt: null,
        sessionStartedAt: null,
      },
      {
        appointmentId: "apt-004",
        status: "SCHEDULED",
        patientJoinedAt: null,
        therapistJoinedAt: null,
        sessionStartedAt: null,
      },
    ];

    for (const session of sessions) {
      await prisma.sessionStatus.upsert({
        where: { appointmentId: session.appointmentId },
        update: session,
        create: session,
      }).catch(() => null);
    }

    console.log("✅ تم إنشاء 4 جلسات اختبار");

    // 4. إنشاء تعيينات الأخصائيين للفترات
    const assignments = [];
    for (let i = 1; i <= 8; i++) {
      for (let j = 0; j < 3; j++) {
        assignments.push(
          prisma.specialistShiftAssignment.create({
            data: {
              therapistId: `therapist-${i}`,
              shiftId: `shift-${j + 1}`,
            },
          }).catch(() => null)
        );
      }
    }

    await Promise.all(assignments);
    console.log("✅ تم إنشاء 24 تعيين للأخصائيين");

    console.log("\n✨ تم إضافة جميع البيانات بنجاح!");
    console.log("\n📊 ملخص البيانات:");
    console.log("   • فترات عمل: 3");
    console.log("   • مواعيد متاحة: 12");
    console.log("   • جلسات: 4");
    console.log("   • تعيينات: 24");
    console.log("   • أخصائيين: 8");
  } catch (error) {
    console.error("❌ خطأ أثناء إضافة البيانات:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
