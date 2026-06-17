// ─── Fix DATABASE_URL for Hostinger MySQL ────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

// ─── Fix DATABASE_URL for Hostinger MySQL ────────────────────────────────────
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("mysql://")) {
  process.env.DATABASE_URL = "mysql://u465666297_u465666297:Doctor1346790@127.0.0.1:3306/u465666297_u465666297";
}

const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'startup-error.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  try { fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`); } catch (e) {}
  console.log(msg);
}

log('=== Starting Application from Root server.js ===');
const nodeVersion = process.version;
log(`Node.js version: ${nodeVersion}`);

// In Hostinger, we want to run the STANDALONE server because it's optimized
// and uses much less memory, avoiding 503 Service Unavailable errors.
const standaloneServer = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standaloneServer)) {
  log("Found standalone server! Loading it...");
  require(standaloneServer);
} else {
  log("ERROR: Standalone server not found. Please run 'npm run build' first.");
  process.exit(1);
}
