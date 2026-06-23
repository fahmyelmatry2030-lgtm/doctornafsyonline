-- Add isOnline and lastActivityAt to User table
ALTER TABLE `User`
  ADD COLUMN `isOnline` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Ensure unique indexes and integrity unchanged
