if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const logFile = path.join(__dirname, 'startup-error.log')

function log(msg) {
  const timestamp = new Date().toISOString()
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`)
  } catch (e) {
    // ignore if log file is not writable
  }
  console.log(msg)
}

function logError(msg, err) {
  const timestamp = new Date().toISOString()
  const errorDetails = err ? (err.stack || err) : ''
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ERROR: ${msg}\n${errorDetails}\n`)
  } catch (e) {
    // ignore
  }
  console.error(msg, err)
}

// Check Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10)
log(`Starting application. Node.js version: ${nodeVersion}`)

if (majorVersion < 18) {
  logError(`Node.js version ${nodeVersion} is too low. Next.js 16/React 19 requires Node.js 18.18.0 or higher. Please change the Node.js version in your Hostinger Panel.`)
  process.exit(1)
}

const dev = process.env.NODE_ENV === 'development'
const port = process.env.PORT || 3000

log(`Environment: dev=${dev}, PORT=${port}`)

// Create next app instance
// Do not pass hostname/port in production to avoid issues with Passenger socket paths
const app = next(dev ? { dev, hostname: 'localhost', port: parseInt(port, 10) || 3000 } : { dev })
const handle = app.getRequestHandler()

log('Preparing Next.js app...')
app.prepare()
  .then(() => {
    log('Next.js app prepared successfully. Creating HTTP server...')
    
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        logError(`Error occurred handling request ${req.url}`, err)
        res.statusCode = 500
        res.end('internal server error')
      }
    })

    // Passenger will pass a socket path (string) or a port number (string/number) in process.env.PORT
    server.listen(port, (err) => {
      if (err) {
        logError('Server listen failed', err)
        throw err
      }
      log(`Server is listening on ${port}`)
    })
  })
  .catch((err) => {
    logError('FATAL: Failed to prepare Next.js app during startup', err)
    process.exit(1)
  })

