#!/usr/bin/env node

/**
 * Script لإعادة النشر السريعة على Hostinger
 * تشغيل: node deploy-to-hostinger.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🚀 ============ DEPLOYING TO HOSTINGER ============\n');

try {
  // 1. تحقق من Git
  console.log('1️⃣  التحقق من Git...');
  try {
    execSync('git status', { stdio: 'ignore' });
    console.log('✅ Git جاهز\n');
  } catch (e) {
    console.log('❌ Git غير مهيأ في هذا المجلد\n');
    process.exit(1);
  }

  // 2. عرض الملفات المتغيرة
  console.log('2️⃣  الملفات المتغيرة:');
  const status = execSync('git status --short', { encoding: 'utf8' });
  console.log(status);

  // 3. إضافة جميع الملفات
  console.log('3️⃣  إضافة الملفات...');
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ تمت الإضافة\n');

  // 4. عمل Commit إذا كانت هناك تغييرات
  console.log('4️⃣  إنشاء Commit...');
  const hasChanges = status.trim().length > 0;
  if (hasChanges) {
    const timestamp = new Date().toLocaleString('ar-SA');
    const commitMsg = `🔧 Fix 503 error - Database configuration for Hostinger (${timestamp})`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    console.log('✅ تم الـ Commit\n');
  } else {
    console.log('ℹ️  لا توجد تغييرات جديدة للاستدعاء، تخطيت خطوة الـ Commit\n');
  }

  // 5. Push
  console.log('5️⃣  رفع التغييرات (Git Push)...');
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ تم الرفع\n');

  console.log('✅ ============ DEPLOYMENT COMPLETE ============\n');
  console.log('الخطوات التالية على Hostinger:');
  console.log('1. انتظر لـ Hostinger يسحب التغييرات من Git (أو قم بـ pull يدويّ)');
  console.log('2. تأكد من وجود .env صحيح على السيرفر');
  console.log('3. شغّل: npm install');
  console.log('4. شغّل: npm run build');
  console.log('5. أعد تشغيل السيرفر\n');

} catch (error) {
  console.log('\n❌ حدث خطأ:\n', error.message);
  process.exit(1);
}
