const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Fix handleReset
code = code.replace(
  "period: filterOptions.periods[0] || ''",
  "period: (filterOptions.periods[0] && typeof filterOptions.periods[0] === 'object' ? filterOptions.periods[0].period : filterOptions.periods[0]) || ''"
);
code = code.replace(
  "comparePeriod: filterOptions.periods[1] || ''",
  "comparePeriod: (filterOptions.periods[1] && typeof filterOptions.periods[1] === 'object' ? filterOptions.periods[1].period : filterOptions.periods[1]) || ''"
);

// Fix initial load hook
code = code.replace(
  "const first  = periods[0];",
  "const first  = (periods[0] && typeof periods[0] === 'object' ? periods[0].period : periods[0]) || '';"
);
code = code.replace(
  "const second = periods[1] || '';",
  "const second = (periods[1] && typeof periods[1] === 'object' ? periods[1].period : periods[1]) || '';"
);

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
