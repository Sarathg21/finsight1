// import React from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
// } from "recharts";

// export default function Sparkline({
//   data = [],
//   color = "#2563EB",
// }) {
//   const chartData = data.map((value, index) => ({
//     index,
//     value,
//   }));

//   return (
//     <div className="w-full h-7.5">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart
//           data={chartData}
//           margin={{
//             top: 0,
//             right: 0,
//             left: 0,
//             bottom: 0,
//           }}
//         >
//           <Line
//             type="linear"
//             dataKey="value"
//             stroke={color}
//             strokeWidth={1.4}
//             dot={false}
//             activeDot={false}
//             connectNulls
//             isAnimationActive={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

export default function Sparkline({
    data = [],
    color = "#2563EB",
}) {
    const chartData = data.map((value, index) => ({
        index,
        value,
    }));

    return (
        <div className="w-full h-6">

            <ResponsiveContainer width="100%" height="100%">

                <LineChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >

                    <Line
                        type="linear"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.2}
                        dot={false}
                        activeDot={false}
                        connectNulls
                        isAnimationActive={false}
                    />

                </LineChart>

            </ResponsiveContainer>

        </div>
    );
}