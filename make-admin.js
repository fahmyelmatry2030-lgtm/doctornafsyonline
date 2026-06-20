const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("\n❌ الرجاء إدخال البريد الإلكتروني للحساب المراد ترقيته.");
    console.log("مثال: node make-admin.js user@example.com\n");
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      console.log(`\n❌ المستخدم صاحب البريد الإلكتروني (${cleanEmail}) غير موجود.\n`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: { role: 'ADMIN' }
    });

    console.log(`\n✅ تم ترقية المستخدم "${updatedUser.name}" (${updatedUser.email}) إلى رتبة ADMIN (مدير عام).`);
    console.log("ولديه الآن صلاحية كاملة للوصول والتعديل على كل نقطة في المنصة. 👑\n");
  } catch (error) {
    console.error("حدث خطأ أثناء ترقية الحساب:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
