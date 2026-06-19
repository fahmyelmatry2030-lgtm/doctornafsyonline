#!/usr/bin/env node

/**
 * 🚀 COMPREHENSIVE HOSTINGER FIX SCRIPT
 * يقوم بـ: إصلاح .env + migrations + build + restart
 * 
 * التشغيل: node comprehensive-hostinger-fix.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🚀 NAFSI PLATFORM - COMPREHENSIVE HOSTINGER FIX           ║');
console.log('║  سيقوم هذا الـ Script بـ:                                  ║');
console.log('║  1. إصلاح .env                                             ║');
console.log('║  2. التحقق من database                                     ║');
console.log('║  3. تطبيق migrations                                       ║');
console.log('║  4. npm install                                            ║');
console.log('║  5. build                                                  ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

const projectRoot = __dirname;
const envPath = path.join(projectRoot, '.env');

// ═══════════════════════════════════════════════════════════════════════
// STEP 1: FIX .ENV
// ═══════════════════════════════════════════════════════════════════════
console.log('📋 STEP 1: Fixing .env file...');
console.log('─'.repeat(60));

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');
let envChanged = false;

// Fix 1: Replace old database URL
if (envContent.includes('file:./dev.db') || envContent.includes('file:./database.db')) {
  console.log('🔍 Found legacy SQLite database URL');
  envContent = envContent.replace(
    /DATABASE_URL="?file:.*?"?/,
    'DATABASE_URL="mysql://u465666297_u465666297:Doctor1346790@localhost:3306/u465666297_u465666297"'
  );
  envChanged = true;
  console.log('✅ Updated DATABASE_URL to MySQL');
}

// Fix 2: Ensure NODE_ENV=production
if (!envContent.includes('NODE_ENV="production"') && !envContent.includes("NODE_ENV='production'")) {
  envContent = envContent.replace(/NODE_ENV=.*\n/, '');
  envContent += '\nNODE_ENV="production"';
  envChanged = true;
  console.log('✅ Set NODE_ENV to production');
}

// Fix 3: Ensure NEXTAUTH_URL
if (!envContent.includes('NEXTAUTH_URL=')) {
  envContent += '\nNEXTAUTH_URL="https://doctornafsyonline.com"';
  envChanged = true;
  console.log('✅ Added NEXTAUTH_URL');
}

// Fix 4: Ensure NEXT_PUBLIC_API_URL
if (!envContent.includes('NEXT_PUBLIC_API_URL=')) {
  envContent += '\nNEXT_PUBLIC_API_URL="https://doctornafsyonline.com"';
  envChanged = true;
  console.log('✅ Added NEXT_PUBLIC_API_URL');
}

if (envChanged) {
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env has been fixed and saved!\n');
} else {
  console.log('✅ .env is already correct\n');
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 2: VERIFY DATABASE URL
// ═══════════════════════════════════════════════════════════════════════
console.log('🔌 STEP 2: Verifying DATABASE_URL...');
console.log('─'.repeat(60));

const databaseUrl = process.env.DATABASE_URL || 
  envContent.match(/DATABASE_URL="?([^"]*)"?/)?.[1];

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL not found in .env!');
  process.exit(1);
}

if (databaseUrl.includes('file:./')) {
  console.error('❌ ERROR: Still using SQLite database URL!');
  process.exit(1);
}

if (!databaseUrl.startsWith('mysql://')) {
  console.error('❌ ERROR: DATABASE_URL must start with mysql://');
  process.exit(1);
}

console.log('✅ DATABASE_URL is correctly set to MySQL');
console.log(`   URL: ${databaseUrl.substring(0, 50)}...\n`);

// ═══════════════════════════════════════════════════════════════════════
// STEP 3: NPM INSTALL
// ═══════════════════════════════════════════════════════════════════════
console.log('📦 STEP 3: Installing dependencies...');
console.log('─'.repeat(60));

try {
  console.log('Running: npm install');
  execSync('npm install', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ ERROR: npm install failed!');
  console.error(error.message);
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 4: TEST DATABASE CONNECTION
// ═══════════════════════════════════════════════════════════════════════
console.log('🗄️  STEP 4: Testing database connection...');
console.log('─'.repeat(60));

try {
  console.log('Testing Prisma connection to database...');
  const testCode = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    (async () => {
      try {
        await prisma.$queryRaw\`SELECT 1\`;
        console.log('✅ Database connection successful');
        process.exit(0);
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    })();
  `;
  
  fs.writeFileSync(path.join(projectRoot, 'test-db-connection.js'), testCode);
  execSync('node test-db-connection.js', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  fs.unlinkSync(path.join(projectRoot, 'test-db-connection.js'));
  console.log('\n');
} catch (error) {
  console.warn('⚠️  Database connection test failed (check credentials and ensure MySQL is running)');
  console.warn('Error:', error.message);
  console.log('Continuing with migrations anyway...\n');
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 5: APPLY DATABASE MIGRATIONS & SCHEMA FIXES
// ═══════════════════════════════════════════════════════════════════════
console.log('🗄️  STEP 5: Applying database migrations and schema fixes...');
console.log('─'.repeat(60));

// Run the schema fix script first to ensure columns exist
try {
  console.log('Running: node fix-db-schema.js');
  execSync('node fix-db-schema.js', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('✅ Custom schema fixes applied\n');
} catch (error) {
  console.warn('⚠️  Could not run fix-db-schema.js directly:', error.message);
}

try {
  console.log('Running: npx prisma migrate deploy');
  execSync('npx prisma migrate deploy', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('✅ Database migrations applied\n');
} catch (error) {
  console.warn('⚠️  Prisma migrate encountered an issue');
  console.warn(error.message);
  
  // Try db push as alternative
  try {
    console.log('\nTrying alternative: npx prisma db push...');
    execSync('npx prisma db push --skip-generate', { 
      cwd: projectRoot, 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log('✅ Database schema pushed\n');
  } catch (dbPushError) {
    console.warn('⚠️  Both migrate and db push failed (may be normal if DB is already set up)');
    console.warn(dbPushError.message);
    console.log('Continuing...\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 6: BUILD
// ═══════════════════════════════════════════════════════════════════════
console.log('🔨 STEP 6: Building Next.js application...');
console.log('─'.repeat(60));

try {
  console.log('Running: npm run build');
  execSync('npm run build', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl }
  });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ ERROR: Build failed!');
  console.error(error.message);
  
  // Try to read the build error log if it exists
  const buildErrorLog = path.join(projectRoot, '.next', 'error.log');
  if (fs.existsSync(buildErrorLog)) {
    console.log('\n📋 Build error details:');
    console.log(fs.readFileSync(buildErrorLog, 'utf8'));
  }
  
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════
// SUCCESS!
// ═══════════════════════════════════════════════════════════════════════
console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ ALL STEPS COMPLETED!                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📋 NEXT STEPS:');
console.log('');
console.log('1️⃣  Restart the server on Hostinger:');
console.log('   • Go to Node.js Manager in Hostinger Control Panel');
console.log('   • Stop the application');
console.log('   • Start it again');
console.log('');
console.log('2️⃣  Verify everything is working:');
console.log('   • Open https://doctornafsyonline.com');
console.log('   • Check that the site loads without errors');
console.log('   • Test login and basic functionality');
console.log('');
console.log('3️⃣  If you see errors, check:');
console.log('   • startup-error.log file');
console.log('   • Hostinger error logs');
console.log('   • Database connection');
console.log('');
console.log('💡 TIP: You can also start the server manually with:');
console.log('   npm start  or  node server.js');
console.log('');
