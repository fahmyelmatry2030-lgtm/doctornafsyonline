// ─── Nafsi Platform – Production Server for Hostinger (Passenger) ─────────────
// This is the ONLY entry point. Passenger loads this file via package.json "main".
// It boots the Next.js standalone build and handles Passenger Unix sockets.
// ──────────────────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const http = require('http');

// ─── 1. Load environment variables ──────────────────────────────────────────
// Try loading .env from the project root first, then from __dirname
// (covers both local dev and standalone deploy).
try {
  const dotenv = require('dotenv');
  const envPath = fs.existsSync(path.join(__dirname, '.env'))
    ? path.join(__dirname, '.env')
    : path.join(__dirname, '..', '..', '.env');
  dotenv.config({ path: envPath });
} catch (_) {
  // dotenv may not be available in standalone – that's OK if env vars are
  // already set in the hosting panel.
}

// ─── 2. Logging ─────────────────────────────────────────────────────────────
const LOG_FILE = path.join(__dirname, 'startup-error.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
  console.log(msg);
}

// ─── 3. Detect port / Unix socket ───────────────────────────────────────────
const rawPort  = process.env.PORT || '3000';
const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');

function listenOn(server, label) {
  if (isSocket) {
    // Remove stale socket file to prevent EADDRINUSE
    try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (_) {}
    server.listen(rawPort, () => {
      try { fs.chmodSync(rawPort, '777'); } catch (_) {}
      log(`${label} listening on socket: ${rawPort}`);
    });
  } else {
    const port = parseInt(rawPort, 10);
    server.listen(port, () => {
      log(`${label} listening on port: ${port}`);
    });
  }
}

// ─── 4. Emergency fallback server ───────────────────────────────────────────
// If the real Next.js server can't start, we still respond with a visible
// error page instead of letting Passenger show a blank 503.
function startEmergencyServer(error) {
  log(`FATAL ERROR – starting emergency server: ${error.message}`);
  log(error.stack || '');

  const emergency = http.createServer((_req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>خطأ في تشغيل النظام</title></head>
<body style="font-family:system-ui,sans-serif;padding:40px;background:#1a1a2e;color:#e0e0e0;">
  <div style="max-width:700px;margin:auto;background:#16213e;padding:30px;border-radius:12px;border:1px solid #e94560;">
    <h1 style="color:#e94560;">🚨 خطأ أثناء تشغيل السيرفر</h1>
    <p>السيرفر شغّال بس Next.js فشل يبدأ. الخطأ:</p>
    <pre style="background:#0f3460;padding:15px;border-radius:8px;overflow-x:auto;color:#ff6b6b;font-size:13px;">${
      (error.stack || error.message || String(error))
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }</pre>
    <p style="color:#999;margin-top:20px;">أرسل هذا الخطأ للمبرمج لحله.</p>
  </div>
</body>
</html>`);
  });

  listenOn(emergency, '🆘 Emergency server');
}

// ─── 5. Boot Next.js standalone ─────────────────────────────────────────────
log('=== Nafsi Platform – Starting Production Server ===');
log(`Node ${process.version} | ${process.platform} ${process.arch}`);
log(`PORT=${rawPort} | Socket=${isSocket} | NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
log(`CWD=${process.cwd()} | __dirname=${__dirname}`);

const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  log('✅ Found .next/standalone/server.js – loading Next.js...');
  try {
    require(standaloneServer);
  } catch (err) {
    startEmergencyServer(err);
  }
} else {
  // No standalone build found – try running Next.js directly as a last resort
  log('⚠️ standalone/server.js not found – trying direct Next.js boot...');
  try {
    const next   = require('next');
    const { parse } = require('url');

    const app    = next({ dev: false });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
      const server = http.createServer(async (req, res) => {
        try {
          await handle(req, res, parse(req.url, true));
        } catch (err) {
          log(`Request error: ${err.message}`);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });

      listenOn(server, '🚀 Next.js (direct)');
    }).catch(err => {
      startEmergencyServer(err);
    });
  } catch (err) {
    startEmergencyServer(err);
  }
}

// ─── 6. Global error handlers ───────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});
