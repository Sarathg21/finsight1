import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import { ArrowRight } from "lucide-react";
import { qualityData } from "../../data/adminDashboardData";

export default function QualityChart() {
  const total = qualityData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="border-b border-gray-200 px-3 py-1.5">
        <h3 className="text-[12px] font-bold text-gray-900">
          Data Quality
          <span className="ml-1 text-[9px] font-medium text-gray-500">
            (Today)
          </span>
        </h3>
      </div>

      {/* Chart */}
      <div className="flex flex-1 items-center px-2 py-1">

        {/* Pie */}
        <div className="relative w-[46%]">

          <ResponsiveContainer
            width="100%"
            height={120}
          >
            <PieChart>
              <Pie
                data={qualityData}
                dataKey="value"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={2}
                stroke="none"
              >
                {qualityData.map((item, index) => (
                  <Cell
                    key={index}
                    fill={item.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

            <p className="text-[8px] text-black">
              Total issues
            </p>

            <p className="text-[18px] font-bold leading-none text-gray-900">
              {total}
            </p>

          </div>

        </div>

        {/* Legend */}
        <div className="w-[54%] pl-2">

          <ul className="space-y-1">

            {qualityData.map((item) => (

              <li
                key={item.name}
                className="flex items-center justify-between gap-2"
              >

                <div className="flex min-w-0 items-center gap-1">

                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="truncate text-[9px] font-medium text-gray-700">
                    {item.name}
                  </span>

                </div>

                <span className="whitespace-nowrap text-[8px] text-black">
                  {item.value} ({item.percent}%)
                </span>

              </li>

            ))}

          </ul>

        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-gray-200 px-2 py-1">

        <button
          type="button"
          className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          View Data Quality

          <ArrowRight
            className="h-2.5 w-2.5"
            strokeWidth={2.2}
          />

        </button>

      </div>

    </div>
  );
}