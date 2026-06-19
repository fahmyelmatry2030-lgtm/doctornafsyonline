#!/usr/bin/env node

/**
 * Script للتشخيص عن بعد - يقيس ما إذا كانت قاعدة البيانات جاهزة
 * تشغيل: node diagnose-hostinger.js
 */

const https = require('https');

console.log('\n🔍 ============ HOSTINGER DIAGNOSTICS ============\n');

// جرّب الاتصال بقاعدة البيانات عبر API endpoint
const options = {
  hostname: 'doctornafsyonline.com',
  path: '/api/check-settings',
  method: 'GET',
  timeout: 5000
};

const req = https.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API is responding');
      try {
        const parsed = JSON.parse(data);
        console.log('📋 Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('📋 Response:', data);
      }
    } else {
      console.log('❌ Server returned error');
      console.log('📋 Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('\nPossible reasons:');
  console.log('1. Server is down');
  console.log('2. DNS not resolving');
  console.log('3. Network timeout');
});

req.on('timeout', () => {
  req.destroy();
  console.log('❌ Request timeout');
});
