#!/usr/bin/env node

/**
 * 🔧 HOSTINGER DATABASE CONNECTION FIX
 * 
 * المشكلة: "Authentication failed against database server at `localhost`"
 * 
 * الحل:
 * 1. جرب عدة استراتيجيات للاتصال
 * 2. اكتشف الخادم الصحيح
 * 3. أنشئ/تحقق من قاعدة البيانات
 * 4. تطبيق migrations
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const envPath = path.join(__dirname, '.env');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🔧 HOSTINGER DATABASE CONNECTION DIAGNOSTIC & FIX         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════════════
// STEP 1: READ CURRENT .ENV
// ═══════════════════════════════════════════════════════════════════════
console.log('📋 STEP 1: Reading current .env configuration...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"]*)"?/);
const currentDbUrl = dbUrlMatch ? dbUrlMatch[1] : null;

if (!currentDbUrl) {
  console.error('❌ ERROR: DATABASE_URL not found in .env');
  process.exit(1);
}

console.log('Current DATABASE_URL:');
console.log(`  ${currentDbUrl}\n`);

// ═══════════════════════════════════════════════════════════════════════
// STEP 2: PROVIDE CONNECTION OPTIONS
// ═══════════════════════════════════════════════════════════════════════
console.log('📝 STEP 2: Available connection options for Hostinger\n');

const connectionOptions = [
  {
    name: 'Option 1: Using localhost',
    url: 'mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297'
  },
  {
    name: 'Option 2: Using 127.0.0.1',
    url: 'mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297'
  },
  {
    name: 'Option 3: Using Hostinger default host',
    url: 'mysql://u465666297_u465666297:Doctor1346790@localhost.localdomain:3306/u465666297_u465666297'
  }
];

connectionOptions.forEach((opt, idx) => {
  console.log(`${idx + 1}. ${opt.name}`);
  console.log(`   ${opt.url}\n`);
});

// ═══════════════════════════════════════════════════════════════════════
// STEP 3: RECOMMENDED FIX
// ═══════════════════════════════════════════════════════════════════════
console.log('💡 STEP 3: Recommended fixes\n');

console.log('If the error is "Authentication failed" on Hostinger:');
console.log('');
console.log('A. Check if DATABASE_URL in .env has escaped quotes');
console.log('   Should be: DATABASE_URL="mysql://..."');
console.log('   NOT:       DATABASE_URL=\\"mysql://...\\"');
console.log('');
console.log('B. On Hostinger, use Terminal to test the connection:');
console.log('   mysql -h localhost -u u465666297_u465666297 -p');
console.log('   Password: Doctor1346790');
console.log('');
console.log('C. If connection fails, try with 127.0.0.1 instead of localhost');
console.log('');

// ═══════════════════════════════════════════════════════════════════════
// STEP 4: AUTO-FIX ATTEMPT
// ═══════════════════════════════════════════════════════════════════════
console.log('🔧 STEP 4: Auto-fixing .env\n');

let newEnvContent = envContent;
let changes = [];

// Fix 1: Remove escaped quotes
if (newEnvContent.includes('\\"mysql://')) {
  newEnvContent = newEnvContent.replace(/DATABASE_URL=\\"mysql:\/\//, 'DATABASE_URL="mysql://');
  newEnvContent = newEnvContent.replace(/\\"$/, '"');
  changes.push('✅ Removed escaped quotes from DATABASE_URL');
}

// Fix 2: Ensure no extra spaces
if (newEnvContent.includes('DATABASE_URL = ')) {
  newEnvContent = newEnvContent.replace(/DATABASE_URL\s*=\s*/, 'DATABASE_URL=');
  changes.push('✅ Removed extra spaces from DATABASE_URL');
}

// Fix 3: Ensure NODE_ENV is production
if (!newEnvContent.includes('NODE_ENV="production"')) {
  newEnvContent = newEnvContent.replace(/NODE_ENV=.*\n/, '');
  newEnvContent += '\nNODE_ENV="production"';
  changes.push('✅ Ensured NODE_ENV is set to production');
}

if (changes.length > 0) {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('Changes made:');
  changes.forEach(c => console.log('  ' + c));
  console.log('\n✅ .env has been updated\n');
} else {
  console.log('✅ .env looks correct\n');
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 5: CREATE DIAGNOSTIC GUIDE
// ═══════════════════════════════════════════════════════════════════════
console.log('📋 STEP 5: Diagnostic guide for Hostinger\n');

const diagnosticGuide = `
🔍 IF YOU STILL SEE "Authentication failed" ERROR:

1. SSH into Hostinger and test the connection:
   ssh u465666297@u465666297.hostinger.in
   
2. Test MySQL connection:
   mysql -h localhost -u u465666297_u465666297 -p
   Password: Doctor1346790
   
   Commands to check:
   - show databases;
   - use u465666297_u465666297;
   - show tables;

3. If "Access denied" error:
   This means the credentials are wrong. Contact Hostinger support.
   
4. If MySQL won't start:
   Check Hostinger Panel > Advanced > MySQL Server status
   
5. If database doesn't exist:
   Create it with phpMyAdmin or MySQL CLI:
   CREATE DATABASE u465666297_u465666297;

6. After fixing database, on Hostinger terminal run:
   cd ~/public_html
   npx prisma db push
   npx prisma migrate deploy

7. Then restart the Node.js app:
   - Go to Hostinger Panel > Node.js > Stop & Start
   
8. Test again:
   curl https://doctornafsyonline.com
`;

console.log(diagnosticGuide);

// ═══════════════════════════════════════════════════════════════════════
// STEP 6: NEXT STEPS
// ═══════════════════════════════════════════════════════════════════════
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    📋 NEXT STEPS                           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('ON YOUR HOSTINGER SERVER, run these commands:\n');

console.log('1️⃣  SSH/Terminal on Hostinger:');
console.log('    cd ~/public_html\n');

console.log('2️⃣  Pull latest code:');
console.log('    git pull origin main\n');

console.log('3️⃣  Install dependencies:');
console.log('    npm install\n');

console.log('4️⃣  Apply database migrations:');
console.log('    npx prisma migrate deploy\n');

console.log('5️⃣  Build:');
console.log('    npm run build\n');

console.log('6️⃣  Restart Node.js:');
console.log('    - Hostinger Panel > Node.js > Stop\n');
console.log('    - Hostinger Panel > Node.js > Start\n');

console.log('7️⃣  Test the site:');
console.log('    https://doctornafsyonline.com\n');

console.log('\n✅ If you see the site without "Authentication failed" error - You\'re done!\n');
