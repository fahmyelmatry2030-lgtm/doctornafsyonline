const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  fs.writeFileSync(path.join(__dirname, 'startup-error.log'), err.stack || err.toString());
  process.exit(1);
});

// ─── Auto-load .env ─────────────────────────────────────────────────────────
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.replace(/\\n/gm, '\n');
        }
        value = value.replace(/(^['"]|['"]$)/g, '').trim();
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {}

// Fix database URL for Hostinger
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@localhost:')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
}

const dev = false;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Hostinger LiteSpeed sets PORT to a Unix Socket string sometimes, but often it's an integer port.
const isSocket = isNaN(Number(port)) || (typeof port === 'string' && port.startsWith('/'));

const app = next({ dev, hostname: isSocket ? undefined : hostname, port: isSocket ? undefined : port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  if (isSocket) {
    if (fs.existsSync(port)) { try { fs.unlinkSync(port); } catch(e){} }
    server.listen(port, (err) => {
      if (err) throw err;
      try { fs.chmodSync(port, '777'); } catch(e){}
      console.log(`> Ready on socket ${port}`);
    });
  } else {
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  }
}).catch((err) => {
  console.error('Next.js failed to prepare:', err);
  process.exit(1);
});
