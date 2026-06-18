const http = require('http');

const rawPort = process.env.PORT || '3000';
const isSocket = isNaN(Number(rawPort)) || rawPort.startsWith('/');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <div dir="rtl" style="padding:20px;font-family:sans-serif;color:green;background-color:#d4edda;border:1px solid #c3e6cb;border-radius:5px;margin:20px;">
      <h2>✅ تم وصول الاتصال بنجاح!</h2>
      <p>إذا كنت ترى هذه الشاشة، فإن إعدادات Hostinger صحيحة والسيرفر يعمل بدون مشاكل.</p>
    </div>
  `);
});

if (isSocket) {
  const fs = require('fs');
  if (fs.existsSync(rawPort)) { try { fs.unlinkSync(rawPort); } catch(e){} }
  server.listen(rawPort, () => { try { fs.chmodSync(rawPort, '777'); } catch(e){} });
} else {
  server.listen(parseInt(rawPort, 10));
}

process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (reason) => console.error(reason));
