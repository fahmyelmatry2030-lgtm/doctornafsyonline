// ─── Fix DATABASE_URL for Hostinger MySQL ────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

try { require('dotenv').config(); } catch(e) {}
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logFile = path.join(__dirname, 'startup-error.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  try { fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`); } catch (e) {}
  console.log(msg);
}

log('=== Starting Application from Root server.js ===');



// ─── Fix DATABASE_URL for runtime ────────────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

// ─── Launch Server ───────────────────────────────────────────────────────────
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  log("🚀 Found standalone server! Loading it natively...");
  try {
    require(standaloneServer);
  } catch (startupError) {
    log(`FATAL STARTUP ERROR: ${startupError.message}\n${startupError.stack}`);
    
    // Start an emergency server to show the error instead of 503
    const { createServer } = require('http');
    const emergencyServer = createServer((req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: monospace; padding: 20px; background: #ffebee; color: #b71c1c; border-radius: 8px;">
          <h2>🚨 النظام يواجه خطأ أثناء التشغيل</h2>
          <p>بدلاً من خطأ 503، التقطنا هذا الخطأ البرمجي لك:</p>
          <pre style="background: white; padding: 15px; overflow-x: auto;">${startupError.stack || startupError.message}</pre>
          <p>أرسل هذا الخطأ للمبرمج لحله فوراً.</p>
        </div>
      `);
    });
    const rawPort = process.env.PORT || '3000';
    const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');
    if (isSocket) {
      try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (e) {}
      emergencyServer.listen(rawPort, () => {
        try { fs.chmodSync(rawPort, '777'); } catch (e) {}
      });
    } else {
      emergencyServer.listen(parseInt(rawPort, 10));
    }
  }
} else {
  log("❌ ERROR: Standalone server not found even after build attempt!");
  log("Attempting to run in dev mode to prevent 503 crash...");
  
  const { createServer } = require('http');
  const { parse } = require('url');
  const next = require('next');

  const app = next({ dev: false });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        log(`Request error: ${err.message}`);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    const rawPort = process.env.PORT || '3000';
    const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');

    if (isSocket) {
      try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (e) {}
      server.listen(rawPort, () => {
        try { fs.chmodSync(rawPort, '777'); } catch (e) {}
        log(`Server listening on socket: ${rawPort}`);
      });
    } else {
      server.listen(parseInt(rawPort, 10), () => {
        log(`Server listening on port: ${rawPort}`);
      });
    }
  }).catch(err => {
    log(`FATAL DEV FALLBACK ERROR: ${err.message}`);
    process.exit(1);
  });
}
