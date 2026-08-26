// import React from "react";
// import KPICard from "./KPICard";
// import { kpiData } from "../data/kpiData";

// export default function KPICards() {
//   return (
//     <div
//       className="
//         grid
//         grid-cols-1
//         sm:grid-cols-2
//         lg:grid-cols-3
//         xl:grid-cols-6
//         gap-4
//       "
//     >
//       {kpiData.map((card) => (
//         <KPICard
//           key={card.id}
//           {...card}
//         />
//       ))}
//     </div>
//   );
// }
import React from "react";
import KPICard from "./KPICard";

export default function KPICards({ data }) {
  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-6
        gap-4
      "
    >
      {data.map((card) => (
        <KPICard
          key={card.id}
          {...card}
        />
      ))}
    </div>
  );
}