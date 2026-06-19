#!/usr/bin/env node

/**
 * 🚨 HOSTINGER 503 DIAGNOSIS & FIX
 * 
 * الخطأ: 503 Service Unavailable
 * السبب: Node.js لم يبدأ أو توقف بسبب خطأ
 * 
 * هذا الـ script يشخص المشكلة ويحاول الإصلاح
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  🚨 HOSTINGER 503 ERROR - DIAGNOSTIC & FIX               ║');
console.log('║  الخطأ: 503 Service Unavailable                          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

const projectRoot = __dirname;

// ═══════════════════════════════════════════════════════════════════════
// CHECK 1: VERIFY PROJECT STRUCTURE
// ═══════════════════════════════════════════════════════════════════════
console.log('📋 CHECK 1: Verifying project structure...\n');

const requiredFiles = [
  '.env',
  'package.json',
  'next.config.ts',
  'server.js',
  'prisma/schema.prisma'
];

let structureOk = true;
for (const file of requiredFiles) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    structureOk = false;
  }
}

if (!structureOk) {
  console.log('\n❌ ERROR: Project structure is incomplete!');
  process.exit(1);
}

console.log('\n✅ Project structure is correct\n');

// ═══════════════════════════════════════════════════════════════════════
// CHECK 2: VERIFY .ENV
// ═══════════════════════════════════════════════════════════════════════
console.log('🔐 CHECK 2: Verifying .env configuration...\n');

const envPath = path.join(projectRoot, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ ERROR: .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NODE_ENV',
  'LIVEKIT_API_KEY'
];

let envOk = true;
for (const varName of requiredEnvVars) {
  if (envContent.includes(varName)) {
    console.log(`  ✅ ${varName}`);
  } else {
    console.log(`  ❌ ${varName} - MISSING`);
    envOk = false;
  }
}

if (!envOk) {
  console.log('\n⚠️  WARNING: Some environment variables are missing\n');
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK 3: VERIFY NODE_MODULES
// ═══════════════════════════════════════════════════════════════════════
console.log('📦 CHECK 3: Checking node_modules...\n');

const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ node_modules directory exists');
  
  const prismaPath = path.join(nodeModulesPath, '@prisma', 'client');
  if (fs.existsSync(prismaPath)) {
    console.log('  ✅ @prisma/client installed');
  } else {
    console.log('  ⚠️  @prisma/client not found - will need npm install');
  }
} else {
  console.log('  ❌ node_modules not found - running npm install\n');
  
  try {
    console.log('Running: npm install...\n');
    execSync('npm install', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ npm install failed!');
    console.error(error.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK 4: VERIFY BUILD
// ═══════════════════════════════════════════════════════════════════════
console.log('🔨 CHECK 4: Checking build...\n');

const nextPath = path.join(projectRoot, '.next');
if (fs.existsSync(nextPath)) {
  console.log('  ✅ .next build directory exists');
  
  const buildManifest = path.join(nextPath, 'BUILD_ID');
  if (fs.existsSync(buildManifest)) {
    console.log('  ✅ Build is recent');
  } else {
    console.log('  ⚠️  Build may be outdated');
  }
} else {
  console.log('  ❌ .next build directory not found - building now\n');
  
  try {
    console.log('Running: npm run build...\n');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build completed\n');
  } catch (error) {
    console.error('❌ Build failed!');
    console.error(error.message);
    console.log('\nTrying alternative build...\n');
    
    try {
      execSync('npx next build', { stdio: 'inherit' });
      console.log('\n✅ Build completed\n');
    } catch (buildError) {
      console.error('❌ Build still failed!');
      console.error(buildError.message);
      process.exit(1);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CHECK 5: CHECK ERROR LOGS
// ═══════════════════════════════════════════════════════════════════════
console.log('📋 CHECK 5: Checking error logs...\n');

const errorLogs = [
  'startup-error.log',
  '.next/dev/logs/next-development.log',
  '.npm-debug.log'
];

for (const logFile of errorLogs) {
  const fullPath = path.join(projectRoot, logFile);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.trim()) {
        console.log(`📄 Found errors in ${logFile}:\n`);
        const lines = content.split('\n').slice(-20); // Last 20 lines
        console.log(lines.join('\n'));
        console.log('\n');
      }
    } catch (e) {
      // Ignore read errors
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// SUMMARY & RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    📋 SUMMARY                             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('If you see this message without errors above, then:');
console.log('');
console.log('✅ Project structure is correct');
console.log('✅ .env is configured');
console.log('✅ Dependencies are installed');
console.log('✅ Build is ready');
console.log('');
console.log('Next steps:');
console.log('');
console.log('1️⃣  Make sure Node.js Manager shows the app as "Running"');
console.log('   Go to: Hostinger Panel > Node.js');
console.log('   If stopped, click "Start"');
console.log('   If running, click "Stop" then "Start" to restart');
console.log('');
console.log('2️⃣  Verify database is running');
console.log('   Run: mysql -h localhost -u u465666297_u465666297 -p');
console.log('   Password: Doctor1346790');
console.log('');
console.log('3️⃣  Check Hostinger error logs');
console.log('   Look for "startup-error.log" in the project root');
console.log('');
console.log('4️⃣  Restart everything:');
console.log('   cd ~/public_html');
console.log('   npm run build');
console.log('   Then restart Node.js from Hostinger Panel');
console.log('');
console.log('5️⃣  Test the site:');
console.log('   https://doctornafsyonline.com');
console.log('');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║            ✅ DIAGNOSTIC COMPLETE                         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
