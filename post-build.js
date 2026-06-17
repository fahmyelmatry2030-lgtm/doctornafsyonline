const fs   = require('fs');
const path = require('path');

const standaloneServerPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.log('⚠️ Standalone server.js not found. Skipping Passenger patch.');
  process.exit(0);
}

// Read the original standalone server.js
const originalCode = fs.readFileSync(standaloneServerPath, 'utf8');
console.log('📄 Original server.js length:', originalCode.length);

// Find where Next.js starts the server
const startMarker = "require('next')";
const markerIndex = originalCode.indexOf(startMarker);

if (markerIndex === -1) {
  console.error('❌ Could not find startup marker in standalone server.js!');
  console.log('First 500 chars:', originalCode.substring(0, 500));
  process.exit(1);
}

console.log('✅ Found startup marker at index:', markerIndex);

// Keep config section (path, fs, nextConfig, etc.) — drop the rest
const configCode = originalCode.substring(0, markerIndex);

// Replacement: use standard next() API with proper socket/port handling
const passengerStartupCode = `
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)

var http = require('http')
var next = require('next')
var url  = require('url')

// ── Logging ───────────────────────────────────────────────────────────────────
var logFile = path.join(process.cwd(), 'startup-error.log')
function log(msg) {
  var ts = new Date().toISOString()
  try { fs.appendFileSync(logFile, '[' + ts + '] ' + msg + '\\n') } catch (e) {}
  console.log(msg)
}
function logError(msg, err) {
  var ts  = new Date().toISOString()
  var det = err ? (err.stack || String(err)) : ''
  try { fs.appendFileSync(logFile, '[' + ts + '] ERROR: ' + msg + '\\n' + det + '\\n') } catch (e) {}
  console.error(msg, err || '')
}

log('=== Starting Nafsi App on Hostinger/Passenger ===')
log('Node: ' + process.version)
log('CWD: ' + process.cwd())
log('__dirname: ' + __dirname)

// ── Port / Socket detection ───────────────────────────────────────────────────
// Passenger passes either a TCP port number OR a Unix socket path
var rawPort = process.env.PORT || '3000'
var isSocket = (rawPort.indexOf('/') !== -1) || (rawPort.indexOf('.sock') !== -1) || isNaN(Number(rawPort))
log('PORT: ' + rawPort + ' | isSocket: ' + isSocket)

// ── Create Next.js app ────────────────────────────────────────────────────────
var appDir = process.cwd()
var app    = next({ dev: false, dir: appDir, conf: nextConfig })
var handle = app.getRequestHandler()

log('Preparing Next.js...')
app.prepare()
  .then(function () {
    log('Next.js ready! Creating HTTP server...')

    var server = http.createServer(function (req, res) {
      var parsedUrl = url.parse(req.url, true)
      handle(req, res, parsedUrl).catch(function (err) {
        logError('Request error: ' + req.url, err)
        res.statusCode = 500
        res.end('Internal Server Error')
      })
    })

    server.on('error', function (err) {
      logError('Server error', err)
      process.exit(1)
    })

    if (isSocket) {
      // Unix socket mode (Phusion Passenger on Hostinger)
      try { if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort) } catch (e) {}
      server.listen(rawPort, function () {
        try { fs.chmodSync(rawPort, '777') } catch (e) {}
        log('Listening on socket: ' + rawPort)
      })
    } else {
      // TCP port mode (direct / local)
      var port = parseInt(rawPort, 10) || 3000
      server.listen(port, function () {
        log('Listening on port: ' + port)
      })
    }
  })
  .catch(function (err) {
    logError('FATAL: Next.js prepare() failed', err)
    process.exit(1)
  })
`;

const newCode = configCode + passengerStartupCode;
fs.writeFileSync(standaloneServerPath, newCode, 'utf8');
console.log('✅ Patched standalone server.js for Phusion Passenger!');

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
// Windows build only includes the Windows engine; we need Linux engines for Hostinger.
const prismaClientSrc  = path.join(__dirname, 'node_modules', '.prisma', 'client');
const prismaClientDest = path.join(__dirname, '.next', 'standalone', 'node_modules', '.prisma', 'client');
try {
  if (fs.existsSync(prismaClientSrc)) {
    // Copy the entire directory including subfolders like 'deno'
    fs.cpSync(prismaClientSrc, prismaClientDest, { recursive: true, force: true });
    console.log('✅ Copied Prisma client engines to standalone');
  } else {
    console.warn('⚠️  node_modules/.prisma/client not found – skipping Prisma engine copy.');
  }
} catch (err) {
  console.error('❌ Failed to copy Prisma engines:', err);
}

// Also ensure @prisma/client is in standalone node_modules
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
