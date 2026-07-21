import React from "react";
import KPICard from "./KPICard";

export default function KPICards({ data }) {

  return (

    <div className="grid-cols-6">

      {data.map((card) => (

        <KPICard
          key={card.id}
          {...card}
        />

      ))}

    </div>

  );
}