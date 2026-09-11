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

export function exportStatementToExcel(statementData, currency = 'AED', metadata = {}) {
  if (!statementData) return;
  const hasCompare = Boolean(metadata.comparePeriod || (statementData.totalAssets?.compare != null && statementData.totalAssets?.compare !== 0));
  const curPeriod = metadata.period || 'Current';
  const cmpPeriod = metadata.comparePeriod || 'Prior';

  const wsData = [
    ['FinSight — Detailed Balance Sheet Statement'],
    ['Period: ' + curPeriod, hasCompare ? 'Compared with: ' + cmpPeriod : '', 'Currency: ' + currency],
    ['Generated: ' + new Date().toLocaleString()],
    [],
  ];

  const headers = hasCompare
    ? ['Account Code', 'Particulars / Account Name', `As on ${curPeriod} (${currency})`, `As on ${cmpPeriod} (${currency})`, `Variance (${currency})`, 'Variance %']
    : ['Account Code', 'Particulars / Account Name', `As on ${curPeriod} (${currency})`];

  wsData.push(headers);

  const addSubSection = (title, subData) => {
    wsData.push([title, '', ...Array(headers.length - 2).fill('')]);
    (subData?.rows || []).forEach(r => {
      if (hasCompare) {
        wsData.push([
          r.code,
          r.name,
          r.current,
          r.compare,
          r.variance,
          r.variancePct != null ? (r.variancePct >= 0 ? '+' : '') + r.variancePct.toFixed(2) + '%' : '-'
        ]);
      } else {
        wsData.push([r.code, r.name, r.current]);
      }
    });
    // Subtotal row
    if (hasCompare) {
      wsData.push([
        '',
        `Total ${title.replace(/^[I|V|X]+\.\s*/, '')}`,
        subData?.totalCurrent ?? 0,
        subData?.totalCompare ?? 0,
        subData?.totalVariance ?? 0,
        subData?.totalVariancePct != null ? (subData.totalVariancePct >= 0 ? '+' : '') + subData.totalVariancePct.toFixed(2) + '%' : '-'
      ]);
    } else {
      wsData.push(['', `Total ${title.replace(/^[I|V|X]+\.\s*/, '')}`, subData?.totalCurrent ?? 0]);
    }
    wsData.push([]); // blank row
  };

  // 1. ASSETS
  wsData.push(['=== 1. ASSETS ===', '', ...Array(headers.length - 2).fill('')]);
  addSubSection('I. CURRENT ASSETS', statementData.currentAssets);
  addSubSection('II. NON-CURRENT ASSETS', statementData.nonCurrentAssets);
  if (hasCompare) {
    wsData.push([
      '',
      'TOTAL ASSETS',
      statementData.totalAssets?.current ?? 0,
      statementData.totalAssets?.compare ?? 0,
      statementData.totalAssets?.variance ?? 0,
      statementData.totalAssets?.variancePct != null ? (statementData.totalAssets.variancePct >= 0 ? '+' : '') + statementData.totalAssets.variancePct.toFixed(2) + '%' : '-'
    ]);
  } else {
    wsData.push(['', 'TOTAL ASSETS', statementData.totalAssets?.current ?? 0]);
  }
  wsData.push([]);

  // 2. EQUITY & LIABILITIES
  wsData.push(['=== 2. EQUITY & LIABILITIES ===', '', ...Array(headers.length - 2).fill('')]);
  addSubSection('I. CURRENT LIABILITIES', statementData.currentLiab);
  addSubSection('II. NON-CURRENT LIABILITIES', statementData.nonCurrentLiab);
  if (hasCompare) {
    wsData.push([
      '',
      'TOTAL LIABILITIES',
      statementData.totalLiab?.current ?? 0,
      statementData.totalLiab?.compare ?? 0,
      statementData.totalLiab?.variance ?? 0,
      statementData.totalLiab?.variancePct != null ? (statementData.totalLiab.variancePct >= 0 ? '+' : '') + statementData.totalLiab.variancePct.toFixed(2) + '%' : '-'
    ]);
  } else {
    wsData.push(['', 'TOTAL LIABILITIES', statementData.totalLiab?.current ?? 0]);
  }
  wsData.push([]);

  addSubSection('III. EQUITY', statementData.equity);
  if (hasCompare) {
    wsData.push([
      '',
      'TOTAL EQUITY',
      statementData.equity?.totalCurrent ?? 0,
      statementData.equity?.totalCompare ?? 0,
      statementData.equity?.totalVariance ?? 0,
      statementData.equity?.totalVariancePct != null ? (statementData.equity.totalVariancePct >= 0 ? '+' : '') + statementData.equity.totalVariancePct.toFixed(2) + '%' : '-'
    ]);
    wsData.push([
      '',
      'TOTAL EQUITY & LIABILITIES',
      statementData.totalEqLiab?.current ?? 0,
      statementData.totalEqLiab?.compare ?? 0,
      statementData.totalEqLiab?.variance ?? 0,
      statementData.totalEqLiab?.variancePct != null ? (statementData.totalEqLiab.variancePct >= 0 ? '+' : '') + statementData.totalEqLiab.variancePct.toFixed(2) + '%' : '-'
    ]);
  } else {
    wsData.push(['', 'TOTAL EQUITY', statementData.equity?.totalCurrent ?? 0]);
    wsData.push(['', 'TOTAL EQUITY & LIABILITIES', statementData.totalEqLiab?.current ?? 0]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 16 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Balance_Sheet_Statement');
  XLSX.writeFile(wb, `Balance_Sheet_Statement_${currency}_${curPeriod}.xlsx`);
}

export function exportStatementToPDF(statementData, currency = 'AED', metadata = {}) {
  if (!statementData) return;
  const hasCompare = Boolean(metadata.comparePeriod || (statementData.totalAssets?.compare != null && statementData.totalAssets?.compare !== 0));
  const curPeriod = metadata.period || 'Current';
  const cmpPeriod = metadata.comparePeriod || 'Prior';

  const doc = new jsPDF({ orientation: hasCompare ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text('FinSight — Balance Sheet Statement', 14, 15);
  doc.setFontSize(9);
  doc.text(
    `Period: ${curPeriod}${hasCompare ? ` | Compared with: ${cmpPeriod}` : ''} | Currency: ${currency} | Generated: ${new Date().toLocaleDateString()}`,
    14, 22
  );

  const head = hasCompare
    ? [['Code', 'Particulars / Account', `As on ${curPeriod}`, `As on ${cmpPeriod}`, `Variance (${currency})`, 'Variance %']]
    : [['Code', 'Particulars / Account', `As on ${curPeriod} (${currency})`]];

  const body = [];
  const fmt = n => n != null ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
  const fmtPct = n => n != null ? `${Number(n) >= 0 ? '+' : ''}${Number(n).toFixed(2)}%` : '—';

  const pushSectionHeader = title => {
    body.push([{ content: title, colSpan: head[0].length, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [30, 41, 59] } }]);
  };

  const pushSubSection = (title, subData) => {
    pushSectionHeader(title);
    (subData?.rows || []).forEach(r => {
      if (hasCompare) {
        body.push([r.code, r.name, fmt(r.current), fmt(r.compare), fmt(r.variance), fmtPct(r.variancePct)]);
      } else {
        body.push([r.code, r.name, fmt(r.current)]);
      }
    });
    // Subtotal
    if (hasCompare) {
      body.push([
        '',
        `Total ${title.replace(/^[I|V|X]+\.\s*/, '')}`,
        fmt(subData?.totalCurrent),
        fmt(subData?.totalCompare),
        fmt(subData?.totalVariance),
        fmtPct(subData?.totalVariancePct)
      ]);
    } else {
      body.push(['', `Total ${title.replace(/^[I|V|X]+\.\s*/, '')}`, fmt(subData?.totalCurrent)]);
    }
  };

  // ASSETS
  body.push([{ content: '1. ASSETS', colSpan: head[0].length, styles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' } }]);
  pushSubSection('I. CURRENT ASSETS', statementData.currentAssets);
  pushSubSection('II. NON-CURRENT ASSETS', statementData.nonCurrentAssets);
  if (hasCompare) {
    body.push([
      { content: 'TOTAL ASSETS', colSpan: 2, styles: { fontStyle: 'bold', textColor: [37, 99, 235] } },
      fmt(statementData.totalAssets?.current),
      fmt(statementData.totalAssets?.compare),
      fmt(statementData.totalAssets?.variance),
      fmtPct(statementData.totalAssets?.variancePct)
    ]);
  } else {
    body.push([
      { content: 'TOTAL ASSETS', colSpan: 2, styles: { fontStyle: 'bold', textColor: [37, 99, 235] } },
      fmt(statementData.totalAssets?.current)
    ]);
  }

  // EQUITY & LIABILITIES
  body.push([{ content: '2. EQUITY & LIABILITIES', colSpan: head[0].length, styles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' } }]);
  pushSubSection('I. CURRENT LIABILITIES', statementData.currentLiab);
  pushSubSection('II. NON-CURRENT LIABILITIES', statementData.nonCurrentLiab);
  if (hasCompare) {
    body.push([
      { content: 'TOTAL LIABILITIES', colSpan: 2, styles: { fontStyle: 'bold', textColor: [234, 88, 12] } },
      fmt(statementData.totalLiab?.current),
      fmt(statementData.totalLiab?.compare),
      fmt(statementData.totalLiab?.variance),
      fmtPct(statementData.totalLiab?.variancePct)
    ]);
  } else {
    body.push([
      { content: 'TOTAL LIABILITIES', colSpan: 2, styles: { fontStyle: 'bold', textColor: [234, 88, 12] } },
      fmt(statementData.totalLiab?.current)
    ]);
  }

  pushSubSection('III. EQUITY', statementData.equity);
  if (hasCompare) {
    body.push([
      { content: 'TOTAL EQUITY', colSpan: 2, styles: { fontStyle: 'bold', textColor: [21, 128, 61] } },
      fmt(statementData.equity?.totalCurrent),
      fmt(statementData.equity?.totalCompare),
      fmt(statementData.equity?.totalVariance),
      fmtPct(statementData.equity?.totalVariancePct)
    ]);
    body.push([
      { content: 'TOTAL EQUITY & LIABILITIES', colSpan: 2, styles: { fontStyle: 'bold', textColor: [21, 128, 61], fillColor: [240, 253, 244] } },
      fmt(statementData.totalEqLiab?.current),
      fmt(statementData.totalEqLiab?.compare),
      fmt(statementData.totalEqLiab?.variance),
      fmtPct(statementData.totalEqLiab?.variancePct)
    ]);
  } else {
    body.push([
      { content: 'TOTAL EQUITY', colSpan: 2, styles: { fontStyle: 'bold', textColor: [21, 128, 61] } },
      fmt(statementData.equity?.totalCurrent)
    ]);
    body.push([
      { content: 'TOTAL EQUITY & LIABILITIES', colSpan: 2, styles: { fontStyle: 'bold', textColor: [21, 128, 61], fillColor: [240, 253, 244] } },
      fmt(statementData.totalEqLiab?.current)
    ]);
  }

  autoTable(doc, {
    startY: 28,
    head,
    body,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: hasCompare ? {
      0: { cellWidth: 26 },
      1: { cellWidth: 70 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    } : {
      0: { cellWidth: 32 },
      1: { cellWidth: 100 },
      2: { halign: 'right' },
    }
  });

  doc.save(`Balance_Sheet_Statement_${currency}_${curPeriod}.pdf`);
}
