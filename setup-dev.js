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

  // 2. تحقق من schema.sqlite.prisma
  console.log('2️⃣  التحقق من SQLite schema...');
  const sqliteSchemPath = path.join(__dirname, 'prisma', 'schema.sqlite.prisma');
  if (!fs.existsSync(sqliteSchemPath)) {
    console.log('❌ schema.sqlite.prisma غير موجود!');
    console.log('ℹ️  يرجى تشغيل: npm run build:sqlite\n');
  } else {
    console.log('✅ schema.sqlite.prisma موجود\n');
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
  
  // نسخ schema.sqlite.prisma إلى schema.prisma مؤقتاً
  const schemPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const origContent = fs.readFileSync(schemPath, 'utf8');
  const sqliteContent = fs.readFileSync(sqliteSchemPath, 'utf8');
  
  fs.writeFileSync(schemPath, sqliteContent);
  console.log('✅ تبديل schema إلى SQLite');
  
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('✅ تم إنشاء قاعدة البيانات\n');
  } catch (e) {
    console.log('⚠️  قد توجد رسالة خطأ أعلاه. هذا طبيعي للمرة الأولى.\n');
  }
  
  // استعادة schema الأصلي
  fs.writeFileSync(schemPath, origContent);
  console.log('✅ استعادة MySQL schema\n');

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
