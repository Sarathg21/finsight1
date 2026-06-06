const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SalesRevenueReport.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The new block
const newBlock = `        {/* ── Secondary Analysis Row (Subdivision, Customers, Salesman) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          {/* 1. Subdivision */}
          <div style={{ background: '#fff', borderRadius: 12, border: \`1px solid \${C.border}\`, padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Sub-Division (₹ Cr)</div>
              <ChartMenu onViewAll={() => setOpenModal('subDiv')} endpoint="subdivision-detail" filters={appliedFilters} />
            </div>
            {loading.subDiv ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : subDivData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={subDivData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => (v.replace(/\\n/g, ' ')).length > 12 ? (v.replace(/\\n/g, ' ')).substring(0, 10) + '…' : v.replace(/\\n/g, ' ')} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => (v / 10000000).toFixed(0)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Revenue" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" formatter={v => (v / 10000000).toFixed(2)} style={{ fill: C.navy, fontSize: 9, fontWeight: 700 }} />
                    {subDivData.map((entry, i) => <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data</div>
            )}
          </div>

          {/* 2. Top Customers */}
          <div style={{ background: '#fff', borderRadius: 12, border: \`1px solid \${C.border}\`, padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Top 10 Customers by Sales (₹ Cr)</div>
              <ChartMenu onViewAll={() => setOpenModal('customerSummary')} endpoint="customer-summary" filters={appliedFilters} />
            </div>
            {loading.topCustomers ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : topCustomersData.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: 8, border: \`1px solid \${C.border}\` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f4f7fa', color: C.navy, borderBottom: \`2px solid \${C.border}\` }}>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, width: 50 }}>#</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700 }}>Customer Name</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>Sales (₹ Cr)</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>% Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomersData.slice(0, 10).map((c, i) => (
                      <tr key={i} style={{ borderBottom: \`1px solid \${C.border}\`, background: '#fff' }}>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'left', color: C.navy, fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>{(c.value / 10000000).toFixed(2)}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>{c.pct != null ? \`\${Number(c.pct).toFixed(2)}%\` : '—'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f4f7fa', fontWeight: 800, color: C.navy }}>
                      <td colSpan={2} style={{ padding: '10px 16px', textAlign: 'center' }}>Total</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{(topCustomersData.slice(0, 10).reduce((s, c) => s + (c.value || 0), 0) / 10000000).toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{topCustomersData.slice(0, 10).reduce((s, c) => s + (c.pct || 0), 0).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>

          {/* 3. Revenue by Salesman */}
          <div style={{ background: '#fff', borderRadius: 12, border: \`1px solid \${C.border}\`, padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy }}>Revenue by Salesman (₹ Cr)</div>
              <ChartMenu onViewAll={() => setOpenModal('salesmanSummary')} endpoint="salesman-summary" filters={appliedFilters} />
            </div>
            {loading.salesmanSummary ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : salesmanSummaryData.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: 8, border: \`1px solid \${C.border}\` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead style={{ background: '#f4f7fa', color: C.navy, borderBottom: \`2px solid \${C.border}\` }}>
                    <tr>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, width: 50 }}>#</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700 }}>Salesman</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>Sales (₹ Cr)</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700 }}>% Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanSummaryData.slice(0, 10).map((c, i) => (
                      <tr key={i} style={{ borderBottom: \`1px solid \${C.border}\`, background: '#fff' }}>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate, fontWeight: 600 }}>{i + 1}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'left', color: C.navy, fontWeight: 500 }}>{c.sales_person}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>{(Number(c.sales_aed) / 10000000).toFixed(2)}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'center', color: C.slate }}>{c.percentage != null ? \`\${Number(c.percentage).toFixed(2)}%\` : '—'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f4f7fa', fontWeight: 800, color: C.navy }}>
                      <td colSpan={2} style={{ padding: '10px 16px', textAlign: 'center' }}>Total</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{(salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.sales_aed) || 0), 0) / 10000000).toFixed(2)}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>{salesmanSummaryData.slice(0, 10).reduce((s, c) => s + (Number(c.percentage) || 0), 0).toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 60 }}>No data available</div>
            )}
          </div>
        </div>

        {/* ── Additional Analytics Row (Legal Entity & Target vs Actual) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          {/* Legal Entity Detail */}
          <div style={{ background: '#fff', borderRadius: 12, border: \`1px solid \${C.border}\`, padding: '16px 20px 12px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy, marginBottom: 16 }}>Legal Entity Detail</div>
            <div style={{ overflowX: 'auto', maxHeight: 220, overflowY: 'auto' }}>
              {loading.legalEnt ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={18} />)}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
                  <thead>
                    <tr>
                      {['Legal Entity', 'Revenue', '% Share'].map((h, i) => (
                        <th key={h} style={{ ...TH, textAlign: i === 0 ? 'left' : 'right', background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {legalEntData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f8fafc'}
                      >
                        <td style={{ ...TD, fontWeight: 600, color: C.navy, paddingLeft: 0 }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: row.color, marginRight: 6 }} />
                          {row.name}
                        </td>
                        <td style={{ ...TD, textAlign: 'right' }}>{fmtCurrency(row.value)}</td>
                        <td style={{ ...TD, textAlign: 'right', color: C.slate }}>{Number(row.pct).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Target vs Actual Revenue Trend */}
          <div style={{ background: '#fff', borderRadius: 12, border: \`1px solid \${C.border}\`, padding: '16px 20px 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: C.navy, marginBottom: 16 }}>Target vs Actual Revenue Trend (AED)</div>
            {loading.trend ? (
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 8 }} />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220} minWidth={0}>
                <BarChart data={trendData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f4ff" />
                  <XAxis dataKey="period" tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisNum} width={42} />
                  <Tooltip
                    formatter={(v, n) => [\`AED \${Number(v).toFixed(2)}\`, n === 'currentYear' ? 'Actual Revenue' : 'Target Revenue']}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 10 }}
                    cursor={{ fill: 'rgba(37,99,235,0.05)' }}
                  />
                  <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="currentYear" name="Actual Revenue" fill={C.green} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="target" name="Target Revenue" fill={C.orange} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', paddingTop: 80 }}>No data available</div>
            )}
          </div>
        </div>`;

// Replace from: {/* ── Secondary Analysis Row (Subdivision & Drill-down Table) ── */}
// to end of: {/* Target vs Actual Revenue */} section
let startIndex = content.indexOf('{/* ── Secondary Analysis Row (Subdivision & Drill-down Table) ── */}');
let endIndex = content.indexOf('{/* ── Sales Revenue Detailed View Table (/details with pagination) ── */}');

if (startIndex !== -1 && endIndex !== -1) {
    // Also we need to extract Salesman Detail Table and append it before the new Detailed View Table
    let detailTableStart = content.indexOf('{/* Salesman Detail Table — embedded, scrollable */}');
    let detailTableEnd = content.indexOf('{/* ══════════════════════════════════════════════════════════════ */}', detailTableStart);
    let detailTableCode = content.substring(detailTableStart, detailTableEnd);

    // Replace everything from Secondary Analysis to Detailed View
    content = content.substring(0, startIndex) + newBlock + "\\n\\n        " + detailTableCode + "\\n        " + content.substring(endIndex);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully updated layout!");
} else {
    console.error("Could not find delimiters.");
}
