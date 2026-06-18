// ─── Diagnostic Server for Hostinger ─────────────────────────────────────────
// This is a TEMPORARY minimal server to diagnose 503 errors.
// It intentionally does NOT load Next.js to isolate the problem.

const http = require('http');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'startup-debug.log');

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  try { fs.appendFileSync(logFile, line); } catch (e) {}
  console.log(msg);
}

log('=== DIAGNOSTIC SERVER STARTING ===');
log('Node version: ' + process.version);
log('Platform: ' + process.platform);
log('Arch: ' + process.arch);
log('PORT env: ' + (process.env.PORT || 'NOT SET'));
log('HOSTNAME env: ' + (process.env.HOSTNAME || 'NOT SET'));
log('CWD: ' + process.cwd());
log('__dirname: ' + __dirname);

// Check what files exist
const checks = [
  '.next/standalone/server.js',
  '.next/standalone/node_modules/next/package.json',
  'node_modules/next/package.json',
  '.env',
  'package.json',
];
checks.forEach(f => {
  const full = path.join(__dirname, f);
  log(`  ${f}: ${fs.existsSync(full) ? 'EXISTS' : 'MISSING'}`);
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  
  let debugLog = 'لا يوجد ملف debug';
  try { debugLog = fs.readFileSync(logFile, 'utf8'); } catch(e) {}
  
  res.end(`
<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><title>تشخيص السيرفر</title></head>
<body style="font-family: monospace; padding: 30px; background: #e8f5e9; color: #1b5e20;">
  <h1>✅ السيرفر شغال!</h1>
  <p>لو بتشوف الصفحة دي يبقى Passenger شغال صح.</p>
  <h2>معلومات النظام:</h2>
  <pre style="background: white; padding: 15px; border-radius: 8px; overflow-x: auto;">${debugLog}</pre>
  <h2>متغيرات البيئة:</h2>
  <pre style="background: white; padding: 15px; border-radius: 8px;">
PORT = ${process.env.PORT || 'NOT SET'}
NODE_ENV = ${process.env.NODE_ENV || 'NOT SET'}
HOSTNAME = ${process.env.HOSTNAME || 'NOT SET'}
DATABASE_URL = ${process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET'}
  </pre>
</body>
</html>
  `);
});

// Handle Passenger Unix socket
const rawPort = process.env.PORT || '3000';
const isSocket = isNaN(Number(rawPort));

if (isSocket) {
  log('Detected Unix socket: ' + rawPort);
  try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort); } catch (e) {}
  server.listen(rawPort, () => {
    log('Listening on socket: ' + rawPort);
    try { fs.chmodSync(rawPort, '777'); } catch (e) {}
  });
} else {
  const port = parseInt(rawPort, 10);
  log('Detected numeric port: ' + port);
  server.listen(port, () => {
    log('Listening on port: ' + port);
  });
}

server.on('error', (err) => {
  log('SERVER ERROR: ' + err.message + '\n' + err.stack);
});

process.on('uncaughtException', (err) => {
  log('UNCAUGHT: ' + err.message + '\n' + err.stack);
});

process.on('unhandledRejection', (reason) => {
  log('UNHANDLED: ' + reason);
});
