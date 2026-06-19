const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database schema fix...');
  
  // 1. Try to add paymentScreenshot to Appointment table
  try {
    console.log('Adding paymentScreenshot column to Appointment table...');
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `Appointment` ADD COLUMN `paymentScreenshot` TEXT NULL;'
    );
    console.log('✅ paymentScreenshot column added successfully.');
  } catch (error) {
    if (error.message.includes('1060') || error.message.includes('Duplicate column')) {
      console.log('ℹ️ paymentScreenshot column already exists.');
    } else {
      console.error('❌ Error adding paymentScreenshot:', error.message);
    }
  }

  // 2. Try to add gender to User table
  try {
    console.log('Adding gender column to User table...');
    await prisma.$executeRawUnsafe(
      'ALTER TABLE `User` ADD COLUMN `gender` VARCHAR(191) NULL;'
    );
    console.log('✅ gender column added successfully.');
  } catch (error) {
    if (error.message.includes('1060') || error.message.includes('Duplicate column')) {
      console.log('ℹ️ gender column already exists.');
    } else {
      console.error('❌ Error adding gender column:', error.message);
    }
  }

  console.log('🎉 Database schema fix completed!');
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
