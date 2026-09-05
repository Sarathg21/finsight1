const http = require('http');

const loginData = JSON.stringify({
  email: 'jeemon@fjtco.com',
  password: 'finsight_cfo'
});

const loginReq = http.request({
  hostname: '13.233.207.68',
  port: 8000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    const token = JSON.parse(body).access_token;
    console.log("Token:", token ? "Got token" : "Failed");
    
    // Fetch summary
    http.request({
      hostname: '13.233.207.68',
      port: 8000,
      path: '/api/bs/summary?period=2026-06&reporting_currency=AED',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res2 => {
      let data = '';
      res2.on('data', d => { data += d; });
      res2.on('end', () => {
        console.log("SUMMARY RESPONSE:");
        console.log(data.substring(0, 500));
      });
    }).end();
  });
});

loginReq.write(loginData);
loginReq.end();
