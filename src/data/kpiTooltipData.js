/**
 * FinSight Executive Dashboard – KPI Formula & Tooltip Specification
 * Version 1.0 | Dated 13 November 2026
 *
 * Authoritative source for all 19 KPI definitions, formulas, calculation periods,
 * source modules and accounting notes displayed on the Executive Dashboard.
 *
 * IMPORTANT:
 * - Do NOT modify formulas or definitions without updating the specification.
 * - These definitions are display-only. Frontend does NOT recalculate KPI values.
 * - All KPI values continue to come directly from backend API responses.
 */

export const KPI_TOOLTIP_DATA = {
  // ─────────────────────────────────────────────
  // GROUP A – PROFITABILITY
  // ─────────────────────────────────────────────

  total_revenue: {
    title: 'Total Revenue',
    definition:
      'The total value of goods and services billed to customers during the selected period, before any deductions.',
    formula: 'Total Revenue = Revenue from Sale of Goods & Services',
    calculationBasis: 'PTD (Period-to-Date) or YTD (Year-to-Date)',
    source: 'P&L Analytics Module',
    notes: [
      'Includes all billable sales across all legal entities and divisions within the selected hierarchy filters.',
      'Revenue is recognised on dispatch / invoice date as per the company accounting policy.',
      'Intercompany revenue is excluded from consolidated figures.',
    ],
  },

  cost_of_material: {
    title: 'Cost of Material',
    definition:
      'The direct cost of raw materials and components consumed in producing the goods sold during the selected period.',
    formula: 'Cost of Material = Direct Material Cost + Freight-In Costs',
    calculationBasis: 'PTD or YTD',
    source: 'P&L Analytics / Manufacturing Cost Module',
    notes: [
      'Includes all direct material purchases and inbound logistics costs attributable to production.',
      'Manufacturing overhead and labour are reported separately and are NOT included in this figure.',
      'Presented as an absolute cost; a lower value is considered favourable relative to prior periods.',
    ],
  },

  gross_profit: {
    title: 'Gross Profit',
    definition:
      'The profit remaining after deducting the direct cost of material from total revenue. Reflects core production efficiency before operating expenses.',
    formula: 'Gross Profit = Total Revenue − Cost of Material',
    calculationBasis: 'PTD or YTD',
    source: 'P&L Analytics Module',
    notes: [
      'Gross Profit % (margin) is separately displayed in the Key Financial Parameters table.',
      'Does not include depreciation, operating expenses, finance costs or taxation.',
      'A negative Gross Profit indicates that direct material costs exceed revenues for the selected period.',
    ],
  },

  ebitda: {
    title: 'EBITDA',
    definition:
      'Earnings Before Interest, Taxes, Depreciation and Amortisation. Measures core operating profitability excluding financing, tax and non-cash depreciation effects.',
    formula:
      'EBITDA = Net Profit + Finance Cost + Tax + Non-Manufacturing Depreciation',
    calculationBasis: 'PTD or YTD',
    source: 'P&L Analytics Module',
    notes: [
      'IMPORTANT: Only Non-Manufacturing Depreciation is added back. Manufacturing depreciation is embedded within the Cost of Material and is NOT added back separately.',
      'Finance Cost includes bank interest charges and similar borrowing costs.',
      'Tax refers to corporate income tax recognised in the period.',
      'This EBITDA figure reflects operating performance net of manufacturing cost (including mfg. depreciation).',
    ],
  },

  net_profit: {
    title: 'Net Profit',
    definition:
      'The bottom-line profit after all expenses, including operating expenses, finance costs, depreciation and taxes, have been deducted from revenue.',
    formula:
      'Net Profit = Gross Profit − Operating Expenses − Finance Cost − Depreciation (Non-Mfg) − Tax',
    calculationBasis: 'PTD or YTD',
    source: 'P&L Analytics Module',
    notes: [
      'Net Profit % (margin) is separately displayed in the Key Financial Parameters table.',
      'A negative value indicates a net loss for the selected period.',
      'Net Profit is the basis for the ROI % calculation on this dashboard.',
    ],
  },

  // ─────────────────────────────────────────────
  // GROUP B – WORKING CAPITAL
  // ─────────────────────────────────────────────

  trade_working_capital: {
    title: 'Trade Working Capital',
    definition:
      'The net capital tied up in day-to-day trading operations, specifically trade receivables and inventories minus trade payables.',
    formula:
      'Trade Working Capital = Trade Receivables + Inventory − Trade Payables',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Working Capital / Receivables / Inventory / Payables Modules',
    notes: [
      'A lower Trade Working Capital indicates more efficient use of operational capital.',
      'Intercompany balances are excluded from this calculation.',
      'This figure is the basis for the CCC (Cash Conversion Cycle) calculation.',
    ],
  },

  overdue_receivables: {
    title: 'Overdue Receivables',
    definition:
      'The total value of customer invoices that remain unpaid beyond their contractual due date as at the period-end.',
    formula:
      'Overdue Receivables = Sum of all outstanding invoice amounts with due date < Period-End Date',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Receivables Report Module',
    notes: [
      'Overdue is defined as any invoice whose due date has passed and which remains wholly or partially unpaid.',
      'Includes all aging buckets (1–30 days, 31–60 days, 61–90 days, 91–180 days, >180 days overdue).',
      'Intercompany receivables are excluded.',
      'A lower value is considered favourable.',
    ],
  },

  slow_moving_obsolete_stock: {
    title: 'Slow Moving & Obsolete Stock',
    definition:
      'The value of inventory items that have not moved (no sales or consumption) for a defined period or which have been designated as obsolete.',
    formula:
      'Slow Moving & Obsolete Stock = Value of inventory with no movement for ≥ 180 days + Value of items classified as obsolete',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Inventory Overview Module',
    notes: [
      'The 180-day no-movement threshold is used to classify stock as slow-moving.',
      'Obsolete classification is based on management designation.',
      'This metric highlights capital locked in non-productive inventory.',
      'A lower value is considered favourable.',
    ],
  },

  cash_collection: {
    title: 'Cash Collection',
    definition:
      'The total cash collected from customers during the selected period, calculated using a receivables movement approach.',
    formula:
      'Cash Collection = Opening Trade Receivables + Revenue Billed (PTD) − Closing Trade Receivables',
    calculationBasis: 'PTD or YTD (Receivables-movement-based; NOT direct bank receipts)',
    source: 'Receivables Report Module',
    notes: [
      'IMPORTANT: Cash Collection is calculated from the movement in trade receivables, not from direct bank receipt records.',
      'Formula derivation: Collections = Opening AR + New Billings − Closing AR.',
      'This approach captures net cash collected regardless of the payment channel.',
      'Excludes non-trade receipts (advances, intercompany settlements, etc.).',
    ],
  },

  collection_efficiency: {
    title: 'Collection Efficiency',
    definition:
      'Measures how effectively the company is collecting amounts due from customers relative to the amount it was supposed to collect in the period.',
    formula:
      'PTD: Collection Efficiency (%) = (Cash Collection PTD / Revenue Billed PTD) × 100\nYTD: Collection Efficiency (%) = (Cash Collection YTD / Revenue Billed YTD) × 100',
    calculationBasis:
      'PTD uses Period-to-Date billings; YTD uses Year-to-Date billings as the denominator',
    source: 'Receivables Report Module',
    notes: [
      'IMPORTANT: PTD and YTD formulas use different denominators matching their respective period billings.',
      'A value above 100% indicates over-collection (e.g., collection of prior-period outstanding).',
      'A value below 100% indicates under-collection relative to the period\'s billings.',
      'Target is typically ≥ 90% to maintain healthy working capital.',
    ],
  },

  dso_days: {
    title: 'DSO (Days Sales Outstanding)',
    definition:
      'Measures the average number of days it takes to collect payment from customers after a sale is made.',
    formula:
      'DSO (Days) = (Closing Trade Receivables / Revenue Billed in Period) × Number of Days in Period',
    calculationBasis: 'PTD-Based (uses closing trade receivables and period billings)',
    source: 'Receivables Report / Working Capital Module',
    notes: [
      'A lower DSO is favourable, indicating faster customer payment collection.',
      'DSO is sensitive to period length — PTD and YTD values will differ.',
      'Intercompany receivables are excluded from both the numerator and denominator.',
      'DSO is a component of the CCC (Cash Conversion Cycle) calculation.',
    ],
  },

  dio_days: {
    title: 'DIO (Days Inventory Outstanding)',
    definition:
      'Measures the average number of days the company holds inventory before it is sold or consumed.',
    formula:
      'DIO (Days) = (Closing Inventory / Cost of Material in Period) × Number of Days in Period',
    calculationBasis: 'PTD-Based (uses closing inventory balance and period cost of material)',
    source: 'Inventory Overview / Working Capital Module',
    notes: [
      'A lower DIO is favourable, indicating faster inventory turnover.',
      'DIO is calculated using Cost of Material (direct cost), not Cost of Goods Sold (COGS), where applicable.',
      'Obsolete and slow-moving stock is included in the closing inventory balance used in this calculation.',
      'DIO is a component of the CCC (Cash Conversion Cycle) calculation.',
    ],
  },

  dpo_days: {
    title: 'DPO (Days Payable Outstanding)',
    definition:
      'Measures the average number of days the company takes to pay its trade suppliers.',
    formula:
      'DPO (Days) = (Closing Trade Payables / Cost of Material in Period) × Number of Days in Period',
    calculationBasis: 'PTD-Based (uses closing trade payables and period cost of material)',
    source: 'Payables Report / Working Capital Module',
    notes: [
      'A higher DPO is generally favourable as it indicates the company is retaining cash longer.',
      'However, excessively high DPO may indicate delayed payments and potential supplier relationship risk.',
      'DPO is calculated using Cost of Material as the denominator.',
      'DPO is a component of the CCC (Cash Conversion Cycle) calculation.',
    ],
  },

  cash_conversion_cycle_days: {
    title: 'CCC (Cash Conversion Cycle)',
    definition:
      'Measures the total number of days it takes to convert investments in inventory and other resources into cash flows from sales.',
    formula: 'CCC (Days) = DSO + DIO − DPO',
    calculationBasis: 'Derived from PTD-Based DSO, DIO and DPO values',
    source: 'Working Capital Module (Composite of DSO, DIO, DPO)',
    notes: [
      'CCC is NOT independently calculated — it is derived directly from the DSO, DIO and DPO values computed for the same period.',
      'A lower CCC (or negative CCC) is favourable, indicating faster cash recovery from operations.',
      'A rising CCC may indicate deteriorating receivables collection, slow inventory movement, or reduced payables period.',
      'All three components (DSO, DIO, DPO) must use the same period basis for the CCC to be meaningful.',
    ],
  },

  // ─────────────────────────────────────────────
  // GROUP C – FINANCIAL POSITION
  // ─────────────────────────────────────────────

  net_working_capital: {
    title: 'Net Working Capital',
    definition:
      'The difference between total current assets and total current liabilities. Represents the company\'s short-term liquidity buffer.',
    formula: 'Net Working Capital = Total Current Assets − Total Current Liabilities',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Financial Position (Balance Sheet) Module',
    notes: [
      'A positive Net Working Capital indicates the company can cover its short-term obligations with current assets.',
      'A negative Net Working Capital indicates a potential short-term liquidity risk.',
      'This is distinct from Trade Working Capital, which only includes trade receivables, inventory and trade payables.',
    ],
  },

  current_ratio: {
    title: 'Current Ratio',
    definition:
      'A liquidity ratio that measures the company\'s ability to pay its short-term obligations using its current assets.',
    formula: 'Current Ratio = Total Current Assets ÷ Total Current Liabilities',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Financial Position (Balance Sheet) Module',
    notes: [
      'A Current Ratio above 1.0x indicates the company has more current assets than current liabilities.',
      'A ratio below 1.0x may indicate short-term liquidity risk.',
      'Industry benchmarks typically consider a Current Ratio of 1.5x–2.0x as healthy.',
      'Presented as a ratio (e.g., 1.8x); higher is generally better.',
    ],
  },

  tangible_net_worth_ratio: {
    title: 'TNW Ratio (Tangible Net Worth Ratio)',
    definition:
      'Measures the ratio of total borrowings to the company\'s Tangible Net Worth (equity adjusted for intangible assets and certain deductions).',
    formula:
      'TNW Ratio = Total Borrowings ÷ Tangible Net Worth\n\nTangible Net Worth = Total Equity − Intangible Assets − Goodwill − Deferred Tax Assets',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Financial Position (Balance Sheet) Module',
    notes: [
      'IMPORTANT: Tangible Net Worth uses its own adjusted definition — it deducts intangible assets, goodwill and deferred tax assets from total equity.',
      'A lower TNW Ratio is preferred by lenders; it indicates lower leverage relative to tangible assets.',
      'This ratio is a key banking covenant metric for FJ Group.',
      'Total Borrowings includes both short-term and long-term bank borrowings.',
    ],
  },

  total_short_term_borrowing: {
    title: 'Total Short Term Borrowing from Banks',
    definition:
      'The total outstanding balance of short-term bank borrowings (loans, facilities and credit lines) due within 12 months.',
    formula:
      'Total Short Term Borrowing = Sum of all bank credit facilities and short-term loans with maturity ≤ 12 months',
    calculationBasis: 'Closing Balance (as at the last day of the selected period)',
    source: 'Financial Position (Balance Sheet) Module',
    notes: [
      'Includes overdrafts, revolving credit facilities and term loans with remaining maturity ≤ 12 months.',
      'Excludes trade credit (trade payables) and intercompany borrowings.',
      'Long-term bank borrowings (maturity > 12 months) are excluded from this metric.',
      'A lower value relative to prior periods indicates reduced short-term leverage.',
    ],
  },

  // ─────────────────────────────────────────────
  // GROUP D – INVESTMENT RETURNS
  // ─────────────────────────────────────────────

  roi: {
    title: 'ROI % (Return on Investment)',
    definition:
      'Measures the return generated on the total capital invested in the business, expressed as a percentage of total assets.',
    formula: 'ROI (%) = (YTD Net Profit ÷ Total Assets) × 100',
    calculationBasis:
      'YTD-Based — always uses YTD Net Profit (not annualised) over Closing Total Assets',
    source: 'P&L Analytics + Financial Position (Balance Sheet) Module',
    notes: [
      'IMPORTANT: ROI always uses YTD Net Profit. It is NOT annualised regardless of the reporting period selected.',
      'Total Assets is taken as the closing balance at the period-end date.',
      'A higher ROI % indicates more efficient use of the total asset base to generate profit.',
      'This is a composite metric combining P&L and Balance Sheet data.',
      'ROI will typically be lower in early months of the year and build up as YTD profit accumulates.',
    ],
  },
};

/**
 * Helper: retrieve tooltip data by KPI key.
 * Returns null if no tooltip definition exists for the key.
 * @param {string} key - KPI config key (e.g. 'total_revenue', 'dso_days')
 * @returns {object|null}
 */
export function getKpiTooltip(key) {
  return KPI_TOOLTIP_DATA[key] || null;
}
