import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database connection...");
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
      }
    });
    console.log("Database connection successful!");
    console.log(`Found ${users.length} users:`);
    console.log(JSON.stringify(users, null, 2));

    const admin = await prisma.user.findFirst({
      where: { email: "admin@nafsi.com" }
    });

    if (admin) {
      const isNewPassword = await bcrypt.compare("Doctor1346790", admin.password);
      const isOldPassword = await bcrypt.compare("123456", admin.password);
      console.log("Admin user diagnostics:");
      console.log(`- Email: ${admin.email}`);
      console.log(`- Role: ${admin.role}`);
      console.log(`- Suspended: ${admin.isSuspended}`);
      console.log(`- Password 'Doctor1346790' correct: ${isNewPassword}`);
      console.log(`- Password '123456' correct: ${isOldPassword}`);
    } else {
      console.log("No user found with email admin@nafsi.com");
    }
  } catch (error) {
    console.error("Database check failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
