const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const arCsvPath = path.join(__dirname, 'Receivable Aging Report - Transaction Basis_Output.csv');
const invXlsPath = path.join(__dirname, 'Inventory Aging Report_V8_Output (2).xls');
const arDueXlsPath = path.join(__dirname, 'Receivable Aging Report - Due date Basis(1) (1).xlsx');

function cleanValue(val) {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).replace(/[",]/g, '').trim();
  if (s.startsWith('(') && s.endswith(')')) {
    s = '-' + s.substring(1, s.length - 1);
  }
  let n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

const results = {};

// 1. Process AR CSV
try {
  const arWorkbook = XLSX.readFile(arCsvPath);
  const arSheet = arWorkbook.Sheets[arWorkbook.SheetNames[0]];
  const arData = XLSX.utils.sheet_to_json(arSheet, { header: 1 });
  
  let totalAR = 0;
  const buckets = {
    'Current': 0,
    '1-30 days': 0,
    '31-60 days': 0,
    '61-90 days': 0,
    '91-120 days': 0,
    '120+ days': 0
  };

  for (let i = 9; i < arData.length; i++) {
    const row = arData[i];
    if (!row || row.length < 20) continue;
    
    const rowTotal = cleanValue(row[10]);
    totalAR += rowTotal;
    buckets['Current'] += cleanValue(row[11]);
    buckets['1-30 days'] += cleanValue(row[12]);
    buckets['31-60 days'] += cleanValue(row[13]);
    buckets['61-90 days'] += cleanValue(row[14]);
    buckets['91-120 days'] += cleanValue(row[15]);
    buckets['120+ days'] += (
      cleanValue(row[16]) + 
      cleanValue(row[17]) + 
      cleanValue(row[18]) + 
      cleanValue(row[19])
    );
  }

  results.AR_AGING = Object.keys(buckets).map(key => ({
    bucket: key,
    amount: +(buckets[key] / 1000000).toFixed(2),
    pct: totalAR !== 0 ? +((buckets[key] / totalAR) * 100).toFixed(1) : 0
  }));
  results.grossAR = +(totalAR / 1000000).toFixed(2);
  results.overdueAR = +((totalAR - buckets['Current']) / 1000000).toFixed(2);
} catch (e) {
  results.arError = e.message;
}

// 2. Process Inventory XLS
try {
  const invWorkbook = XLSX.readFile(invXlsPath);
  const invSheet = invWorkbook.Sheets['Sheet1'];
  const invData = XLSX.utils.sheet_to_json(invSheet, { header: 1 });
  
  let totalInv = 0;
  const invBuckets = {
    '< 90 days': 0,
    '91-180 days': 0,
    '181-365 days': 0,
    '1-2 years': 0,
    '> 2 years': 0
  };

  // Data starts at row 10 (index 9)
  for (let i = 9; i < invData.length; i++) {
    const row = invData[i];
    if (!row || row.length < 31) continue;

    const rowTotal = cleanValue(row[14]); // Total Cost Value
    totalInv += rowTotal;

    // Index 16: 0-30 Val, 18: 31-60 Val, 20: 61-90 Val
    invBuckets['< 90 days'] += cleanValue(row[16]) + cleanValue(row[18]) + cleanValue(row[20]);
    // Index 22: 91-120 Val, 24: 121-180 Val
    invBuckets['91-180 days'] += cleanValue(row[22]) + cleanValue(row[24]);
    // Index 26: 181-365 Val
    invBuckets['181-365 days'] += cleanValue(row[26]);
    // Index 28: 366-730 Val
    invBuckets['1-2 years'] += cleanValue(row[28]);
    // Index 30: Above 730 Val
    invBuckets['> 2 years'] += cleanValue(row[30]);
  }

  results.INVENTORY_AGING = Object.keys(invBuckets).map(key => ({
    bucket: key,
    amount: +(invBuckets[key] / 1000000).toFixed(2),
    pct: totalInv > 0 ? +((invBuckets[key] / totalInv) * 100).toFixed(1) : 0
  }));
  results.totalInventory = +(totalInv / 1000000).toFixed(2);
} catch (e) {
  results.invError = e.message;
}

// 3. Process AR Due Date XLSX
try {
  const arDueWorkbook = XLSX.readFile(arDueXlsPath);
  const arDueSheet = arDueWorkbook.Sheets[arDueWorkbook.SheetNames[0]];
  const arDueData = XLSX.utils.sheet_to_json(arDueSheet, { header: 1 });
  
  let totalARDue = 0;
  let currentARDue = 0;
  // Data starts at row 10 (index 9)
  for (let i = 9; i < arDueData.length; i++) {
    const row = arDueData[i];
    if (!row || row.length < 12) continue;
    totalARDue += cleanValue(row[10]);
    currentARDue += cleanValue(row[11]);
  }
  results.arDueSummary = {
    current: +(currentARDue / 1000000).toFixed(2),
    total: +(totalARDue / 1000000).toFixed(2)
  };
} catch (e) {
  results.arDueError = e.message;
}

console.log(JSON.stringify(results, null, 2));
