import React from "react";

import Filters from "../components/Filters/Filters";

import {
  AgingSummaryCard,
  OverDueSummaryCard,
  PayablesTrendCard,
  ParentDivisionCard,
} from "../components/Charts/Charts";

import {
  TopVendorsTable,
  BusinessUnitTable,
} from "../components/Tables/Tables";

import DetailedViewTable from "../components/Tables/DetailedViewTable";

import KPICards from "../components/Cards/KPICards";

import { kpiData } from "../data/kpiData";

import {
  agingData,
  trendData,
  divisionData,
  topVendors,
  overdueData,
  businessUnitData,
  detailedViewData,
} from "../data/dashboardData";


export default function PayablesDashboard() {
  return (

    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            Payables Dashboard
          </h1>
          <p className="page-header-subtitle">
            Vendor liabilities, ageing analysis and payment insights
          </p>
        </div>

      </div>

      {/* Main Content */}

      <div className="flex flex-col gap-2">

        {/* Filters */}
        <Filters />


        {/* KPI Cards */}

        <KPICards
          data={kpiData}
        />

        {/* Charts Row 1 */}

        <div className="grid-cols-3">
          <AgingSummaryCard
            title="Payables Aging Summary (₹ Cr)"
            data={agingData}
            total="58.75"
          />
          <PayablesTrendCard
            title="Payables Trend"
            data={trendData}
          />
          <ParentDivisionCard
            title="Payables by Parent Division (₹ Cr)"
            data={divisionData}
          />

        </div>

        {/* Charts Row 2 */}

        <div className="grid-cols-3">

          <TopVendorsTable
            title="Top 10 Vendors by Payables (₹ Cr)"
            data={topVendors}
          />

          <OverDueSummaryCard
            title="Overdue Summary (₹ Cr)"
            data={overdueData}
            total="9.60"
          />

          <BusinessUnitTable
            title="Payables by Business Unit (₹ Cr)"
            data={businessUnitData}
          />

        </div>


        {/* Detailed Table */}
        <DetailedViewTable
          title="Payables Detailed View"
          data={detailedViewData}
        />
      </div>

      {/* Footer */}

      <footer
        className="fixed bottom-0 left-58 right-2 h-6 bg-white border-t border-gray-20 px-3 flex items-cente 
        justify-between text-[10px] text-gray-400 z-50">
        <span>
          All values are in INR (₹ Cr) | Data as on 30 Apr 2024
        </span>

        <span>
          Source: Oracle Fusion Cloud
        </span>

      </footer>
    </div>

  );
}