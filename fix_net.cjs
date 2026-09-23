const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

code = code.replace(
  "const sources = row.section_totals?.['SOURCES OF FUNDS'] ?? 0;",
  "const sources = row.section_totals?.['SOURCES OF FUNDS'] ?? 0;"
);
code = code.replace(
  "const applic  = row.section_totals?.['APPLICATION OF FUNDS'] ?? 0;",
  "const applic  = row.section_totals?.['APPLICATION OF FUNDS'] ?? 0;"
);
code = code.replace(
  "const net     = row.grand_total ?? 0;",
  "const net     = row.grand_total ?? row.balance_amount ?? 0;"
);

// Do it again globally in case it is in SubDivisionViewAll modal too
code = code.replace(/const net\s*=\s*row\.grand_total\s*\?\?\s*0;/g, "const net = row.grand_total ?? row.balance_amount ?? 0;");

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
