import React from "react";
import KPICard from "./KPICard";

export default function KPICards({ data }) {

  return (

  <div className="kpi-grid-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">

      {data.map((card) => (

        <KPICard
          key={card.id}
          {...card}
        />

      ))}

    </div>

  );
}