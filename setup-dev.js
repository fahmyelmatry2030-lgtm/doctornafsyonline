#!/usr/bin/env node

/**
 * Setup script للبيئة المحلية
 * تشغيل: npm run setup:dev أو node setup-dev.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 ============ LOCAL DEVELOPMENT SETUP ============\n');

try {
  // 1. تحقق من .env.local
  console.log('1️⃣  التحقق من .env.local...');
  const envLocalPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    console.log('⚠️  .env.local غير موجود. جاري الإنشاء...');
    const content = `NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET=local-dev-secret
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET=local-dev-secret
AUTH_URL="http://localhost:3000/api/auth"
AUTH_TRUST_HOST=true
LIVEKIT_API_KEY="APIMgHtZzn6BoE7"
LIVEKIT_API_SECRET="Zjq0OCivcl3WJ7zbYEudXQgvLG4xWp9KxQekzKT2EpT"
LIVEKIT_URL="wss://doctornafsyonline-1q28541a.livekit.cloud"
NEXT_PUBLIC_API_URL="http://localhost:3000"`;
    fs.writeFileSync(envLocalPath, content);
    console.log('✅ تم إنشاء .env.local\n');
  } else {
    console.log('✅ .env.local موجود\n');
  }

  // 2. تحقق من وجود schema.prisma
  console.log('2️⃣  التحقق من schema.prisma...');
  const schemaPrismaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (!fs.existsSync(schemaPrismaPath)) {
    console.log('❌ prisma/schema.prisma غير موجود!');
    process.exit(1);
  } else {
    console.log('✅ prisma/schema.prisma موجود\n');
  }

  // 3. تثبيت المكتبات
  console.log('3️⃣  التحقق من المكتبات...');
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('⚠️  node_modules غير موجود. جاري التثبيت...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ تم تثبيت المكتبات\n');
  } else {
    console.log('✅ المكتبات مثبتة\n');
  }

  // 4. إنشاء قاعدة البيانات
  console.log('4️⃣  إنشاء قاعدة البيانات SQLite...');
  const devDbPath = path.join(__dirname, 'prisma', 'dev.db');
  const sqliteSchemaPath = path.join(__dirname, 'prisma', 'schema.sqlite.prisma');

  if (!fs.existsSync(sqliteSchemaPath)) {
    console.error('❌ prisma/schema.sqlite.prisma غير موجود!');
    process.exit(1);
  }

  try {
    execSync('npx prisma db push --schema=prisma/schema.sqlite.prisma --skip-generate', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: 'file:./prisma/dev.db',
      },
    });
    console.log('✅ تم إنشاء قاعدة البيانات SQLite باستخدام schema.sqlite.prisma\n');
  } catch (e) {
    console.error('❌ فشل إنشاء قاعدة البيانات SQLite:');
    console.error(e.message);
    process.exit(1);
  }

  // 5. البناء المحلي
  console.log('5️⃣  بناء المشروع للتطوير...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ تم البناء بنجاح\n');

  console.log('✨ ============ SETUP COMPLETE ============\n');
  console.log('🎉 يمكنك الآن تشغيل: npm run dev\n');
  
} catch (error) {
  console.error('\n❌ حدث خطأ:\n', error.message);
  process.exit(1);
}
