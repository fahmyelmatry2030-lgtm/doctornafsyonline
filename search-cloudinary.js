const https = require('https');
const crypto = require('crypto');

const cloud_name = 'dik45g11h';
const api_key = '117826882361358';
const api_secret = 'TNJc7H0os2loOPsXE6dLTOU854c';

const auth = Buffer.from(`${api_key}:${api_secret}`).toString('base64');

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${cloud_name}/resources/search`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({
  expression: 'folder:nafsi/contracts/*',
  max_results: 10
}));
req.end();
