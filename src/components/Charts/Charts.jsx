
import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, LabelList, ComposedChart, ReferenceLine,
} from 'recharts';
import { Clock3, PackageOpen, CircleDollarSign, RefreshCw, CircleCheck, } from "lucide-react";

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

/*    Working Capital trend Card Chart    */
export function WorkingCapitalTrendCard({
  data,
  title,
  chartTitle = "Net Working Capital",
  ratioTitle = "Working Capital Ratio",
  currency = "AED",
}) {
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

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: -5,
              right: 10,
              left: -12,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#EEF2F7"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
            />

            {/* Left Axis */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAmount}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
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
              domain={[0, 2]}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 800,
              }}
              label={{
                value: "",
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

            <Tooltip
              formatter={(value, name) => {
                if (name === chartTitle) {
                  return [`AED ${formatAmount(value)}`, name];
                }

                return [value, name];
              }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                fontSize: 11,
              }}
            />

            <Legend
              verticalAlign="top"
              align="center"
              iconSize={8}
              wrapperStyle={{
                fontSize: 10,
                paddingBottom: 12,
              }}
            />

            {/* Blue Bar */}
            <Bar
              yAxisId="left"
              dataKey="nwc"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              barSize={20}
              name={chartTitle}
            >
              <LabelList
                dataKey="nwc"
                position="top"
                formatter={(value) => `AED ${formatAmount(value)}`}
                style={{
                  fontSize: 9,
                  fill: "#0F172A",
                  fontWeight: 600,
                }}
              />
            </Bar>

            {/* Green Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ratio"
              stroke="#10B981"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#10B981",
              }}
              activeDot={{
                r: 4,
              }}
              name={ratioTitle}
            >
              <LabelList
                dataKey="ratio"
                position="top"
                formatter={(value) => value.toFixed(2)}
                style={{
                  fontSize: 9,
                  fill: "#10B981",
                  fontWeight: 600,
                }}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/*    Working Capital Components(AED)  */
/* =========================================================
   CUSTOM WATERFALL BAR
   ========================================================= */

const WaterfallBar = (props) => {
  const {
    x,
    y,
    width,
    height,
    payload,
    index,
  } = props;

  if (!payload) {
    return null;
  }

  return (
    <g>
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color}
        rx={1}
        ry={1}
      />

      {/* -------------------------------------------------
          Connector: Current Assets → Current Liabilities
          ------------------------------------------------- */}
      {index === 0 && (
        <line
          x1={x + width}
          y1={y}
          x2={x + width + 25}
          y2={y}
          stroke="#C7CEDB"
          strokeWidth={1}
        />
      )}

      {/* -------------------------------------------------
          Connector: Current Liabilities → Net Working Capital
          ------------------------------------------------- */}
      {index === 1 && (
        <line
          x1={x + width}
          y1={y + height}
          x2={x + width + 25}
          y2={y + height}
          stroke="#C7CEDB"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export function WorkingCapitalComponents({
  title = "Working Capital Components (AED)",
  data = workingCapitalComponents,
  currency = "AED",
}) {
  /* -------------------------------------------------------
     Format amount
     ------------------------------------------------------- */

  const formatAmount = (value) => {
    const num = Number(value || 0);

    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* -------------------------------------------------------
     Tooltip
     ------------------------------------------------------- */

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const item = payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "7px 10px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            color: "#081B46",
            fontSize: "11px",
            fontWeight: 700,
            marginBottom: "3px",
          }}
        >
          {item.name}
        </div>

        <div
          style={{
            color: "#475569",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {currency} {formatAmount(item.originalAmount)}
        </div>
      </div>
    );
  };

  return (
    <div
      className="
        card
        flex
        flex-col
        h-80
        w-full
        min-w-0
        overflow-hidden
      "
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <h3
        className="
          text-[14px]
          font-bold
          text-[#081B46]
          mb-3
          shrink-0
        "
      >
        {title}
      </h3>

      {/* =================================================
          CHART
          ================================================= */}

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 30,
              right: 15,
              left: -10,
              bottom: 5,
            }}
          >
            {/* =================================================
                GRID
                ================================================= */}

            <CartesianGrid
              stroke="#EEF2F7"
              strokeWidth={1}
              vertical={false}
            />

            {/* =================================================
                X AXIS
                ================================================= */}

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              height={30}
              tick={{
                fontSize: 9,
                fill: "#334155",
                fontWeight: 600,
              }}
            />

            {/* =================================================
                Y AXIS
                ================================================= */}

            <YAxis
              domain={[0, 1400]}
              ticks={[0, 400, 800, 1200, 1400]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) {
                  return "0";
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(2)}K`;
                }
                return value;
              }}
              tick={{
                fontSize: 10,
                fill: "#64748B",
                fontWeight: 800,
              }}
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

            {/* =================================================
                TOOLTIP
                ================================================= */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(226, 232, 240, 0.18)",
              }}
            />
            {/* =================================================
                ZERO BASELINE
                ================================================= */}
            <ReferenceLine
              y={0}
              stroke="#CBD5E1"
              strokeWidth={1}
            />

            {/* =================================================
                INVISIBLE OFFSET BAR

                This creates the waterfall positioning.

                Current Assets:
                  offset = 0

                Current Liabilities:
                  offset = 186.45

                Net Working Capital:
                  offset = 0
                ================================================= */}

            <Bar
              dataKey="offset"
              stackId="waterfall"
              fill="transparent"
              stroke="transparent"
              barSize={58}
              isAnimationActive={false}
            />

            {/* =================================================
                ACTUAL WATERFALL BAR
                ================================================= */}

            <Bar
              dataKey="amount"
              stackId="waterfall"
              barSize={58}
              shape={<WaterfallBar />}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`waterfall-cell-${index}`}
                  fill={entry.color}
                />
              ))}

              {/* =================================================
                  VALUE LABEL
                  ================================================= */}

              <LabelList
                dataKey="displayValue"
                position="top"
                offset={8}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CurrentAssetsVsLiabilities({
  title = "Current Assets vs Current Liabilities (AED)",
  data = currentAssetsVsLiabilitiesData,
  currency = "AED",
}) {
  const formatAmount = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "8px 10px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#081B46",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        {payload.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              fontSize: "10px",
              marginBottom: "3px",
            }}
          >
            <span style={{ color: "#64748B" }}>
              {item.name}
            </span>

            <span
              style={{
                color: "#1E293B",
                fontWeight: 700,
              }}
            >
              {currency} {formatAmount(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card flex flex-col h-80 w-full min-w-0 overflow-hidden">

      {/* Header */}
      <h3
        className="
          text-[14px]
          font-bold
          text-[#081B46]
          mb-2
          shrink-0
        "
      >
        {title}
      </h3>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 35,
              right: 15,
              left: -10,
              bottom: 5,
            }}
            barGap={6}
            barCategoryGap="28%"
          >
            {/* Grid */}
            <CartesianGrid
              stroke="#EEF2F7"
              strokeWidth={1}
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{
                fontSize: 9,
                fill: "#334155",
                fontWeight: 600,
              }}
            />

            {/* Y Axis */}
            <YAxis
              domain={[0, 1600]}
              ticks={[0, 300, 600, 900, 1200, 1500]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) {
                  return "0";
                }

                if (value >= 1000) {
                  return `${(value / 1000).toFixed(2)}K`;
                }

                return value;
              }}
              tick={{
                fontSize: 9,
                fill: "#64748B",
                fontWeight: 600,
              }}
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

            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(226, 232, 240, 0.2)",
              }}
            />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="center"
              height={28}
              iconType="square"
              iconSize={8}
              wrapperStyle={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#475569",
              }}
            />

            {/* =================================================
                31 MAR 2024 - BLUE
                ================================================= */}

            <Bar
              dataKey="31 Mar 2024"
              fill="#2962FF"
              barSize={32}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="31 Mar 2024"
                position="top"
                offset={6}
                formatter={(value) => formatAmount(value)}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>

            {/* =================================================
                30 APR 2024 - GREEN
                ================================================= */}

            <Bar
              dataKey="30 Apr 2024"
              fill="#16A765"
              barSize={32}
              radius={[1, 1, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="30 Apr 2024"
                position="top"
                offset={6}
                formatter={(value) => formatAmount(value)}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  fill: "#334155",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ICONS = {
  clock: Clock3,
  inventory: PackageOpen,
  payment: CircleDollarSign,
  cycle: RefreshCw,
};

export function CashConversionCycle({
  title = "Cash Conversion Cycle (Days)",
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* =========================================
                TITLE
            ========================================= */}
      <div
        style={{
          fontSize: "11px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#07247b",
          marginBottom: "6px",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      {/* =========================================
                CARDS
            ========================================= */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          height: "calc(100% - 21px)",
          minWidth: 0,
        }}
      >
        {data.map((item, index) => {
          const Icon = ICONS[item.icon];

          return (
            <React.Fragment key={item.key}>
              {/* CARD */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  background: item.cardBg,
                  border: "1px solid #edf1f5",
                  borderRadius: "8px",
                  padding: "5px 3px",
                  boxSizing: "border-box",

                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: item.iconBg,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    marginBottom: "3px",
                  }}
                >
                  {Icon && (
                    <Icon
                      size={15}
                      strokeWidth={2}
                      color={item.iconColor}
                    />
                  )}
                </div>

                {/* LABEL */}
                <div
                  style={{
                    fontSize: "8px",
                    lineHeight: "10px",
                    color: "#334155",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </div>

                {/* VALUE */}
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: "17px",
                    color: "#111827",
                    fontWeight: 700,
                    marginTop: "3px",
                  }}
                >
                  {item.value}
                </div>

                {/* VARIANCE */}
                <div
                  style={{
                    fontSize: "7px",
                    lineHeight: "9px",
                    fontWeight: 500,
                    color:
                      item.direction === "down"
                        ? "#ef4444"
                        : "#159447",
                    marginTop: "3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "6px",
                      marginRight: "2px",
                    }}
                  >
                    {item.direction === "down"
                      ? "▼"
                      : "▲"}
                  </span>

                  {item.variance} vs 31 Mar 2024
                </div>
              </div>

              {/* =========================================
                                OPERATOR
                            ========================================= */}
              {index < data.length - 1 && (
                <div
                  style={{
                    width: "13px",
                    flexShrink: 0,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    color: "#07247b",
                    fontSize: "13px",
                    lineHeight: "13px",
                    fontWeight: 700,
                  }}
                >
                  {index === 0 && "−"}
                  {index === 1 && "+"}
                  {index === 2 && "="}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}


export function CashConversionTrend({
  title,
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px 5px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          fontSize: "11px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#07247b",
          marginBottom: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      {/* DAYS LABEL */}
      <div
        style={{
          fontSize: "9px",
          lineHeight: "10px",
          color: "#334155",
          fontWeight: 700,
        }}
      >
        Days
      </div>

      {/* CHART */}
      <div
        style={{
          width: "100%",
          height: "calc(100% - 27px)",
        }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={data}
            margin={{
              top: 12,
              right: 8,
              left: -12,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#eef2f6"
              strokeDasharray="3 3"
            />

            {/* MONTH LABELS */}
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 8,
                fill: "#475569",
                fontWeight: 600,
              }}
              axisLine={{
                stroke: "#e5e7eb",
              }}
              tickLine={false}
            />

            {/* Y AXIS VALUES */}
            <YAxis
              domain={[0, 60]}
              ticks={[0, 10, 20, 30, 40, 50, 60]}
              tick={{
                fontSize: 8, fontWeight:700,
                fill: "#64748b",
              }}
              axisLine={false}
              tickLine={false}
            />
            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                fontSize: "9px",
                borderRadius: "5px",
                border: "1px solid #e5e7eb",
                padding: "4px 6px",
              }}
            />

            {/* BLUE LINE */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "#2563eb",
                strokeWidth: 0,
              }}
              activeDot={{
                r: 4,
              }}
            >
              {/* VALUE ABOVE EACH DOT */}
              <LabelList
                dataKey="value"
                position="top"
                offset={5}
                style={{
                  fontSize: "8px",
                  fontWeight: 600,
                  fill: "#334155",
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WorkingCapitalInsights({
  title = "Insights",
  data = [],
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "7px 9px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          fontSize: "11px",
          lineHeight: "15px",
          fontWeight: 700,
          color: "#07247b",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      {/* INSIGHTS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "5px",
            }}
          >
            {/* CHECK */}
            <CircleCheck
              size={14}
              strokeWidth={2}
              color="#16a34a"
              fill="#e4f7eb"
              style={{
                flexShrink: 0,
                marginTop: "1px",
              }}
            />

            {/* TEXT */}
            <div
              style={{
                fontSize: "9px",
                lineHeight: "11px",
                color: "#374151",
                fontWeight: 400,
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}