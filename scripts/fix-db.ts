import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating existing users to default country (Egypt)...");
  
  const result = await prisma.user.updateMany({
    data: {
      country: "Egypt",
      countryCode: "+20",
      currency: "EGP",
    }
  });

  console.log(`Updated ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
