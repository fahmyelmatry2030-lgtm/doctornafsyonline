const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const rawPort = process.env.PORT || '3000';
const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');

function emergencyServer(message, details) {
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <div dir="rtl" style="padding:20px;font-family:sans-serif;color:#721c24;background-color:#f8d7da;border:1px solid #f5c6cb;border-radius:5px;margin:20px;">
        <h2>🚨 تم اكتشاف خطأ في السيرفر</h2>
        <p><b>${message}</b></p>
        <pre style="background:#fff;padding:10px;border-radius:3px;text-align:left;direction:ltr;">${details}</pre>
        <hr>
        <p>إذا كنت ترى هذه الشاشة، فهذا يعني أن سيرفر Hostinger يعمل بنجاح ولكن الكود واجه مشكلة.</p>
      </div>
    `);
  });
  if (isSocket) {
    if (fs.existsSync(rawPort)) { try { fs.unlinkSync(rawPort); } catch(e){} }
    server.listen(rawPort, () => { try { fs.chmodSync(rawPort, '777'); } catch(e){} });
  } else {
    server.listen(parseInt(rawPort, 10));
  }
}

try {
  // Check if Next.js is installed
  const next = require('next');
  
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

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@localhost:')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@localhost:', '@127.0.0.1:');
  }

  const app = next({ dev: false });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    if (isSocket) {
      if (fs.existsSync(rawPort)) { try { fs.unlinkSync(rawPort); } catch (e) {} }
      server.listen(rawPort, () => { try { fs.chmodSync(rawPort, '777'); } catch (e) {} });
    } else {
      server.listen(parseInt(rawPort, 10));
    }
  }).catch(err => {
    emergencyServer('فشل تشغيل Next.js (تأكد من وجود مجلد .next وقاعدة البيانات)', err.stack || err.message);
  });
} catch (err) {
  emergencyServer('حزم Node.js غير مثبتة (NPM Install Required)', err.stack || err.message);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Do not exit to keep Passenger alive with potential errors
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
