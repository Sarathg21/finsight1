
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend, LabelList,
} from 'recharts';

export function AgingSummaryCard({ title, data, total }) {
  return (
    <div className="card flex flex-col h-40">

      <h3 className="text-[11px] font-bold text-[#081B46] tracking-tight mb-2 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[9px] text-gray-400 font-medium">
          As on 30 Apr 2024
        </span>
      </h3>

      <div className="flex-1 flex items-center justify-between gap-1">

        {/* PIE */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={32}
                outerRadius={50}
                paddingAngle={1}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>

            </PieChart>

          </ResponsiveContainer>

          <div className="absolute text-center">
            <p className="text-[13px] font-extrabold text-gray-800 leading-none">
              ₹ {total}
            </p>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>


        {/* LEGEND */}
        <div className="w-1/2 space-y-1">

          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px] font-medium">

              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-500 text-[10px] truncate max-w-20">
                  {item.name}
                </span>
              </div>

              <span className="text-gray-900 font-semibold text-[10px]">
                {item.value.toFixed(2)} ({item.percentage})
              </span>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export function OverDueSummaryCard({ title, data, total }) {

  return (
  <div className="card flex flex-col h-52">

      <h3 className="text-[11px] font-bold text-[#081B46] tracking-tight mb-2 flex items-center justify-between">
        <span>{title}</span>
      </h3>

      <div className="flex-1 flex items-center justify-between gap-1">

        {/* PIE */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={32}
                outerRadius={50}
                paddingAngle={1}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute text-center">
            <p className="text-[13px] font-extrabold text-gray-800 leading-none">
              ₹ {total}
            </p>

            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>


        {/* LEGEND */}
        <div className="w-1/2 space-y-1">

          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-[10px] font-medium"
            >

              <div className="flex items-center gap-1.5">

                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-gray-500 text-[10px] truncate max-w-20">
                  {item.name}
                </span>

              </div>

              <span className="text-gray-900 font-semibold text-[10px]">
                {item.value.toFixed(2)} ({item.percentage})
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export function PayablesTrendCard({ data , title, charttitle,daysname}) {
  return (
   <div className="card flex flex-col h-40">

      {/* Header */}
      <h3 className="text-[11px] font-bold text-[#081B46] mb-3">
        {title}
      </h3>

      {/* Chart */}
      <div className="flex-1 pt-0">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: -5,
              right: 10,
              left: -12,
              bottom: 0,
            }}
            barCategoryGap="28%"
          >

            {/* Grid */}
            <CartesianGrid
              stroke="#EEF2F7"
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B",
              }}
            />

            {/* Left Axis */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B",
              }}
              label={{
                value: "₹ Cr",
                angle: 0,
                position: "insideTopLeft",
                dy: -12,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                },
              }}
            />

            {/* Right Axis */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B",
              }}
              label={{
                value: "Days",
                angle: 0,
                position: "insideTopRight",
                dy: -12,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                },
              }}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 11,
              }}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="center"
              iconSize={8}
              wrapperStyle={{
                fontSize: 10,
                paddingBottom: 12,
              }}
            />

            {/* Bars */}
            <Bar
              yAxisId="left"
              dataKey="payables"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              barSize={20}
              name={charttitle}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill="#2563EB"
                />
              ))}

              <LabelList
                dataKey="payables"
                position="top"
                formatter={(value) => value.toFixed(2)}
                style={{
                  fontSize: 9,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>

            {/* DPO Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dpo"
              stroke="#10B981"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#10B981",
              }}
              activeDot={{
                r: 4,
              }}
              name={daysname}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}


export function ParentDivisionCard({ data, title }) {
  return (
    <div className="parent-division-card">
      <h3 className="parent-division-title">
        {title}
      </h3>

      <div className="parent-division-list">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="parent-division-row"
          >
            {/* NAME */}
            <span className="parent-division-name">
              {item.name}
            </span>

            {/* BAR */}
            <div className="parent-division-progress">
              <div
                className="parent-division-progress-bar"
                style={{
                  width: item.percentage
                }}
              />
            </div>

            {/* VALUE */}
            <span className="parent-division-value">
              {item.value.toFixed(2)}
              <span className="parent-division-percent">
                ({item.percentage})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}