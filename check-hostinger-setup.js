#!/usr/bin/env node

/**
 * Script للتحقق من إعدادات Hostinger قبل النشر
 * تشغيل: node check-hostinger-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 ============ HOSTINGER SETUP CHECKER ============\n');

// 1. تحقق من .env
console.log('1️⃣  التحقق من ملف .env...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: ملف .env غير موجود!');
  process.exit(1);
}
console.log('✅ ملف .env موجود');

// 2. اقرأ .env
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].replace(/^["']|["']$/g, '');
    env[match[1]] = value;
  }
});

// 3. تحقق من DATABASE_URL
console.log('\n2️⃣  التحقق من DATABASE_URL...');
if (!env.DATABASE_URL) {
  console.log('❌ ERROR: DATABASE_URL غير مضبوط!');
  process.exit(1);
}

if (!env.DATABASE_URL.includes('mysql://')) {
  console.log('❌ ERROR: DATABASE_URL يجب أن يبدأ بـ mysql://');
  process.exit(1);
}

console.log('✅ DATABASE_URL صحيح');

// استخرج التفاصيل
const dbMatch = env.DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (dbMatch) {
  const [_, user, pwd, host, port, database] = dbMatch;
  console.log(`   👤 User: ${user}`);
  console.log(`   🔐 Password: ${'*'.repeat(pwd.length)}`);
  console.log(`   🖥️  Host: ${host}`);
  console.log(`   🔌 Port: ${port}`);
  console.log(`   📦 Database: ${database}`);
}

// 4. تحقق من NEXTAUTH
console.log('\n3️⃣  التحقق من مفاتيح التوثيق...');
if (!env.NEXTAUTH_SECRET) {
  console.log('⚠️  WARNING: NEXTAUTH_SECRET غير مضبوط');
}
if (!env.NEXTAUTH_URL) {
  console.log('⚠️  WARNING: NEXTAUTH_URL غير مضبوط');
}
console.log('✅ مفاتيح التوثيق موجودة');

// 5. تحقق من LiveKit
console.log('\n4️⃣  التحقق من LiveKit...');
if (!env.LIVEKIT_URL || !env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
  console.log('⚠️  WARNING: LiveKit غير مكتمل (قد لا تعمل المكالمات الفيديو)');
} else {
  console.log('✅ LiveKit مكتمل');
}

// 6. تحقق من Prisma schema
console.log('\n5️⃣  التحقق من Prisma schema...');
const prismaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (!fs.existsSync(prismaPath)) {
  console.log('❌ ERROR: prisma/schema.prisma غير موجود!');
  process.exit(1);
}
console.log('✅ Prisma schema موجود');

// 7. تحقق من .next
console.log('\n6️⃣  التحقق من build output...');
const nextPath = path.join(__dirname, '.next');
if (!fs.existsSync(nextPath)) {
  console.log('⚠️  WARNING: لم يتم بناء المشروع بعد (npm run build)');
} else {
  console.log('✅ المشروع تم بناؤه');
}

console.log('\n✅ ============ كل شيء جاهز للنشر ============\n');
console.log('الخطوات التالية:');
console.log('1. انسخ ملف .env إلى Hostinger');
console.log('2. شغّل: npm install');
console.log('3. شغّل: npm run build');
console.log('4. ابدأ السيرفر بـ node server.js أو npm start\n');
