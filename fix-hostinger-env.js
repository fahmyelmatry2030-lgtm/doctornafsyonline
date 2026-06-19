#!/usr/bin/env node

/**
 * Script لإصلاح .env على Hostinger
 * تشغيل: node fix-hostinger-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 ============ FIXING HOSTINGER .ENV ============\n');

const envPath = path.join(__dirname, '.env');

// 1. تحقق من وجود .env
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  process.exit(1);
}

// 2. اقرأ محتوى .env
const envContent = fs.readFileSync(envPath, 'utf8');

// 3. تحقق من المشكلة
if (envContent.includes('file:./dev.db') || envContent.includes('file:./database.db')) {
  console.log('🔍 Found legacy database URL in .env');
  console.log('   Old: file:./dev.db');
  console.log('   Replacing with: mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297');
  
  // 4. استبدل القيمة القديمة
  let newEnvContent = envContent
    .replace(/DATABASE_URL="file:.*?"/, 'DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"')
    .replace(/DATABASE_URL='file:.*?'/, "DATABASE_URL='mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297'")
    .replace(/DATABASE_URL=file:.*/, 'DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"');
  
  // 5. أضف المتغيرات الناقصة إذا لم تكن موجودة
  if (!newEnvContent.includes('NEXTAUTH_URL')) {
    newEnvContent += '\nNEXTAUTH_URL="https://doctornafsyonline.com"';
  }
  if (!newEnvContent.includes('NODE_ENV')) {
    newEnvContent += '\nNODE_ENV="production"';
  }
  if (!newEnvContent.includes('NEXT_PUBLIC_API_URL')) {
    newEnvContent += '\nNEXT_PUBLIC_API_URL="https://doctornafsyonline.com"';
  }
  
  // 6. احفظ الملف الجديد
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ .env has been fixed and updated!\n');
  console.log('📋 Next steps:');
  console.log('   1. npm install');
  console.log('   2. npm run build');
  console.log('   3. Restart Node.js server\n');
} else if (envContent.includes('mysql://')) {
  console.log('✅ .env already has correct MySQL URL\n');
} else {
  console.log('⚠️  DATABASE_URL format is unknown. Please check manually.\n');
}
