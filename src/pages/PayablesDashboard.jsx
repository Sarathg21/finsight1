// import React, { useState } from 'react';
// import Sidebar from '../components/Sidebar/Sidebar';
// import Header from '../components/Header/Header';
// import Filters from '../components/Filters/Filters';
// import KPICard from '../components/Cards/KPICard';
// import { AgingSummaryCard, PayablesTrendCard, ParentDivisionCard } from '../components/Charts/Charts';
// import { TopVendorsTable, BusinessUnitTable } from '../components/Tables/Tables';
// import DetailedViewTable from '../components/Tables/DetailedViewTable';

// import {  agingData, trendData, divisionData, topVendors, overdueData, businessUnitData, detailedViewData } from '../data/dashboardData';
// import { kpiData } from "../data/kpiData"; 

// export default function PayablesDashboard() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-indigo-500 selection:text-white antialiased">
//       <Sidebar isMobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

//       {mobileMenuOpen && (
//         <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/40 z-20 md:hidden backdrop-blur-xs" />
//       )}

//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

//         <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
//           <Filters />

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
//             {kpiData.map((kpi) => (
//               <KPICard key={kpi.id} {...kpi} />
//             ))}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <AgingSummaryCard title="Payables Aging Summary (₹ Cr)" data={agingData} total="58.75" />
//             <PayablesTrendCard data={trendData} />
//             <ParentDivisionCard data={divisionData} />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//             <TopVendorsTable data={topVendors} />
//             <AgingSummaryCard title="Overdue Summary (₹ Cr)" data={overdueData} total="9.60" />
//             <BusinessUnitTable data={businessUnitData} />
//           </div>

//           <DetailedViewTable data={detailedViewData} />
//         </main>

//         <footer className="bg-white border-t border-gray-200/80 px-6 py-3 flex justify-between text-[11px] font-semibold text-gray-400">
//           <span>All values are in INR (₹ Cr) | Data as on 30 Apr 2024</span>
//           <span>Source: Oracle Fusion Cloud</span>
//         </footer>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import Filters from '../components/Filters/Filters';
import KPICard from '../components/Cards/KPICard';
import {
  AgingSummaryCard,
  OverDueSummaryCard,
  PayablesTrendCard,
  ParentDivisionCard,
} from '../components/Charts/Charts';
import {
  TopVendorsTable,
  BusinessUnitTable,
} from '../components/Tables/Tables';
import DetailedViewTable from '../components/Tables/DetailedViewTable';

import {
  agingData,
  trendData,
  divisionData,
  topVendors,
  overdueData,
  businessUnitData,
  detailedViewData,
} from '../data/dashboardData';

import { kpiData } from '../data/kpiData';
import KPICards from "../components/Cards/KPICards"

export default function PayablesDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <div className="flex flex-col min-w-0 w-full">
        <Header
          title="Payables Dashboard"
          subtitle="Track payables, aging, overdue and payment performance"
          onMobileMenuToggle={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
        />

        <main className="overflow-y-auto px-3 pb-3 pt-1 md:px-4 md:pb-4 md:pt-1">
          <div className="flex flex-col gap-1">

            <Filters />

            {/* KPI Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6  gap-1">
              {kpiData.map((kpi) => (
                <KPICard key={kpi.id} {...kpi} />
              ))}
            </div> */}
            <KPICards data={kpiData} />

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3  gap-1">
              <AgingSummaryCard
                title="Payables Aging Summary (₹ Cr)"
                data={agingData}
                total="58.75"
              />
              <PayablesTrendCard 
               title="Payables Trend"
                data={trendData} />
              <ParentDivisionCard 
              title="Payables by Parent Division (₹ Cr)"
              data={divisionData} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3  gap-1">
              <TopVendorsTable 
              title="Top 10 Vendors by Payables (₹ Cr)"
              data={topVendors} />
              <OverDueSummaryCard
                title="Overdue Summary (₹ Cr)"
                data={overdueData}
                total="9.60" />
              <BusinessUnitTable 
               title="Payables by Business Unit (₹ Cr)"
              data={businessUnitData} />
            </div>

            {/* Detailed Table */}
            <DetailedViewTable 
            title="Payables Detailed View"
            data={detailedViewData} />

          </div>
        </main>
        {/* Footer */}
        <footer className="h-5 bg-white border-t border-gray-200 px-2 flex items-center justify-between text-[9px] leading-none text-gray-400">
          <span>All values are in INR (₹ Cr) | Data as on 30 Apr 2024</span>
          <span>Source: Oracle Fusion Cloud</span>
        </footer>
      </div>
    </div>
  );
}