import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportTrendToExcel(trendRows, currency) {
  if (!trendRows || !trendRows.length) return;
  const wsData = [
    ['Balance Sheet 6-Month Trend Analysis'],
    ['Generated: ' + new Date().toLocaleDateString(), 'Currency: ' + currency],
    [],
    [
      'Period',
      'Total Assets (' + currency + ')',
      'Assets MoM %',
      'Total Liabilities (' + currency + ')',
      'Liabilities MoM %',
      'Total Equity (' + currency + ')',
      'Equity MoM %',
      'Liability-to-Equity Ratio',
      'Debt-to-Equity Ratio'
    ],
    ...trendRows.map(r => [
      r.period,
      r.totalAssets,
      r.assetsMoMPct != null ? (r.assetsMoMPct >= 0 ? '+' : '') + r.assetsMoMPct.toFixed(2) + '%' : '-',
      r.totalLiabilities,
      r.liabMoMPct != null ? (r.liabMoMPct >= 0 ? '+' : '') + r.liabMoMPct.toFixed(2) + '%' : '-',
      r.totalEquity,
      r.equityMoMPct != null ? (r.equityMoMPct >= 0 ? '+' : '') + r.equityMoMPct.toFixed(2) + '%' : '-',
      r.liabilityToEquity != null ? r.liabilityToEquity.toFixed(2) : '-',
      r.debtToEquity != null ? r.debtToEquity.toFixed(2) : '-',
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'BS_Trend');
  XLSX.writeFile(wb, 'Balance_Sheet_Trend_' + currency + '.xlsx');
}

export function exportTrendToPDF(trendRows, currency) {
  if (!trendRows || !trendRows.length) return;
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text('Balance Sheet 6-Month Trend Analysis', 14, 15);
  doc.setFontSize(10);
  doc.text('Currency: ' + currency + ' | Periods: ' + (trendRows[0]?.period || '') + ' to ' + (trendRows[trendRows.length - 1]?.period || ''), 14, 22);

  const tableHead = [[
    'Period',
    'Total Assets (' + currency + ')',
    'Assets MoM %',
    'Total Liabilities (' + currency + ')',
    'Liab MoM %',
    'Total Equity (' + currency + ')',
    'Equity MoM %',
    'Liab/Equity'
  ]];

  const tableBody = trendRows.map(r => [
    r.period,
    r.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    r.assetsMoMPct != null ? (r.assetsMoMPct >= 0 ? '+' : '') + r.assetsMoMPct.toFixed(2) + '%' : '-',
    r.totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    r.liabMoMPct != null ? (r.liabMoMPct >= 0 ? '+' : '') + r.liabMoMPct.toFixed(2) + '%' : '-',
    r.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    r.equityMoMPct != null ? (r.equityMoMPct >= 0 ? '+' : '') + r.equityMoMPct.toFixed(2) + '%' : '-',
    r.liabilityToEquity != null ? r.liabilityToEquity.toFixed(2) + 'x' : '-',
  ]);

  autoTable(doc, {
    startY: 28,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 9 },
  });

  doc.save('Balance_Sheet_Trend_' + currency + '.pdf');
}

export function normalizeComposition(data, periodLabel = '') {
  if (!data) return null;
  if (data.assets && data.liabEquity) return data; // already normalized

  const totAssets = data.totalAssets?.current ?? data.totalAssets ?? 0;
  const ncAssets = data.nonCurrentAssets?.totalCurrent ?? data.nonCurrentAssets ?? 0;
  const cAssets = data.currentAssets?.totalCurrent ?? data.currentAssets ?? 0;
  const ncPct = totAssets ? ((ncAssets / totAssets) * 100).toFixed(1) : '0.0';
  const cPct = totAssets ? ((cAssets / totAssets) * 100).toFixed(1) : '0.0';

  const totEqLiab = data.totalEqLiab?.current ?? data.totalEqLiab ?? 0;
  const eqAmt = data.equity?.totalCurrent ?? data.equity ?? 0;
  const ncLiab = data.nonCurrentLiab?.totalCurrent ?? data.nonCurrentLiab ?? 0;
  const cLiab = data.currentLiab?.totalCurrent ?? data.currentLiab ?? 0;
  const eqPct = totEqLiab ? ((eqAmt / totEqLiab) * 100).toFixed(1) : '0.0';
  const ncLiabPct = totEqLiab ? ((ncLiab / totEqLiab) * 100).toFixed(1) : '0.0';
  const cLiabPct = totEqLiab ? ((cLiab / totEqLiab) * 100).toFixed(1) : '0.0';

  return {
    period: periodLabel || data.period || '',
    assets: {
      total: totAssets,
      nonCurrent: { amount: ncAssets, pct: ncPct },
      current: { amount: cAssets, pct: cPct },
    },
    liabEquity: {
      total: totEqLiab,
      equity: { amount: eqAmt, pct: eqPct },
      nonCurrentLiab: { amount: ncLiab, pct: ncLiabPct },
      currentLiab: { amount: cLiab, pct: cLiabPct },
    }
  };
}

export function exportCompositionToExcel(compositionInput, currency, appliedFilters = {}) {
  const composition = normalizeComposition(compositionInput, appliedFilters?.period);
  if (!composition) return;
  const wsData = [
    ['Balance Sheet Composition Analysis'],
    ['Period: ' + (composition.period || ''), 'Currency: ' + currency],
    [],
    ['=== ASSET COMPOSITION ==='],
    ['Component', 'Amount (' + currency + ')', '% Share of Total Assets'],
    ['Non-current Assets', composition.assets.nonCurrent.amount, composition.assets.nonCurrent.pct + '%'],
    ['Current Assets', composition.assets.current.amount, composition.assets.current.pct + '%'],
    ['TOTAL ASSETS', composition.assets.total, '100.0%'],
    [],
    ['=== LIABILITIES & EQUITY COMPOSITION ==='],
    ['Component', 'Amount (' + currency + ')', '% Share of Total Liabilities & Equity'],
    ['Equity', composition.liabEquity.equity.amount, composition.liabEquity.equity.pct + '%'],
    ['Non-current Liabilities', composition.liabEquity.nonCurrentLiab.amount, composition.liabEquity.nonCurrentLiab.pct + '%'],
    ['Current Liabilities', composition.liabEquity.currentLiab.amount, composition.liabEquity.currentLiab.pct + '%'],
    ['TOTAL LIABILITIES & EQUITY', composition.liabEquity.total, '100.0%'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'BS_Composition');
  XLSX.writeFile(wb, 'Balance_Sheet_Composition_' + currency + '.xlsx');
}

export function exportCompositionToPDF(compositionInput, currency, appliedFilters = {}) {
  const composition = normalizeComposition(compositionInput, appliedFilters?.period);
  if (!composition) return;
  const doc = new jsPDF({ orientation: 'portrait' });
  doc.setFontSize(14);
  doc.text('Balance Sheet Composition Analysis', 14, 15);
  doc.setFontSize(10);
  doc.text('Period: ' + (composition.period || '') + ' | Currency: ' + currency, 14, 22);

  doc.setFontSize(11);
  doc.text('1. Asset Composition', 14, 30);
  autoTable(doc, {
    startY: 34,
    head: [['Component', 'Amount (' + currency + ')', '% Share of Total Assets']],
    body: [
      ['Non-current Assets', composition.assets.nonCurrent.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), composition.assets.nonCurrent.pct + '%'],
      ['Current Assets', composition.assets.current.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), composition.assets.current.pct + '%'],
      ['TOTAL ASSETS', composition.assets.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), '100.0%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  });

  const finalY = (doc.lastAutoTable?.finalY || 60) + 12;
  doc.setFontSize(11);
  doc.text('2. Liabilities & Equity Composition', 14, finalY);
  autoTable(doc, {
    startY: finalY + 4,
    head: [['Component', 'Amount (' + currency + ')', '% Share of Total Liabilities & Equity']],
    body: [
      ['Equity', composition.liabEquity.equity.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), composition.liabEquity.equity.pct + '%'],
      ['Non-current Liabilities', composition.liabEquity.nonCurrentLiab.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), composition.liabEquity.nonCurrentLiab.pct + '%'],
      ['Current Liabilities', composition.liabEquity.currentLiab.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }), composition.liabEquity.currentLiab.pct + '%'],
      ['TOTAL LIABILITIES & EQUITY', composition.liabEquity.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), '100.0%'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save('Balance_Sheet_Composition_' + currency + '.pdf');
}
