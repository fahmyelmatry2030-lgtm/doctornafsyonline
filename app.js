// ─── Nafsi Platform – Production Entry Point for Hostinger Passenger ─────────
// Passenger loads this file. It boots .next/standalone/server.js which handles
// everything (port/socket binding, Next.js serving, etc.).
// ──────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const http = require('http');

// ─── Logging ────────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, 'startup-error.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
  console.log(msg);
}

// ─── Load .env ──────────────────────────────────────────────────────────────
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {}

// Also try loading .env inside standalone (post-build copies it there)
try {
  const standaloneEnv = path.join(__dirname, '.next', 'standalone', '.env');
  if (fs.existsSync(standaloneEnv)) {
    require('dotenv').config({ path: standaloneEnv, override: false });
  }
} catch (_) {}

// ─── Fix Hostinger MySQL Connection ──────────────────────────────────────────
// Hostinger often fails when connecting to "localhost" because it tries to use
// a Unix socket. Changing it to "127.0.0.1" forces a TCP connection.
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@localhost:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
  log('🔧 Auto-fixed DATABASE_URL: Replaced localhost with 127.0.0.1');
}

// ─── Emergency server helper ────────────────────────────────────────────────
function startEmergencyServer(errorMessage, errorStack) {
  const rawPort  = process.env.PORT || '3000';
  const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');

  const server = http.createServer((_req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>خطأ</title></head>
<body style="font-family:system-ui;padding:40px;background:#1a1a2e;color:#eee;">
<div style="max-width:700px;margin:auto;background:#16213e;padding:30px;border-radius:12px;border:1px solid #e94560;">
  <h1 style="color:#e94560;">🚨 خطأ أثناء تشغيل السيرفر</h1>
  <p>${errorMessage.replace(/</g,'&lt;')}</p>
  <pre style="background:#0f3460;padding:15px;border-radius:8px;overflow-x:auto;color:#ff6b6b;font-size:13px;direction:ltr;text-align:left;">${
    (errorStack || errorMessage).replace(/</g,'&lt;')
  }</pre>
  <h2>معلومات التشخيص:</h2>
  <pre style="background:#0f3460;padding:15px;border-radius:8px;color:#aaa;direction:ltr;text-align:left;">
Node: ${process.version}
Platform: ${process.platform} ${process.arch}
CWD: ${process.cwd()}
__dirname: ${__dirname}
PORT: ${rawPort}
NODE_ENV: ${process.env.NODE_ENV || 'not set'}
DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}
  </pre>
</div>
</body></html>`);
  });

  if (isSocket) {
    try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (_) {}
    server.listen(rawPort, () => {
      try { fs.chmodSync(rawPort, '777'); } catch (_) {}
      log(`Emergency server on socket: ${rawPort}`);
    });
  } else {
    server.listen(parseInt(rawPort, 10), () => {
      log(`Emergency server on port: ${rawPort}`);
    });
  }
}

// ─── Main startup ───────────────────────────────────────────────────────────
log('=== Nafsi Platform Starting ===');
log(`Node ${process.version} | ${process.platform} ${process.arch} | PID ${process.pid}`);
log(`CWD: ${process.cwd()}`);
log(`__dirname: ${__dirname}`);
log(`PORT: ${process.env.PORT || 'not set'}`);
log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);

// Check what files exist
const filesToCheck = [
  'app.js',
  '.next/standalone/server.js',
  '.next/standalone/.env',
  '.next/standalone/node_modules/next/package.json',
  'node_modules/next/package.json',
  'node_modules/dotenv/package.json',
  '.env',
];
filesToCheck.forEach(f => {
  const full = path.join(__dirname, f);
  log(`  ${f}: ${fs.existsSync(full) ? '✅ EXISTS' : '❌ MISSING'}`);
});

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  log('Loading .next/standalone/server.js ...');
  try {
    // Set process.env.PORT so standalone picks it up
    // standalone/server.js already handles socket vs port
    require(standaloneServer);
    log('✅ standalone/server.js loaded successfully');
  } catch (err) {
    log(`❌ FATAL: standalone/server.js crashed: ${err.message}`);
    log(err.stack || '');
    startEmergencyServer(
      'Next.js standalone server crashed during startup',
      err.stack || err.message
    );
  }
} else {
  log('❌ .next/standalone/server.js NOT FOUND');
  
  // Try direct Next.js as last resort
  try {
    log('Trying direct Next.js boot...');
    const next   = require('next');
    const { parse } = require('url');
    const app    = next({ dev: false, dir: __dirname });
    const handle = app.getRequestHandler();
    
    app.prepare().then(() => {
      const rawPort  = process.env.PORT || '3000';
      const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');
      
      const server = http.createServer(async (req, res) => {
        try {
          await handle(req, res, parse(req.url, true));
        } catch (err) {
          log(`Request error: ${err.message}`);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });

      if (isSocket) {
        try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (_) {}
        server.listen(rawPort, () => {
          try { fs.chmodSync(rawPort, '777'); } catch (_) {}
          log(`Next.js direct on socket: ${rawPort}`);
        });
      } else {
        server.listen(parseInt(rawPort, 10), () => {
          log(`Next.js direct on port: ${rawPort}`);
        });
      }
    }).catch(err => {
      log(`❌ Next.js prepare() failed: ${err.message}`);
      startEmergencyServer('Next.js failed to start', err.stack || err.message);
    });
  } catch (err) {
    log(`❌ Cannot load Next.js at all: ${err.message}`);
    startEmergencyServer(
      'Cannot find standalone build or Next.js module',
      `standalone/server.js: MISSING\nnext module: ${err.message}\n\nMake sure to run 'npm run build' or check the GitHub Actions workflow.`
    );
  }
}

// ─── Global error handlers ──────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT: ${err.message}\n${err.stack}`);
});
process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED: ${reason}`);
});
