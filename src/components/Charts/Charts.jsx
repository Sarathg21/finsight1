
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LabelList,
} from 'recharts';

export function AgingSummaryCard({ title, data, legendData = [], total, date, showSummaryHeader = false, }) {
  const formatAmount = (value) => {
    const amount = Number(value);

    if (amount >= 1_000_000) {
      return `AED ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `AED ${(amount / 1_000).toFixed(2)}K`;
    }

    return `AED ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  return (
    <div className="card flex flex-col h-80 w-full min-w-0">

      <h3 className="text-[14px] font-bold text-[#081B46] tracking-tight mb-2 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[9px] text-gray-400 font-medium">
          {date}
        </span>
      </h3>

      {showSummaryHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "130px",
            marginLeft: "auto",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              width: "40px",
              textAlign: "right",
              fontSize: "10px",
              fontWeight: "700",
              color: "#64748B",
            }}
          >
            %
          </span>

          <span
            style={{
              width: "90px",
              textAlign: "right",
              fontSize: "10px",
              fontWeight: "700",
              color: "#64748B",
            }}
          >
            Amount
          </span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-between gap-1">

        {/* PIE */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={1}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `₹ ${Number(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  props.payload.name,
                  props.payload.percentage,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  fontSize: "11px",
                }}
              />

            </PieChart>

          </ResponsiveContainer>

          <div className="absolute text-center" style={{ pointerEvents: "none" }}>
            <p className="text-[13px] font-extrabold text-gray-900 leading-none">
              AED {(Number(total || 0) / 1_000_000).toFixed(2)}M
            </p>


            <span className="text-[8px] font-extrabold text-gray-600 uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>


        {/* LEGEND */}
        <div className="w-1/2 flex flex-col justify-center gap-2">

          {legendData.map((item, idx) => (
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

              {showSummaryHeader ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "130px",
                    marginLeft: "auto",
                  }}
                >
                  <span
                    style={{
                      width: "40px",
                      textAlign: "right",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {item.percentage}%
                  </span>

                  <span
                    style={{
                      width: "90px",
                      textAlign: "right",
                      fontSize: "10px",
                      fontWeight: "600",
                    }}
                  >
                    {formatAmount(item.value)}
                  </span>
                </div>
              ) : (
                <span className="text-gray-900 font-semibold text-[10px]">
                  {item.percentage}% ({formatAmount(item.value)})
                </span>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export function OverDueSummaryCard({ title, data, total, Centerlabel }) {

  const formatAmount = (value) => {
    const amount = Number(value);

    if (amount >= 1_000_000) {
      return `AED ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `AED ${(amount / 1_000).toFixed(2)}K`;
    }

    return `AED ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  return (
    <div className="card flex flex-col ">

      <h3 className="text-[14px] font-bold text-[#081B46] tracking-tight mb-2 flex items-center justify-between">
        <span>{title}</span>
      </h3>

      <div className="flex-1 flex items-center justify-between gap-1">

        {/* PIE */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={1}
                dataKey="value"
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name, props) => [
                  `₹ ${Number(value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  props.payload.name,
                  props.payload.percentage,
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute text-center">
            <p className="text-[13px] font-extrabold text-gray-900 leading-none">
              AED {(Number(total || 0) / 1_000_000).toFixed(2)}M
            </p>

            <span className="text-[8px] font-extrabold text-gray-600 uppercase tracking-wider">
              {Centerlabel}
            </span>
          </div>
        </div>


        {/* LEGEND */}
        <div className="w-1/2 flex flex-col justify-center gap-3">

          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-[10px] font-medium py-1"
            >

              <div className="flex items-center gap-2">

                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />

                <span className="text-gray-500 text-[10px] truncate max-w-20">
                  {item.name}
                </span>

              </div>
              <span className="text-gray-900 font-semibold text-[10px]">
                {item.percentage}% ({formatAmount(item.value)})
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export function PayablesTrendCard({ data, title, charttitle, daysname, currency = "AED", datakey, }) {
  const formatAmount = (value) => {
    if (value == null) return "";

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }

    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="card flex flex-col h-80 w-full min-w-0">
      {/* Header */}
      <h3 className="text-[14px] font-bold text-[#081B46] mb-3">
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
                fill: "#64748B", fontWeight: 800,
              }}
            />

            {/* Left Axis */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B", fontWeight: 800,
              }}
              tickFormatter={formatAmount}
              label={{
                value: currency,
                angle: 0,
                position: "insideTopLeft",
                dx: 10,
                dy: -18,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
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
                fill: "#64748B", fontWeight: 800,
              }}
              label={{
                value: "Days",
                angle: 0,
                position: "insideTopRight",
                dx: 0,
                dy: -20,
                style: {
                  fontSize: 9,
                  fill: "#64748B",
                  fontWeight: 900,
                },
              }}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value, name) => [
                formatAmount(value),
                name,
              ]}
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

            {/* Bar */}
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
                formatter={formatAmount}
                style={{
                  fontSize: 9,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>

            {/* Line */}
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

export function ParentDivisionCard({ data = [], title, }) {
  const formatCurrency = (value) => {
    if (value == null) return "-";

    const amount = Number(value);

    if (amount >= 1_000_000) {
      return `AED ${(amount / 1_000_000).toFixed(2)}M`;
    }

    if (amount >= 1_000) {
      return `AED ${(amount / 1_000).toFixed(2)}K`;
    }

    return `AED ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  return (
    <div className="card flex flex-col h-80 w-full min-w-0">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-[14px] font-extrabold text-[#081B46]">
          {title}(AED)
        </h3>
      </div>

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 70,
              left: 15,
              bottom: 5,
            }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              stroke="#EEF2F7"
              strokeDasharray="3 3"
              horizontal={false}
            />

            {/* X Axis */}
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#64748B", fontWeight: 800,
              }}
              tickFormatter={(value) => {
                if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
                if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                return value;
              }}
            />

            {/* Y Axis */}
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "#334155", fontWeight: 800,
              }}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(value) => [
                formatCurrency(value),
                "Outstanding",
              ]}

              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 11,
              }}
            />

            {/* Bars */}
            <Bar
              dataKey="value"
              fill="#2563EB"
              radius={[0, 6, 6, 0]}
              barSize={18}
            >
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => formatCurrency(value)}
                style={{
                  fontSize: 10,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export function InventoryValueTrend({ data, title }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-80"
      style={{ padding: "18px 20px" }}>
      <h3 className="text-[13px] font-bold text-[#081B46] mb-4" style={{ marginBottom: "18px" }}>
        {title}
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 15,
            bottom: 20,
          }}
        >
          <CartesianGrid
            stroke="#EEF2F7"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            padding={{ left: 20, right: 20 }}
            tick={{
              fontSize: 11,
              fill: "#64748B",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            dx={-8}
            tick={{
              fontSize: 11,
              fill: "#64748B",
            }}
          />
          <Tooltip />

          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{
              fontSize: 12,
              paddingBottom: 10,
            }}
          />

          <Line
            type="monotone"
            dataKey="fy2324"
            name="FY 23-24"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            type="monotone"
            dataKey="fy2425"
            name="FY 24-25"
            stroke="#16A34A"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}