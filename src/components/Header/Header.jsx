// import React from 'react';
// import { FiDownload, FiCalendar, FiFilter, FiRefreshCw, FiBell } from 'react-icons/fi';

// export default function Header({ onMobileMenuToggle }) {
//   return (
//     <header className="bg-white border-b border-gray-200/80 px-1 py-0.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-0 z-20 shadow-xs">

//       {/* LEFT */}
//       <div>
//         <div className="flex items-center gap-2">

//           <button
//             onClick={onMobileMenuToggle}
//             className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
//           >
//             <FiFilter className="text-base" />
//           </button>

//           <h2 className="text-xl font-bold text-[#081B46] tracking-tight">
//             Payables Dashboard
//           </h2>
//         </div>

//         <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
//           Track payables, aging, overdue and payment performance
//         </p>
//       </div>

//       {/* RIGHT */}
//       <div className="flex items-center gap-2 self-end sm:self-center">

//         {/* ACTION BUTTONS */}
//         <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">

//           <button className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] rounded-md transition-all">
//             Export <FiDownload className="text-[11px]" />
//           </button>

//           <button className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-[11px] rounded-md transition-all">
//             <FiCalendar className="text-[11px]" /> Schedule
//           </button>

//           <button className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-[11px] rounded-md transition-all">
//             <FiFilter className="text-[11px]" /> Filters
//           </button>

//           <button className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-all">
//             <FiRefreshCw className="text-[11px]" />
//           </button>
//         </div>

//         {/* USER AREA */}
//         <div className="flex items-center gap-2 pl-1">

//           <div className="relative cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-all">
//             <FiBell className="text-base text-gray-600" />
//             <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white"></span>
//           </div>

//           <div className="flex items-center gap-2">

//             <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-inner">
//               AK
//             </div>

//             <div className="hidden xl:block text-right leading-tight">
//               <p className="text-[11px] font-semibold text-gray-800">
//                 Welcome, Admin
//               </p>
//               <span className="text-[9px] font-medium text-gray-400">
//                 System Admin
//               </span>
//             </div>

//           </div>
//         </div>

//       </div>
//     </header>
//   );
// }
import React from "react";
import {
  FiDownload,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiBell,
} from "react-icons/fi";

export default function Header({
  title = "Dashboard",
  subtitle = "",
  userName = "Admin",
  userRole = "System Admin",
  userInitials = "AK",
  onMobileMenuToggle,
  onExport,
  onSchedule,
  onFilter,
  onRefresh,
  showActions = true,
}) {
  return (
    <header className="bg-white border-b border-gray-200/80 px-1 py-0.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-0 z-20 shadow-xs">

      {/* LEFT */}
      <div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <FiFilter className="text-base" />
          </button>

          <h2 className="text-xl font-bold text-[#081B46] tracking-tight">
            {title}
          </h2>
        </div>

        {subtitle && (
          <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 self-end sm:self-center">

        {/* ACTION BUTTONS */}
        {showActions && (
          <div className="flex items-center gap-1.5 border-r border-gray-200 pr-2">

            <button
              onClick={onExport}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] rounded-md transition-all"
            >
              Export
              <FiDownload className="text-[11px]" />
            </button>

            <button
              onClick={onSchedule}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-[11px] rounded-md transition-all"
            >
              <FiCalendar className="text-[11px]" />
              Schedule
            </button>

            <button
              onClick={onFilter}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-[11px] rounded-md transition-all"
            >
              <FiFilter className="text-[11px]" />
              Filters
            </button>

            <button
              onClick={onRefresh}
              className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-all"
            >
              <FiRefreshCw className="text-[11px]" />
            </button>

          </div>
        )}

        {/* USER */}
        <div className="flex items-center gap-2 pl-1">

          <div className="relative cursor-pointer p-1 hover:bg-gray-100 rounded-full transition-all">
            <FiBell className="text-base text-gray-600" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-white"></span>
          </div>

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-inner">
              {userInitials}
            </div>

            <div className="hidden xl:block text-right leading-tight">
              <p className="text-[11px] font-semibold text-gray-800">
                Welcome, {userName}
              </p>

              <span className="text-[9px] font-medium text-gray-400">
                {userRole}
              </span>
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}