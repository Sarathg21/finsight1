const fs = require('fs');
let code = fs.readFileSync('src/pages/BalanceSheet.jsx', 'utf8');

// SubDivisionViewAll
code = code.replace(
  "<th style={MTH}>Sources of Funds</th>\n                <th style={MTH}>Application of Funds</th>",
  ""
);
code = code.replace(
  "<td style={{ ...MTD, color: C.rose }}>{fmtNum(Math.abs(row.section_totals?.['SOURCES OF FUNDS'] ?? 0), currency)}</td>\n              <td style={{ ...MTD, color: C.green }}>{fmtNum(Math.abs(row.section_totals?.['APPLICATION OF FUNDS'] ?? 0), currency)}</td>",
  ""
);

// Main dashboard table
code = code.replace(
  "<th style={TH}>Sources of Funds</th>\n                  <th style={TH}>Application of Funds</th>",
  ""
);
code = code.replace(
  "<td style={{ ...TD, color: C.rose }}>{fmtNum(Math.abs(sources), currency)}</td>\n                        <td style={{ ...TD, color: C.green }}>{fmtNum(Math.abs(applic), currency)}</td>",
  ""
);

fs.writeFileSync('src/pages/BalanceSheet.jsx', code);
