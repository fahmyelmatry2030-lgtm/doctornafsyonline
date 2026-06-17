// ─── Fix DATABASE_URL for Hostinger MySQL ────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

require('dotenv').config();
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

// ─── Hostinger Auto-Build System ─────────────────────────────────────────────
// This automatically builds the app when it detects a new Git commit,
// completely removing the need for manual builds.
try {
  const buildFlagPath = path.join(__dirname, '.build_stamp');
  let lastBuild = '';
  if (fs.existsSync(buildFlagPath)) {
    lastBuild = fs.readFileSync(buildFlagPath, 'utf8').trim();
  }

  let currentCommit = '';
  try {
    currentCommit = execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    // Fallback if git is not available: use the modification time of package.json
    currentCommit = fs.statSync(path.join(__dirname, 'package.json')).mtimeMs.toString();
  }

  if (currentCommit && currentCommit !== lastBuild) {
    log(`🔄 New update detected (${currentCommit}). Starting automatic build...`);
    
    // Set database URL if missing so build doesn't fail
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
    }

    log('Running: npm install...');
    execSync('npm install --production=false', { stdio: 'inherit' });
    
    log('Running: npx prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    log('Running: npm run build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    fs.writeFileSync(buildFlagPath, currentCommit, 'utf8');
    log('✅ Automatic build completed successfully!');
  }
} catch (error) {
  log(`⚠️ Auto-build system encountered an issue (skipping): ${error.message}`);
}

// ─── Fix DATABASE_URL for runtime ────────────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

// ─── Launch Server ───────────────────────────────────────────────────────────
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  log("🚀 Found standalone server! Loading it natively...");
  require(standaloneServer);
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
