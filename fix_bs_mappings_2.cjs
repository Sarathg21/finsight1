const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Fix pie chart mapping
code = code.replace(/sub\.sub_section\.replace/g, "sub.name.replace");
code = code.replace(/sub\.sub_total/g, "sub.total");

// Fix trendData summary fields
code = code.replace(/trendData\?\.from_period/g, "(Array.isArray(trendData) && trendData.length > 0 ? trendData[0].period_code : null)");
code = code.replace(/trendData\?\.to_period/g, "(Array.isArray(trendData) && trendData.length > 0 ? trendData[trendData.length - 1].period_code : null)");
code = code.replace(/trendData\?\.section/g, "appliedFilters?.section");
code = code.replace(/trendData\?\.account_name/g, "appliedFilters?.accountCode");

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
