-- CreateTable Shift
CREATE TABLE `Shift` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `description` LONGTEXT,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable SpecialistShiftAssignment
CREATE TABLE `SpecialistShiftAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `shiftId` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SpecialistShiftAssignment_shiftId_therapistId_key`(`shiftId`, `therapistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable AvailableSlot
CREATE TABLE `AvailableSlot` (
    `id` VARCHAR(191) NOT NULL,
    `therapistId` VARCHAR(191) NOT NULL,
    `slotStartTime` DATETIME(3) NOT NULL,
    `slotEndTime` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL DEFAULT 50,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `appointmentId` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AvailableSlot_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable SessionStatus
CREATE TABLE `SessionStatus` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SCHEDULED',
    `patientJoinedAt` DATETIME(3),
    `therapistJoinedAt` DATETIME(3),
    `sessionStartedAt` DATETIME(3),
    `sessionEndedAt` DATETIME(3),
    `roomName` VARCHAR(191),
    `recordingUrl` LONGTEXT,
    `notes` LONGTEXT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SessionStatus_appointmentId_key`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SpecialistShiftAssignment` ADD CONSTRAINT `SpecialistShiftAssignment_shiftId_fkey` FOREIGN KEY (`shiftId`) REFERENCES `Shift`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SpecialistShiftAssignment` ADD CONSTRAINT `SpecialistShiftAssignment_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlot` ADD CONSTRAINT `AvailableSlot_therapistId_fkey` FOREIGN KEY (`therapistId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AvailableSlot` ADD CONSTRAINT `AvailableSlot_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionStatus` ADD CONSTRAINT `SessionStatus_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
