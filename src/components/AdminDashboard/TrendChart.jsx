import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { ArrowRight } from "lucide-react";
import { trendData } from "../../data/adminDashboardData";

export default function TrendChart() {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="border-b border-gray-200 px-3 py-1">
        <h3 className="text-[12px] font-bold text-gray-900">
          ETL Trend
          <span className="ml-1 text-[9px] font-medium text-gray-500">
            (Last 7 Days)
          </span>
        </h3>
      </div>

      {/* Chart */}
      <div className="px-2 pt-1 pb-0">

        <ResponsiveContainer width="100%" height={135}>
          <LineChart
            data={trendData}
            margin={{
              top: 0,
              right: 5,
              left: -20,
              bottom: -10,
            }}
          >
            <CartesianGrid
              stroke="#EDF0F5"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#6B7280",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
              tick={{
                fontSize: 9,
                fill: "#6B7280",
              }}
            />

            <Tooltip
              contentStyle={{
                fontSize: 10,
                borderRadius: 6,
                border: "1px solid #E5E7EB",
              }}
            />

            <Legend
              verticalAlign="top"
              align="center"
              iconType="circle"
              iconSize={6}
              wrapperStyle={{
                fontSize: "8px",
                paddingTop: 0,
                paddingBottom: 0,
              }}
            />

            <Line
              type="monotone"
              dataKey="success"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 3 }}
              name="Success"
            />

            <Line
              type="monotone"
              dataKey="failed"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 3 }}
              name="Failed"
            />

            <Line
              type="monotone"
              dataKey="warning"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 3 }}
              name="Warning"
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-gray-200 px-2 py-0.5">
        <button
          type="button"
          className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 hover:text-blue-700"
        >
          View Full ETL Analytics

          <ArrowRight
            className="h-2.5 w-2.5"
            strokeWidth={2.2}
          />
        </button>
      </div>

    </div>
  );
}