const http = require('http');
const loginData = JSON.stringify({ email: 'jeemon@fjtco.com', password: 'finsight_cfo' });
const loginReq = http.request({
  hostname: '13.233.207.68', port: 8000, path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, res => {
  let body = ''; res.on('data', d => { body += d; });
  res.on('end', () => {
    const token = JSON.parse(body).access_token;
    
    // Get ALL subdivision data
    http.request({
      hostname: '13.233.207.68', port: 8000,
      path: '/api/bs/subdivision?period=2026-06&reporting_currency=AED&page_size=100',
      method: 'GET', headers: { 'Authorization': `Bearer ${token}` }
    }, res2 => {
      let data = ''; res2.on('data', d => { data += d; });
      res2.on('end', () => { 
        const parsed = JSON.parse(data);
        console.log("Total records:", parsed.data ? parsed.data.length : (Array.isArray(parsed) ? parsed.length : 'unknown'));
        const rows = parsed.data || parsed;
        rows.slice(0,5).forEach(r => console.log(JSON.stringify(r)));
        
        // Check if any balance_amount is non-zero
        const nonZero = rows.filter(r => Math.abs(r.balance_amount || 0) > 0.5);
        console.log("\nNon-zero entries:", nonZero.length);
        nonZero.forEach(r => console.log(JSON.stringify(r)));
      });
    }).end();
  });
});
loginReq.write(loginData); loginReq.end();
