// ─── Fix DATABASE_URL for Hostinger MySQL ────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')
const net = require('net')

const logFile = path.join(__dirname, 'startup-error.log')

function log(msg) {
  const timestamp = new Date().toISOString()
  try { fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`) } catch (e) {}
  console.log(msg)
}

function logError(msg, err) {
  const timestamp = new Date().toISOString()
  const errorDetails = err ? (err.stack || err) : ''
  try { fs.appendFileSync(logFile, `[${timestamp}] ERROR: ${msg}\n${errorDetails}\n`) } catch (e) {}
  console.error(msg, err)
}

// ─── Check Node.js version ───────────────────────────────────────────────────
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10)
log(`Starting application. Node.js version: ${nodeVersion}`)

if (majorVersion < 18) {
  logError(`Node.js ${nodeVersion} is too old. Next.js requires Node.js 18+. Please upgrade in Hostinger Panel.`)
  process.exit(1)
}

// ─── Port / Socket detection ─────────────────────────────────────────────────
// Hostinger Passenger may pass either:
//   - A numeric port  e.g. "3000"
//   - A Unix socket path  e.g. "/tmp/passenger.xxx.sock"
const rawPort = process.env.PORT || '3000'
const isSocketPath = isNaN(Number(rawPort)) || rawPort.startsWith('/')

log(`Environment: PORT=${rawPort}, isSocketPath=${isSocketPath}`)

// ─── Create Next.js app ──────────────────────────────────────────────────────
const app = next({ dev: false })
const handle = app.getRequestHandler()

log('Preparing Next.js app...')
app.prepare()
  .then(() => {
    log('Next.js ready. Creating HTTP server...')

    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        logError(`Error handling request ${req.url}`, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })

    if (isSocketPath) {
      // ── Unix socket mode (Passenger) ──────────────────────────────────────
      // Remove stale socket file if it exists
      try {
        if (fs.existsSync(rawPort)) fs.unlinkSync(rawPort)
      } catch (e) {}

      server.listen(rawPort, () => {
        // Make socket world-writable so Passenger/Nginx can access it
        try { fs.chmodSync(rawPort, '777') } catch (e) {}
        log(`Server listening on socket: ${rawPort}`)
      })
    } else {
      // ── TCP port mode (local / direct) ────────────────────────────────────
      const port = parseInt(rawPort, 10) || 3000
      server.listen(port, () => {
        log(`Server listening on port: ${port}`)
      })
    }

    server.on('error', (err) => {
      logError('Server error', err)
      process.exit(1)
    })
  })
  .catch((err) => {
    logError('FATAL: Failed to prepare Next.js app', err)
    process.exit(1)
  })
