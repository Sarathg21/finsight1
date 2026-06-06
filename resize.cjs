const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SalesRevenueReport.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `        {/* ── Secondary Analysis Row (Subdivision, Customers, Salesman) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>`;

const replacementStr = `        {/* ── Secondary Analysis Row (Subdivision, Customers, Salesman) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.05fr 0.95fr', gap: 14, marginBottom: 16 }}>`;

content = content.replace(targetStr, replacementStr);

// Customer Table padding
content = content.replace(
  /<th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, width: 50 }}>#/g,
  `<th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, width: 30 }}>#`
);
content = content.replace(
  /<th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700 }}>Customer Name<\/th>/g,
  `<th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Customer Name</th>`
);
content = content.replace(
  /<th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>Sales \(₹ Cr\)<\/th>/g,
  `<th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>Sales (₹ Cr)</th>`
);
content = content.replace(
  /<th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>% Contribution<\/th>/g,
  `<th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>% Contribution</th>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>\{i \+ 1\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>{i + 1}</td>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'left', color: C.navy, fontWeight: 500 }}>\{c.name\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'left', color: C.navy, fontWeight: 500, maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.name}>{c.name}</td>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>\{\(c.value \/ 10000000\).toFixed\(2\)\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'center', color: C.slate }}>{(c.value / 10000000).toFixed(2)}</td>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>\{c.pct != null \? \`\$\{Number\(c.pct\).toFixed\(2\)\\}%\` : '—'\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'center', color: C.slate }}>{c.pct != null ? \`\${Number(c.pct).toFixed(2)}%\` : '—'}</td>`
);
content = content.replace(
  /<td colSpan=\{2\} style={{ padding: '10px 16px', textAlign: 'center' }}>Total<\/td>/g,
  `<td colSpan={2} style={{ padding: '6px 8px', textAlign: 'center' }}>Total</td>`
);
content = content.replace(
  /<td style={{ padding: '10px 16px', textAlign: 'center' }}>\{\(topCustomersData.slice\(0, 10\).reduce\(\(s, c\) => s \+ \(c.value \|\| 0\), 0\) \/ 10000000\).toFixed\(2\)\}<\/td>/g,
  `<td style={{ padding: '6px 8px', textAlign: 'center' }}>{(topCustomersData.slice(0, 10).reduce((s, c) => s + (c.value || 0), 0) / 10000000).toFixed(2)}</td>`
);
content = content.replace(
  /<td style={{ padding: '10px 16px', textAlign: 'center' }}>\{topCustomersData.slice\(0, 10\).reduce\(\(s, c\) => s \+ \(c.pct \|\| 0\), 0\).toFixed\(2\)\}%<\/td>/g,
  `<td style={{ padding: '6px 8px', textAlign: 'center' }}>{topCustomersData.slice(0, 10).reduce((s, c) => s + (c.pct || 0), 0).toFixed(2)}%</td>`
);


// Salesman Table padding
content = content.replace(
  /<th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700 }}>Salesman<\/th>/g,
  `<th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>Salesman</th>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'left', color: C.navy, fontWeight: 500 }}>\{c.sales_person\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'left', color: C.navy, fontWeight: 500, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.sales_person}>{c.sales_person}</td>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>\{\(Number\(c.sales_aed\) \/ 10000000\).toFixed\(2\)\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'center', color: C.slate }}>{(Number(c.sales_aed) / 10000000).toFixed(2)}</td>`
);
content = content.replace(
  /<td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>\{c.percentage != null \? \`\$\{Number\(c.percentage\).toFixed\(2\)\\}%\` : '—'\}<\/td>/g,
  `<td style={{ padding: '4px 8px', textAlign: 'center', color: C.slate }}>{c.percentage != null ? \`\${Number(c.percentage).toFixed(2)}%\` : '—'}</td>`
);
content = content.replace(
  /<td style={{ padding: '10px 16px', textAlign: 'center' }}>\{\(salesmanSummaryData.slice\(0, 10\).reduce\(\(s, c\) => s \+ \(Number\(c.sales_aed\) \|\| 0\), 0\) \/ 10000000\).toFixed\(2\)\}<\/td>/g,
  `<td style={{ padding: '6px 8px', textAlign: 'center' }}>{(salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.sales_aed) || 0), 0) / 10000000).toFixed(2)}</td>`
);
content = content.replace(
  /<td style={{ padding: '10px 16px', textAlign: 'center' }}>\{salesmanSummaryData.slice\(0, 10\).reduce\(\(s, c\) => s \+ \(Number\(c.percentage\) \|\| 0\), 0\).toFixed\(2\)\}%<\/td>/g,
  `<td style={{ padding: '6px 8px', textAlign: 'center' }}>{salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.percentage) || 0), 0).toFixed(2)}%</td>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update layout sizes');
