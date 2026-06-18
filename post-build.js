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
if (originalCode.includes('parseInt(process.env.PORT, 10)')) {
    originalCode = originalCode.replace(
        /parseInt\(process\.env\.PORT,\s*10\)/g,
        "(isNaN(Number(process.env.PORT)) ? process.env.PORT : parseInt(process.env.PORT, 10))"
    );
    // Also patch hostname to be undefined if port is a Unix socket
    originalCode = originalCode.replace(
        /const hostname = process\.env\.HOSTNAME \|\| '0\.0\.0\.0'/g,
        "const hostname = (isNaN(Number(process.env.PORT)) && typeof process.env.PORT === 'string') ? undefined : (process.env.HOSTNAME || '0.0.0.0')"
    );
    // Inject fs.unlinkSync to prevent EADDRINUSE on Hostinger Passenger sockets
    originalCode = originalCode.replace(
        "startServer({",
        "const fs = require('fs');\nif (typeof currentPort === 'string' && fs.existsSync(currentPort)) { try { fs.unlinkSync(currentPort); } catch(e){} }\nstartServer({"
    );
    // Replace silent exit with emergency server
    originalCode = originalCode.replace(
        "}).catch((err) => {\n  console.error(err);\n  process.exit(1);\n});",
        "}).catch((err) => { console.error('FATAL NEXT.JS STARTUP ERROR:', err); const { createServer } = require('http'); const emergency = createServer((req, res) => { res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' }); res.end('<div style=\"padding:20px;color:#b71c1c;background:#ffebee;font-family:monospace;\"><h2>🚨 خطأ فادح أثناء تشغيل الخادم (Next.js)</h2><pre>' + (err.stack || err.message) + '</pre></div>'); }); if (typeof currentPort === 'string') { try { if (require('fs').existsSync(currentPort)) require('fs').unlinkSync(currentPort); } catch(e){} emergency.listen(currentPort, () => { try { require('fs').chmodSync(currentPort, '777'); } catch(e){} }); } else { emergency.listen(currentPort || 3000); } });"
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

// ── Copy .env to standalone so the server can find it at runtime ──────────────
const envSrc  = path.join(__dirname, '.env');
const envDest = path.join(__dirname, '.next', 'standalone', '.env');
try {
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
    console.log('✅ Copied .env to .next/standalone/.env');
  } else {
    console.warn('⚠️  .env not found – make sure env vars are set in the hosting panel.');
  }
} catch (err) {
  console.error('❌ Failed to copy .env:', err);
}

console.log('🎉 post-build.js complete!');
