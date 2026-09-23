const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Fix subdivisionData unwrapping
code = code.replace(
  "const subdivRows = subdivisionData?.data || [];",
  "const subdivRows = Array.isArray(subdivisionData) ? subdivisionData : (subdivisionData?.data || []);"
);

// Fix Drilldown unwrapping
code = code.replace(
  "const rows = data?.data || [];",
  "const rows = Array.isArray(data) ? data : (data?.data || []);"
);
code = code.replace(
  "const account = data?.account_name || '—';",
  "const account = data?.account_name || (rows[0] && rows[0].account_name) || '—';"
);
code = code.replace(
  "const total   = data?.consolidated_balance ?? 0;",
  "const total   = data?.consolidated_balance ?? rows.reduce((sum, r) => sum + (r.balance_amount || 0), 0);"
);
code = code.replace(
  "data?.period_name || data?.period || '—'",
  "data?.period_name || data?.period || (rows[0] && rows[0].period_code) || '—'"
);

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
