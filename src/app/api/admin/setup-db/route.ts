import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const isSecretValid = secret === "NafsiDatabaseSetup2026";

  if (!isSecretValid) {
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  try {
    const results = [];
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN certificates TEXT NULL;`);
      results.push("Added certificates to TherapistProfile");
    } catch (e: any) { results.push("certificates: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN internationalPrice INT NULL;`);
      results.push("Added internationalPrice to TherapistProfile");
    } catch (e: any) { results.push("internationalPrice: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN internationalCurrency VARCHAR(191) NULL;`);
      results.push("Added internationalCurrency to TherapistProfile");
    } catch (e: any) { results.push("internationalCurrency: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE Appointment ADD COLUMN currency VARCHAR(191) NOT NULL DEFAULT 'EGP';`);
      results.push("Added currency to Appointment");
    } catch (e: any) { results.push("currency: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN contractUrl TEXT NULL;`);
      results.push("Added contractUrl to TherapistProfile");
    } catch (e: any) { results.push("contractUrl: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN isSuspended BOOLEAN NOT NULL DEFAULT false;`);
      results.push("Added isSuspended to User");
    } catch (e: any) { results.push("isSuspended: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN baseSalary INT NOT NULL DEFAULT 0;`);
      results.push("Added baseSalary to User");
    } catch (e: any) { results.push("baseSalary: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`EmployeeBonus\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`userId\` VARCHAR(191) NOT NULL,
          \`amount\` INTEGER NOT NULL,
          \`reason\` VARCHAR(191) NOT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`EmployeeBonus_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created EmployeeBonus table");
    } catch (e: any) { results.push("EmployeeBonus table: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN salary INT NOT NULL DEFAULT 0;`);
      results.push("Added salary to TherapistProfile");
    } catch (e: any) { results.push("salary: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN salaryType VARCHAR(191) NOT NULL DEFAULT 'FIXED';`);
      results.push("Added salaryType to TherapistProfile");
    } catch (e: any) { results.push("salaryType: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN paymentMethod VARCHAR(191) NOT NULL DEFAULT 'VODAFONE_CASH';`);
      results.push("Added paymentMethod to TherapistProfile");
    } catch (e: any) { results.push("paymentMethod: " + e.message); }

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE TherapistProfile ADD COLUMN paymentDetails VARCHAR(191) NOT NULL DEFAULT '';`);
      results.push("Added paymentDetails to TherapistProfile");
    } catch (e: any) { results.push("paymentDetails: " + e.message); }

    // Create SystemSetting Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`SystemSetting\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`key\` VARCHAR(191) NOT NULL,
          \`value\` TEXT NOT NULL,
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE INDEX \`SystemSetting_key_key\`(\`key\`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created SystemSetting table");
    } catch (e: any) { results.push("SystemSetting table: " + e.message); }

    // Create Shift Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`Shift\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`name\` VARCHAR(191) NOT NULL,
          \`startTime\` VARCHAR(191) NOT NULL,
          \`endTime\` VARCHAR(191) NOT NULL,
          \`dayOfWeek\` VARCHAR(191) NOT NULL,
          \`description\` TEXT NULL,
          \`isActive\` BOOLEAN NOT NULL DEFAULT true,
          \`shiftLeaderId\` VARCHAR(191) NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`Shift_shiftLeaderId_fkey\` FOREIGN KEY (\`shiftLeaderId\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created Shift table");
    } catch (e: any) { results.push("Shift table: " + e.message); }

    // Create SpecialistShiftAssignment Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`SpecialistShiftAssignment\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`shiftId\` VARCHAR(191) NOT NULL,
          \`therapistId\` VARCHAR(191) NOT NULL,
          \`isActive\` BOOLEAN NOT NULL DEFAULT true,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`),
          UNIQUE INDEX \`SpecialistShiftAssignment_shiftId_therapistId_key\`(\`shiftId\`, \`therapistId\`),
          CONSTRAINT \`SpecialistShiftAssignment_shiftId_fkey\` FOREIGN KEY (\`shiftId\`) REFERENCES \`Shift\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT \`SpecialistShiftAssignment_therapistId_fkey\` FOREIGN KEY (\`therapistId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created SpecialistShiftAssignment table");
    } catch (e: any) { results.push("SpecialistShiftAssignment table: " + e.message); }

    // Create AvailableSlot Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`AvailableSlot\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`therapistId\` VARCHAR(191) NOT NULL,
          \`slotStartTime\` DATETIME(3) NOT NULL,
          \`slotEndTime\` DATETIME(3) NOT NULL,
          \`duration\` INTEGER NOT NULL DEFAULT 50,
          \`isBooked\` BOOLEAN NOT NULL DEFAULT false,
          \`appointmentId\` VARCHAR(191) NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          UNIQUE INDEX \`AvailableSlot_appointmentId_key\`(\`appointmentId\`),
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`AvailableSlot_therapistId_fkey\` FOREIGN KEY (\`therapistId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT \`AvailableSlot_appointmentId_fkey\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`Appointment\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created AvailableSlot table");
    } catch (e: any) { results.push("AvailableSlot table: " + e.message); }

    // Create SessionStatus Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`SessionStatus\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`appointmentId\` VARCHAR(191) NOT NULL,
          \`status\` VARCHAR(191) NOT NULL DEFAULT 'SCHEDULED',
          \`patientJoinedAt\` DATETIME(3) NULL,
          \`therapistJoinedAt\` DATETIME(3) NULL,
          \`sessionStartedAt\` DATETIME(3) NULL,
          \`sessionEndedAt\` DATETIME(3) NULL,
          \`roomName\` VARCHAR(191) NULL,
          \`recordingUrl\` TEXT NULL,
          \`notes\` TEXT NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          UNIQUE INDEX \`SessionStatus_appointmentId_key\`(\`appointmentId\`),
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`SessionStatus_appointmentId_fkey\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`Appointment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created SessionStatus table");
    } catch (e: any) { results.push("SessionStatus table: " + e.message); }

    // Create Commission Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`Commission\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`shiftLeaderId\` VARCHAR(191) NOT NULL,
          \`specialistId\` VARCHAR(191) NOT NULL,
          \`appointmentId\` VARCHAR(191) NOT NULL,
          \`sessionAmount\` INTEGER NOT NULL,
          \`shiftLeaderCommissionPercent\` DOUBLE NOT NULL DEFAULT 10.0,
          \`specialistCommissionPercent\` DOUBLE NOT NULL DEFAULT 50.0,
          \`shiftLeaderEarnings\` INTEGER NOT NULL,
          \`specialistEarnings\` INTEGER NOT NULL,
          \`isPaid\` BOOLEAN NOT NULL DEFAULT false,
          \`paidAt\` DATETIME(3) NULL,
          \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          \`updatedAt\` DATETIME(3) NOT NULL,
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`Commission_shiftLeaderId_fkey\` FOREIGN KEY (\`shiftLeaderId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT \`Commission_specialistId_fkey\` FOREIGN KEY (\`specialistId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT \`Commission_appointmentId_fkey\` FOREIGN KEY (\`appointmentId\`) REFERENCES \`Appointment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created Commission table");
    } catch (e: any) { results.push("Commission table: " + e.message); }

    // Create OnlineStatusLog Table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS \`OnlineStatusLog\` (
          \`id\` VARCHAR(191) NOT NULL,
          \`userId\` VARCHAR(191) NOT NULL,
          \`status\` VARCHAR(191) NOT NULL,
          \`timestamp\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          PRIMARY KEY (\`id\`),
          CONSTRAINT \`OnlineStatusLog_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      results.push("Created OnlineStatusLog table");
    } catch (e: any) { results.push("OnlineStatusLog table: " + e.message); }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
