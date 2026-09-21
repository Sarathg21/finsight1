// import {
//   Users,
//   Building2,
//   GitBranch,
//   Network,
//   Boxes,
//   Code2,
//   CircleDollarSign,
// } from "lucide-react";
// import { useState } from "react";


// export default function MasterDataTabs({
//   tabs,
//   activeTab,
//   onTabChange,
// }) {
//   return (
//     <div className="bg-white border-b border-gray-200">
//       <div className="flex items-center justify-between w-full">
//         {tabs.map((tab, index) => {
//           const Icon = tab.icon;

//           return (
//             <button
//               key={tab.id || index}
//               onClick={() => onTabChange(tab.id)}
//               className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors duration-200 ${
//                 activeTab === tab.id
//                   ? "text-blue-600"
//                   : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
//               }`}
//             >
//               {Icon && (
//                 <Icon
//                   className={`w-4 h-4 ${
//                     activeTab === tab.id
//                       ? "text-blue-600"
//                       : "text-gray-500"
//                   }`}
//                 />
//               )}

//               <span>{tab.title}</span>

//               {activeTab === tab.id && (
//                 <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

import {
  Users,
  Building2,
  GitBranch,
  Network,
  Boxes,
  Code2,
  CircleDollarSign,
} from "lucide-react";
import { useState } from "react";

export default function MasterDataTabs({
  tabs,
  activeTab,
  onTabChange,
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id || index}
              onClick={() => onTabChange(tab.id)}
              style={{
                position: "relative",
                flex: "1 1 0%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px 8px",
                fontSize: "13px",
                fontWeight: 500,
                lineHeight: "20px",
                color: isActive ? "#2563eb" : "#4b5563",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition:
                  "color 200ms ease, background-color 200ms ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#2563eb";
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "#4b5563";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {Icon && (
                <Icon
                  style={{
                    width: "16px",
                    height: "16px",
                    flexShrink: 0,
                    color: isActive ? "#2563eb" : "#6b7280",
                  }}
                />
              )}

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                {tab.title}
              </span>

              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#2563eb",
                    borderRadius: "9999px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}