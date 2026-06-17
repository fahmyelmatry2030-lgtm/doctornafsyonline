const fs = require('fs');
const path = require('path');

const standaloneServerPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.log('⚠️ Standalone server.js not found. Skipping Passenger patch.');
  process.exit(0);
}

// Read the original standalone server.js
const originalCode = fs.readFileSync(standaloneServerPath, 'utf8');
console.log('📄 Original server.js length:', originalCode.length);

// Find where Next.js starts the server - look for the startup call
const startMarker = "require('next')";
const markerIndex = originalCode.indexOf(startMarker);

if (markerIndex === -1) {
  console.error('❌ Could not find server startup code in standalone server.js!');
  console.log('First 500 chars:', originalCode.substring(0, 500));
  process.exit(1);
}

console.log('✅ Found startup marker at index:', markerIndex);

// Keep the config definition, but replace the server startup logic
// configCode already contains: path, fs, nextConfig etc from the original file
const configCode = originalCode.substring(0, markerIndex);

// Our replacement code - uses 'var' to avoid redeclaration errors since
// configCode may already have 'const fs' and 'const path'
const passengerStartupCode = `
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)

var http = require('http')
var NextServer = require('next/dist/server/next-server').default

var MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
  '.map': 'application/json',
}

function getMimeType(filePath) {
  var ext = filePath.split('.').pop().toLowerCase()
  return MIME_TYPES['.' + ext] || 'application/octet-stream'
}

var logFile = path.join(__dirname, 'startup-error.log')
function log(msg) {
  var timestamp = new Date().toISOString()
  try { fs.appendFileSync(logFile, '[' + timestamp + '] ' + msg + '\\n') } catch (e) {}
  console.log(msg)
}
function logError(msg, err) {
  var timestamp = new Date().toISOString()
  var errorDetails = err ? (err.stack || String(err)) : ''
  try { fs.appendFileSync(logFile, '[' + timestamp + '] ERROR: ' + msg + '\\n' + errorDetails + '\\n') } catch (e) {}
  console.error(msg, err)
}

log('Starting NextNodeServer on Passenger/Hostinger. CWD: ' + process.cwd())
log('__dirname: ' + __dirname)

// Check if static files exist and log for debugging
var staticDir = path.join(__dirname, '.next', 'static')
var publicDir = path.join(__dirname, 'public')
log('Static dir exists: ' + fs.existsSync(staticDir) + ' at ' + staticDir)
log('Public dir exists: ' + fs.existsSync(publicDir) + ' at ' + publicDir)

function serveStaticFile(filePath, res) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      var stat = fs.statSync(filePath)
      var mimeType = getMimeType(filePath)
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
      fs.createReadStream(filePath).pipe(res)
      return true
    }
  } catch (e) {
    logError('serveStaticFile error for ' + filePath, e)
  }
  return false
}

var appPort = parseInt(process.env.PORT || '3000', 10)
var appHostname = process.env.HOSTNAME || 'localhost'
var appDir = path.join(__dirname)

log('Starting NextServer with dir: ' + appDir + ', port: ' + appPort)

try {
  var nextServer = new NextServer({
    hostname: appHostname,
    port: appPort,
    dir: appDir,
    dev: false,
    customServer: false,
    conf: nextConfig,
  })

  var handle = nextServer.getRequestHandler()

  log('Creating HTTP server for Passenger...')
  var server = http.createServer(function(req, res) {
    var url = req.url || '/'

    // Serve /_next/static/ files directly from filesystem
    if (url.startsWith('/_next/static/')) {
      var staticRelPath = url.replace('/_next/static/', '').split('?')[0]
      var staticFilePath = path.join(__dirname, '.next', 'static', staticRelPath)
      if (serveStaticFile(staticFilePath, res)) return
    }

    // Serve public/ files directly from filesystem
    if (!url.startsWith('/_next/') && !url.startsWith('/api/')) {
      var publicRelPath = url.split('?')[0]
      var publicFilePath = path.join(__dirname, 'public', publicRelPath)
      if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
        if (serveStaticFile(publicFilePath, res)) return
      }
    }

    // Let Next.js handle everything else
    handle(req, res).catch(function(err) {
      logError('Error handling request ' + url, err)
      res.statusCode = 500
      res.end('internal server error')
    })
  })

  server.listen(appPort, function(err) {
    if (err) {
      logError('Server listen failed', err)
      process.exit(1)
    }
    log('Server is listening on ' + appPort)
  })
} catch (err) {
  logError('FATAL: Failed to start NextNodeServer', err)
  process.exit(1)
}
`;

const newCode = configCode + passengerStartupCode;
fs.writeFileSync(standaloneServerPath, newCode, 'utf8');
console.log('✅ Successfully patched standalone server.js for Phusion Passenger compatibility!');

// Copy public folder to standalone/public
const publicSrc = path.join(__dirname, 'public');
const publicDest = path.join(__dirname, '.next', 'standalone', 'public');
try {
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('✅ Copied public/ to .next/standalone/public/');
  }
} catch (err) {
  console.error('❌ Failed to copy public folder:', err);
}

// Copy .next/static folder to standalone/.next/static
const staticSrc = path.join(__dirname, '.next', 'static');
const staticDest = path.join(__dirname, '.next', 'standalone', '.next', 'static');
try {
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('✅ Copied .next/static/ to .next/standalone/.next/static/');
  }
} catch (err) {
  console.error('❌ Failed to copy .next/static folder:', err);
}

console.log('🎉 post-build.js complete!');
