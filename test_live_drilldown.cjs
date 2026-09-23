const http = require('http');
const loginData = JSON.stringify({ email: 'jeemon@fjtco.com', password: 'finsight_cfo' });
const loginReq = http.request({
  hostname: '13.233.207.68', port: 8000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, res => {
  let body = ''; res.on('data', d => { body += d; });
  res.on('end', () => {
    const token = JSON.parse(body).access_token;
    
    // Fetch drilldown
    http.request({
      hostname: '13.233.207.68', port: 8000,
      path: '/api/bs/drilldown?period=2026-06&reporting_currency=AED&account_code=930001',
      method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    }, res2 => {
      let data = ''; res2.on('data', d => { data += d; });
      res2.on('end', () => { console.log("DRILLDOWN:", data.substring(0, 300)); });
    }).end();
  });
});
loginReq.write(loginData); loginReq.end();
