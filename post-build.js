const fs   = require('fs');
const path = require('path');

const standaloneServerPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.log('⚠️ Standalone server.js not found. Skipping Passenger patch.');
  process.exit(0);
}

// Read the original standalone server.js
let originalCode = fs.readFileSync(standaloneServerPath, 'utf8');
console.log('📄 Original server.js length:', originalCode.length);

// Next.js standalone server uses parseInt(process.env.PORT, 10) || 3000
// For Hostinger Passenger, process.env.PORT is a Unix socket path (e.g. "/tmp/passenger.xxx.sock")
// parseInt on a string returns NaN, causing it to fall back to 3000 instead of the socket.
// We patch it to correctly use the socket path if it's not a number.
if (originalCode.includes('parseInt(process.env.PORT, 10)')) {
    originalCode = originalCode.replace(
        /parseInt\(process\.env\.PORT,\s*10\)/g,
        "(isNaN(Number(process.env.PORT)) ? process.env.PORT : parseInt(process.env.PORT, 10))"
    );
    console.log('✅ Patched standalone server.js port/socket detection for Phusion Passenger!');
} else {
    console.log('⚠️ Could not find parseInt(process.env.PORT, 10) in standalone server.js.');
}

fs.writeFileSync(standaloneServerPath, originalCode, 'utf8');
console.log('✅ Updated standalone server.js to true standalone mode for Hostinger!');

// Copy public/ to standalone/public/
const publicSrc  = path.join(__dirname, 'public');
const publicDest = path.join(__dirname, '.next', 'standalone', 'public');
try {
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('✅ Copied public/ to .next/standalone/public/');
  }
} catch (err) {
  console.error('❌ Failed to copy public/:', err);
}

// Copy .next/static/ to standalone/.next/static/
const staticSrc  = path.join(__dirname, '.next', 'static');
const staticDest = path.join(__dirname, '.next', 'standalone', '.next', 'static');
try {
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('✅ Copied .next/static/ to .next/standalone/.next/static/');
  }
} catch (err) {
  console.error('❌ Failed to copy .next/static/:', err);
}

// ── Copy Prisma Linux engine binaries into standalone ─────────────────────────
const prismaClientSrc  = path.join(__dirname, 'node_modules', '.prisma', 'client');
const prismaClientDest = path.join(__dirname, '.next', 'standalone', 'node_modules', '.prisma', 'client');
try {
  if (fs.existsSync(prismaClientSrc)) {
    fs.cpSync(prismaClientSrc, prismaClientDest, { recursive: true, force: true });
    console.log('✅ Copied Prisma client engines to standalone');
  } else {
    console.warn('⚠️  node_modules/.prisma/client not found – skipping Prisma engine copy.');
  }
} catch (err) {
  console.error('❌ Failed to copy Prisma engines:', err);
}

const prismaAtSrc  = path.join(__dirname, 'node_modules', '@prisma', 'client');
const prismaAtDest = path.join(__dirname, '.next', 'standalone', 'node_modules', '@prisma', 'client');
try {
  if (fs.existsSync(prismaAtSrc) && !fs.existsSync(prismaAtDest)) {
    fs.cpSync(prismaAtSrc, prismaAtDest, { recursive: true, force: true });
    console.log('✅ Copied @prisma/client to standalone');
  }
} catch (err) {
  console.error('❌ Failed to copy @prisma/client:', err);
}

console.log('🎉 post-build.js complete!');
