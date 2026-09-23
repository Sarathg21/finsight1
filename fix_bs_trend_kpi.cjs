const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Fix Trend Periods KPI
code = code.replace(
  "String(trendData?.summary?.total_periods ?? '—')",
  "String(Array.isArray(trendData) ? trendData.length : '—')"
);
code = code.replace(
  "trendData?.summary\n          ? `${trendData.summary.from_period || ''} — ${trendData.summary.to_period || ''}`",
  "(Array.isArray(trendData) && trendData.length > 0)\n          ? `${trendData[0].period_code || ''} — ${trendData[trendData.length - 1].period_code || ''}`"
);
code = code.replace(
  "changePct: trendData?.summary?.period_pct ?? null,",
  "changePct: null,"
);
code = code.replace(
  "compareLabel: trendData?.summary ? 'period change' : null,",
  "compareLabel: null,"
);

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
