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
