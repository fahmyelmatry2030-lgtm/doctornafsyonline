import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 12);

  const therapists = [
    {
      name: "د. سارة محمد",
      email: "sara@nafsi.com",
      bio: "أخصائية نفسية سريرية متخصصة في علاج القلق والاكتئاب واضطرابات المزاج. خبرة 8 سنوات في العيادات والاستشارات أونلاين.",
      specializations: JSON.stringify(["القلق والتوتر", "الاكتئاب", "نوبات الهلع"]),
      pricePerSession: 400,
      yearsExperience: 8,
      rating: 4.9,
      reviewCount: 127,
    },
    {
      name: "د. أحمد حسن",
      email: "ahmed@nafsi.com",
      bio: "معالج نفسي متخصص في العلاقات الزوجية والأسرية. أساعد الأزواج على بناء تواصل صحي وحل النزاعات.",
      specializations: JSON.stringify(["العلاقات الزوجية", "الإرشاد الأسري", "النمو الشخصي"]),
      pricePerSession: 350,
      yearsExperience: 6,
      rating: 4.8,
      reviewCount: 89,
    },
    {
      name: "د. نورا إبراهيم",
      email: "nora@nafsi.com",
      bio: "أخصائية نفسية للأطفال والمراهقين. خبرة في التعامل مع صعوبات التعلم والتنمر واضطرابات السلوك.",
      specializations: JSON.stringify(["مشكلات الأطفال والمراهقين", "الصدمات النفسية", "الثقة بالنفس"]),
      pricePerSession: 380,
      yearsExperience: 10,
      rating: 5.0,
      reviewCount: 156,
    },
    {
      name: "د. كريم عبدالله",
      email: "karim@nafsi.com",
      bio: "استشاري نفسي متخصص في الإدمان والاحتراق الوظيفي وإدارة الضغوط. نهج علاجي معرفي سلوكي.",
      specializations: JSON.stringify(["الإدمان", "الاحتراق الوظيفي", "ضغوط العمل"]),
      pricePerSession: 320,
      yearsExperience: 5,
      rating: 4.7,
      reviewCount: 64,
    },
    {
      name: "د. ليلى فاروق",
      email: "layla@nafsi.com",
      bio: "معالجة نفسية متخصصة في اضطرابات الأكل والصورة الذاتية والوسواس القهري.",
      specializations: JSON.stringify(["الوسواس القهري", "النمو الشخصي", "الاكتئاب"]),
      pricePerSession: 360,
      yearsExperience: 7,
      rating: 4.9,
      reviewCount: 98,
    },
  ];

  for (const t of therapists) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        password,
        role: "THERAPIST",
        therapistProfile: {
          create: {
            bio: t.bio,
            specializations: t.specializations,
            pricePerSession: t.pricePerSession,
            yearsExperience: t.yearsExperience,
            rating: t.rating,
            reviewCount: t.reviewCount,
            isVerified: true,
          },
        },
      },
    });
  }

  await prisma.user.upsert({
    where: { email: "patient@nafsi.com" },
    update: {},
    create: {
      name: "محمد علي",
      email: "patient@nafsi.com",
      password,
      role: "PATIENT",
      phone: "01012345678",
    },
  });

  console.log("✅ تم إنشاء البيانات التجريبية");
  console.log("   حساب مريض: patient@nafsi.com / 123456");
  console.log("   حساب أخصائي: sara@nafsi.com / 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
