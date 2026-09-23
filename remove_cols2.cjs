const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// Remove from SubDivisionViewAll Table headers
code = code.replace(/<th[^>]*>Sources of Funds<\/th>\s*<th[^>]*>Application of Funds<\/th>/g, '');

// Remove from SubDivisionViewAll Table data rows
code = code.replace(/<td[^>]*>\{fmtNum\(Math\.abs\(row\.section_totals\?\.\['SOURCES OF FUNDS'\] \?\? 0\), currency\)\}<\/td>\s*<td[^>]*>\{fmtNum\(Math\.abs\(row\.section_totals\?\.\['APPLICATION OF FUNDS'\] \?\? 0\), currency\)\}<\/td>/g, '');

// Remove from Main Dashboard Table data rows
code = code.replace(/<td[^>]*>\{fmtNum\(Math\.abs\(sources\), currency\)\}<\/td>\s*<td[^>]*>\{fmtNum\(Math\.abs\(applic\), currency\)\}<\/td>/g, '');

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
