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
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased">

      <main className="overflow-y-auto px-3 pb-3 pt-1 md:px-4 md:pb-4">

        <div className="flex flex-col gap-2">

          {/* Filters */}
          <Filters />


          {/* KPI Cards */}
          <KPICards data={kpiData} />


          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

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

      </main>


      {/* Footer */}
      <footer className="h-5 bg-white border-t border-gray-200 px-2 flex items-center justify-between text-[9px] leading-none text-gray-400">

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