const fs = require('fs');
const path = require('path');

const standaloneServerPath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standaloneServerPath)) {
  console.log('⚠️ Standalone server.js not found. Skipping Passenger patch.');
  process.exit(0);
}

let code = fs.readFileSync(standaloneServerPath, 'utf8');

// Find where Next.js starts the server
const startMarker = "require('next')";
const markerIndex = code.indexOf(startMarker);

if (markerIndex === -1) {
  console.error('❌ Could not find server startup code in standalone server.js!');
  process.exit(1);
}

// Keep the config definition, but replace the server startup logic
const configCode = code.substring(0, markerIndex);

const passengerStartupCode = `
process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)

const http = require('http')
const NextServer = require('next/dist/server/next-server').default

const MIME_TYPES = {
  '.js': 'application/javascript',
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
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
  '.map': 'application/json',
}
function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

const logFile = path.join(__dirname, 'startup-error.log')
function log(msg) {
  const timestamp = new Date().toISOString()
  try { fs.appendFileSync(logFile, \`[\${timestamp}] \${msg}\\n\`) } catch (e) {}
  console.log(msg)
}
function logError(msg, err) {
  const timestamp = new Date().toISOString()
  const errorDetails = err ? (err.stack || err) : ''
  try { fs.appendFileSync(logFile, \`[\${timestamp}] ERROR: \${msg}\\n\${errorDetails}\\n\`) } catch (e) {}
  console.error(msg, err)
}

log(\`Starting NextNodeServer on Passenger/Hostinger. CWD: \${process.cwd()}\`)
log(\`__dirname: \${__dirname}\`)
log(\`dir: \${dir}\`)

// Check if static files exist
const staticDir = path.join(__dirname, '.next', 'static')
const publicDir = path.join(__dirname, 'public')
log(\`Static dir exists: \${fs.existsSync(staticDir)} at \${staticDir}\`)
log(\`Public dir exists: \${fs.existsSync(publicDir)} at \${publicDir}\`)

function serveStaticFile(filePath, res) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath)
      const mimeType = getMime(filePath)
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
      fs.createReadStream(filePath).pipe(res)
      return true
    }
  } catch (e) {}
  return false
}

try {
  const nextServer = new NextServer({
    hostname,
    port: currentPort,
    dir,
    dev: false,
    customServer: false,
    conf: nextConfig,
  })

  const handle = nextServer.getRequestHandler()

  log('Creating HTTP server for Passenger...')
  const server = http.createServer(async (req, res) => {
    try {
      const url = req.url || '/'

      // Serve /_next/static/ files manually
      if (url.startsWith('/_next/static/')) {
        const relativePath = url.replace('/_next/static/', '')
        const filePath = path.join(__dirname, '.next', 'static', relativePath.split('?')[0])
        if (serveStaticFile(filePath, res)) return
      }

      // Serve public files manually (fonts, images etc)
      if (!url.startsWith('/_next/') && !url.startsWith('/api/')) {
        const filePath = path.join(__dirname, 'public', url.split('?')[0])
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          if (serveStaticFile(filePath, res)) return
        }
      }

      await handle(req, res)
    } catch (err) {
      logError(\`Error handling request \${req.url}\`, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(currentPort, (err) => {
    if (err) {
      logError('Server listen failed', err)
      throw err
    }
    log(\`Server is listening on \${currentPort}\`)
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
    console.log('✅ Successfully copied public folder to standalone');
  }
} catch (err) {
  console.error('❌ Failed to copy public folder to standalone:', err);
}

// Copy .next/static folder to standalone/.next/static
const staticSrc = path.join(__dirname, '.next', 'static');
const staticDest = path.join(__dirname, '.next', 'standalone', '.next', 'static');
try {
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('✅ Successfully copied .next/static folder to standalone');
  }
} catch (err) {
  console.error('❌ Failed to copy .next/static folder to standalone:', err);
}

