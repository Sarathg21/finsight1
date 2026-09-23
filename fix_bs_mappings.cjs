const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Fix summaryData field mappings
code = code.replace(/sec\.section ===/g, "sec.name ===");
code = code.replace(/sec\.section_total/g, "sec.total");
code = code.replace(/s\.section ===/g, "s.name ===");
code = code.replace(/ss\.sub_section ===/g, "ss.name ===");
code = code.replace(/ss\.sub_total/g, "ss.total");
code = code.replace(/summaryData\.balance_status/g, "summaryData.status");
code = code.replace(/summaryData\.balance_variance/g, "summaryData.grand_total");
code = code.replace(/secKey = sec\.section;/g, "secKey = sec.name;");

// Fix Trend Data field mappings
code = code.replace(/trendData\?\.series/g, "trendData");
code = code.replace(/p\.period_name \|\| p\.period/g, "p.period_name || p.period_code || p.period");
code = code.replace(/p\.balance_amount/g, "p.total_balance");

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
