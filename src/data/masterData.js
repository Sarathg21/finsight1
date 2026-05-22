// ── Finsight Master Data ──────────────────────────────────────────
// All static reference data derived from the BRD appendices

export const LEGAL_ENTITIES = [
  { id: 1,  name: 'Alpha Ducts LLC',                      country: 'UAE', currency: 'AED' },
  { id: 2,  name: 'Alpine Coils Industry LLC',            country: 'UAE', currency: 'AED' },
  { id: 3,  name: 'DC Serve Equipment Trading LLC',       country: 'UAE', currency: 'AED' },
  { id: 4,  name: 'Euroclima Middle East Central AC Mfg', country: 'UAE', currency: 'AED' },
  { id: 5,  name: 'Faisal Jassem Trading Co. LLC',        country: 'UAE', currency: 'AED' },
  { id: 6,  name: 'Faisal Jassim Al Dosari Trading',      country: 'UAE', currency: 'AED' },
  { id: 7,  name: 'Faisal Jassim Engineering & Trading',  country: 'UAE', currency: 'AED' },
  { id: 8,  name: 'Faisal Jassim Industries LLC',         country: 'UAE', currency: 'AED' },
  { id: 9,  name: 'Faisal Jassim Trading Co. LLC',        country: 'UAE', currency: 'AED' },
  { id: 10, name: 'FJ Care Airconditioning Trading LLC',  country: 'UAE', currency: 'AED' },
  { id: 11, name: 'FJ Care Technical Services LLC',       country: 'UAE', currency: 'AED' },
  { id: 12, name: 'FJ Electrical Engineering Gen Trading',country: 'KSA', currency: 'SAR' },
  { id: 13, name: 'FJ Industries WLL',                   country: 'Qatar', currency: 'QAR' },
  { id: 14, name: 'FJ Trading & Engineering Co WLL',     country: 'Qatar', currency: 'QAR' },
  { id: 15, name: 'Flowtech Air Distribution Industries', country: 'UAE', currency: 'AED' },
  { id: 16, name: 'Future Journey Energy Solutions LLC',  country: 'UAE', currency: 'AED' },
  { id: 17, name: 'Metaform Industries LLC',              country: 'UAE', currency: 'AED' },
  { id: 18, name: 'Multiplast Dubai LLC',                 country: 'UAE', currency: 'AED' },
  { id: 19, name: 'Raphael Khlat India Private Limited',  country: 'India', currency: 'INR' },
  { id: 20, name: 'Raphael Khlat Middle East FZCO',       country: 'UAE', currency: 'AED' },
  { id: 21, name: 'Tawreed Co LLC',                       country: 'Oman', currency: 'OMR' },
  { id: 22, name: 'Tawreed Integrated Industries',        country: 'UAE', currency: 'AED' },
];

export const COUNTRIES = ['All Countries','UAE','KSA','Oman','Qatar','India','Iraq'];

export const DIVISIONS = [
  'Air Handling Unit','Alpha Ducts','Alpine Coils','Busbar','Chiller','Corporate Services',
  'DC Serve','Ducting UAE','ECS Promaster UAE','ECS Promaster KSA','Euroclima Middle East',
  'FJ Care','FJ Energy','FJ Iraq','Flowtech UAE, QTR, OMN','Flowtech KSA','Insulation',
  'Lighting Solutions','Metaform','Multiplast KSA','Multiplast UAE','Pumps Aquaflo UAE, OMN',
  'Pumps KSA','Qatar MEP','RKME','Ventilation Fans','DIP MPD Factory UAE',
];

export const CURRENCIES = ['USD','AED','SAR','QAR','OMR','INR'];

export const PERIODS = ['Current Month','Previous Month','Quarter to Date','Year to Date','Custom Range'];

export const YEARS = ['2023','2024','2025','2026'];

export const SCENARIOS = ['Actual','Budget','Prior Year'];

// ── Mock Financial Data (representative sample) ──────────────────

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Revenue by month (in millions USD)
export const MONTHLY_REVENUE = [
  { month: 'Jan', actual: 42.1, budget: 40.0, py: 37.5 },
  { month: 'Feb', actual: 38.7, budget: 41.0, py: 36.2 },
  { month: 'Mar', actual: 51.3, budget: 48.0, py: 44.8 },
  { month: 'Apr', actual: 49.2, budget: 50.0, py: 43.1 },
  { month: 'May', actual: 55.6, budget: 52.0, py: 48.9 },
  { month: 'Jun', actual: 47.8, budget: 53.0, py: 45.3 },
  { month: 'Jul', actual: 58.1, budget: 55.0, py: 50.2 },
  { month: 'Aug', actual: 61.4, budget: 58.0, py: 54.7 },
  { month: 'Sep', actual: 57.9, budget: 60.0, py: 52.1 },
  { month: 'Oct', actual: 63.2, budget: 62.0, py: 56.8 },
  { month: 'Nov', actual: 59.5, budget: 61.0, py: 53.4 },
  { month: 'Dec', actual: 67.8, budget: 65.0, py: 60.1 },
];

// Gross Profit & Net Profit (parallel to revenue)
export const MONTHLY_PL = MONTHLY_REVENUE.map(m => ({
  month: m.month,
  revenue: m.actual,
  grossProfit: +(m.actual * 0.38).toFixed(1),
  ebit: +(m.actual * 0.22).toFixed(1),
  netProfit: +(m.actual * 0.16).toFixed(1),
}));

// Working Capital Trend
export const WORKING_CAPITAL_TREND = [
  { month: 'Jan', receivables: 180, inventory: 95, payables: 110, nwc: 165 },
  { month: 'Feb', receivables: 175, inventory: 98, payables: 108, nwc: 165 },
  { month: 'Mar', receivables: 195, inventory: 102, payables: 115, nwc: 182 },
  { month: 'Apr', receivables: 190, inventory: 100, payables: 112, nwc: 178 },
  { month: 'May', receivables: 210, inventory: 108, payables: 120, nwc: 198 },
  { month: 'Jun', receivables: 205, inventory: 105, payables: 118, nwc: 192 },
  { month: 'Jul', receivables: 220, inventory: 112, payables: 125, nwc: 207 },
  { month: 'Aug', receivables: 235, inventory: 118, payables: 130, nwc: 223 },
  { month: 'Sep', receivables: 228, inventory: 115, payables: 128, nwc: 215 },
  { month: 'Oct', receivables: 245, inventory: 122, payables: 135, nwc: 232 },
  { month: 'Nov', receivables: 238, inventory: 119, payables: 132, nwc: 225 },
  { month: 'Dec', receivables: 260, inventory: 128, payables: 140, nwc: 248 },
];

// AR Aging Buckets (in millions)
export const AR_AGING = [
  { bucket: 'Current',      amount: 161.45, pct: 21.8 },
  { bucket: '1-30 days',    amount: 75.88,  pct: 10.2 },
  { bucket: '31-60 days',   amount: 86.63,  pct: 11.7 },
  { bucket: '61-90 days',   amount: 41.00,  pct: 5.5  },
  { bucket: '91-120 days',  amount: 57.05,  pct: 7.7  },
  { bucket: '120+ days',    amount: 318.40, pct: 43.1 },
];

// AP Aging
export const AP_AGING = [
  { bucket: 'Current',     amount: 42.1, pct: 38 },
  { bucket: '1-30 days',   amount: 28.3, pct: 26 },
  { bucket: '31-60 days',  amount: 19.7, pct: 18 },
  { bucket: '61-90 days',  amount: 11.4, pct: 10 },
  { bucket: '90+ days',    amount: 9.1,  pct: 8 },
];

// Collections Trend
export const COLLECTIONS_TREND = MONTHLY_REVENUE.map(m => ({
  month: m.month,
  collected: +(m.actual * 0.82 + (Math.random()*4-2)).toFixed(1),
  target: +(m.actual * 0.85).toFixed(1),
}));

// Division Performance
export const DIVISION_PERFORMANCE = [
  { division: 'Euroclima Middle East', revenue: 58.2, gp: 22.1, gpPct: '38%', yoy: '+12%', status: 'up'      },
  { division: 'FJ Care',              revenue: 42.7, gp: 18.3, gpPct: '43%', yoy: '+8%',  status: 'up'      },
  { division: 'Metaform',             revenue: 37.4, gp: 12.9, gpPct: '34%', yoy: '+5%',  status: 'up'      },
  { division: 'Alpine Coils',         revenue: 31.8, gp: 11.4, gpPct: '36%', yoy: '+3%',  status: 'up'      },
  { division: 'Flowtech UAE',         revenue: 28.5, gp: 9.7,  gpPct: '34%', yoy: '-2%',  status: 'down'    },
  { division: 'DC Serve',             revenue: 22.1, gp: 7.8,  gpPct: '35%', yoy: '+9%',  status: 'up'      },
  { division: 'FJ Energy',            revenue: 19.6, gp: 6.3,  gpPct: '32%', yoy: '+18%', status: 'up'      },
  { division: 'Air Handling Unit',    revenue: 18.3, gp: 5.9,  gpPct: '32%', yoy: '-1%',  status: 'down'    },
  { division: 'Multiplast UAE',       revenue: 15.4, gp: 5.1,  gpPct: '33%', yoy: '+6%',  status: 'up'      },
  { division: 'Corporate Services',   revenue: 0,    gp: -8.4, gpPct: '-',   yoy: '-',    status: 'neutral' },
];

// Salesman Performance
export const SALESMAN_PERFORMANCE = [
  { name: 'Ahmed Al Rashidi',   division: 'FJ Care',    revenue: 8.4, collected: 7.2, ar: 3.1, overdue: 0.8, efficiency: '94%' },
  { name: 'Mohammed Al Farsi',  division: 'Euroclima',  revenue: 7.8, collected: 6.5, ar: 4.2, overdue: 1.2, efficiency: '87%' },
  { name: 'Rajesh Kumar',       division: 'Alpine',     revenue: 6.9, collected: 6.1, ar: 2.8, overdue: 0.5, efficiency: '91%' },
  { name: 'Siddharth Nair',     division: 'Metaform',   revenue: 6.5, collected: 5.8, ar: 3.5, overdue: 0.9, efficiency: '89%' },
  { name: 'Khalid Al Dosari',   division: 'Flowtech',   revenue: 5.8, collected: 4.9, ar: 4.8, overdue: 2.1, efficiency: '76%' },
  { name: 'Kumar Pillai',       division: 'DC Serve',   revenue: 5.2, collected: 4.7, ar: 2.9, overdue: 0.6, efficiency: '90%' },
  { name: 'Hassan Al Nuaimi',   division: 'FJ Energy',  revenue: 4.9, collected: 4.0, ar: 3.7, overdue: 1.4, efficiency: '79%' },
  { name: 'Pradeep Menon',      division: 'Air Handling',revenue: 4.5,collected: 4.2, ar: 1.8, overdue: 0.3, efficiency: '95%' },
];

// Bank Facility
export const BANK_FACILITIES = [
  { type: 'OD / WCDL',      limit: 85.0,  utilized: 62.4, available: 22.6 },
  { type: 'TR / LC',         limit: 120.0, utilized: 87.1, available: 32.9 },
  { type: 'Bank Guarantee',  limit: 65.0,  utilized: 48.6, available: 16.4 },
  { type: 'Term Loan',       limit: 40.0,  utilized: 31.2, available: 8.8  },
];

// Fixed Assets Summary
export const FIXED_ASSETS = [
  { class: 'Plant & Machinery',    gross: 82.4, acc_dep: 34.1, nbv: 48.3, additions: 5.2, disposals: 0.8 },
  { class: 'Building & Property',  gross: 65.1, acc_dep: 18.3, nbv: 46.8, additions: 0,   disposals: 0   },
  { class: 'Furniture & Fixtures', gross: 12.8, acc_dep: 7.4,  nbv: 5.4,  additions: 0.4, disposals: 0.1 },
  { class: 'Vehicles',             gross: 18.5, acc_dep: 11.2, nbv: 7.3,  additions: 1.2, disposals: 2.1 },
  { class: 'IT Equipment',         gross: 9.3,  acc_dep: 6.1,  nbv: 3.2,  additions: 0.8, disposals: 0.3 },
  { class: 'Leasehold Impr.',      gross: 7.6,  acc_dep: 4.2,  nbv: 3.4,  additions: 0,   disposals: 0   },
];

// Inventory Aging
export const INVENTORY_AGING = [
  { bucket: '< 90 days',    amount: 89.64, pct: 71.9 },
  { bucket: '91-180 days',  amount: 13.56, pct: 10.9 },
  { bucket: '181-365 days', amount: 8.54,  pct: 6.9  },
  { bucket: '1-2 years',    amount: 8.50,  pct: 6.8  },
  { bucket: '> 2 years',    amount: 4.34,  pct: 3.5  },
];

// KPI Summary for CFO Dashboard
export const KPI_SUMMARY = {
  revenueMTD:      { value: 67.8, change: '+8.2%',  dir: 'up'   },
  revenuYTD:       { value: 652.6, change: '+11.4%', dir: 'up'   },
  grossProfit:     { value: 248.0, change: '+9.1%',  dir: 'up'   },
  gpMargin:        { value: '38.0%', change: '+0.6pp', dir: 'up' },
  ebitda:          { value: 182.4, change: '+14.2%', dir: 'up'   },
  netProfit:       { value: 104.4, change: '+10.8%', dir: 'up'   },
  nwc:             { value: 755.0, change: '+6.9%',  dir: 'up'   }, // AR + Inv - Payables (approx)
  dso:             { value: '112 days', change: '+58 days', dir: 'down' }, // Rec / (Rev/365) -> 740 / (2.4k/365) approx
  dio:             { value: '45 days', change: '+7 days', dir: 'down' },
  dpo:             { value: '42 days', change: '+1 day',  dir: 'down' },
  grossAR:         { value: 740.4, change: '+4.2%',  dir: 'down' },
  overdueAR:       { value: 579.0, change: '+12.1%', dir: 'down' },
  collectionsMTD:  { value: 55.6,  change: '+7.4%',  dir: 'up'   },
  collectionEff:   { value: '21.8%', change: '-60pp',   dir: 'down' },
  cashBalance:     { value: 38.4,  change: '-4.1%',  dir: 'down' },
  totalFacility:   { value: 310.0, change: '0%',     dir: 'neutral' },
  facilityUtil:    { value: '73%', change: '+2pp',   dir: 'down' },
};
