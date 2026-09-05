const http = require('http');

const options = {
  hostname: '13.233.207.68',
  port: 8000,
  path: '/api/bs/summary?period=2026-06&reporting_currency=AED',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => { console.log(data.substring(0, 1000)); });
});

req.on('error', e => { console.error(`problem with request: ${e.message}`); });
req.end();
