import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Simulating therapist registration...");
  try {
    const email = `test-therapist-${Date.now()}@nafsi.com`;
    const hashedPassword = await bcrypt.hash("Doctor1346790", 12);
    
    const user = await prisma.user.create({
      data: {
        name: "دكتور معالج تجريبي",
        email,
        password: hashedPassword,
        phone: "01099999999",
        role: "THERAPIST",
        therapistProfile: {
          create: {
            bio: "أخصائي نفسي جديد",
            specializations: JSON.stringify(["القلق", "الاكتئاب"]),
            pricePerSession: 300,
            yearsExperience: 5,
          },
        },
      },
      include: {
        therapistProfile: true,
      }
    });
    
    console.log("Therapist registered successfully in DB:", user);
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Test cleanup completed successfully.");
    
  } catch (error) {
    console.error("Therapist registration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
