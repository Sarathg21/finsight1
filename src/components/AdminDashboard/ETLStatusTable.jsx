import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { etlStatus } from "../../data/adminDashboardData";

export default function ETLStatusTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <h3 className="text-[13px] font-bold text-gray-900">
          ETL Status
          <span className="ml-1 text-[11px] font-medium text-black">
            (Today)
          </span>
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Head */}
          <thead className="bg-gray-50">
            <tr className="h-7 border-b border-gray-200">

              <th className="w-[34%] px-3 py-1 text-left text-[10px] font-bold text-gray-700">
                Module
              </th>

              <th className="w-[10%] px-1 py-1 text-center text-[10px] font-bold text-green-600">
                Success
              </th>

              <th className="w-[10%] px-1 py-1 text-center text-[10px] font-bold text-blue-600">
                Running
              </th>

              <th className="w-[10%] px-1 py-1 text-center text-[10px] font-bold text-amber-500">
                Warning
              </th>

              <th className="w-[10%] px-1 py-1 text-center text-[10px] font-bold text-red-600">
                Failed
              </th>

              <th className="w-[18%] px-1 py-1 text-center text-[10px] font-bold text-gray-700">
                Last Run
              </th>

              <th className="w-[8%]"></th>

            </tr>
          </thead>

          {/* Body */}
          <tbody>

            {etlStatus.map((row) => (

              <tr
                key={row.module}
                className="h-6 border-b border-gray-100 hover:bg-blue-50/30 transition-colors last:border-0"
              >

                <td className="px-3 py-1 text-[10px] font-semibold text-gray-800">
                  {row.module}
                </td>

                <td className="px-1 py-1 text-center text-[10px] font-bold text-green-600">
                  {row.success}
                </td>

                <td className="px-1 py-1 text-center text-[10px] font-bold text-blue-600">
                  {row.running}
                </td>

                <td
                  className={`px-1 py-1 text-center text-[10px] font-bold ${
                    row.warning > 0
                      ? "text-amber-500"
                      : "text-gray-400"
                  }`}
                >
                  {row.warning}
                </td>

                <td
                  className={`px-1 py-1 text-center text-[10px] font-bold ${
                    row.failed > 0
                      ? "text-red-600"
                      : "text-gray-400"
                  }`}
                >
                  {row.failed}
                </td>

                <td className="px-1 py-1 text-center whitespace-nowrap text-[9px] font-medium text-gray-500">
                  {row.lastRun}
                </td>

                <td className="px-1 py-1 text-center">

                  {row.status === "ok" && (
                    <CheckCircle2
                      className="mx-auto h-3.5 w-3.5 text-green-600"
                      strokeWidth={2.2}
                    />
                  )}

                  {row.status === "warning" && (
                    <AlertTriangle
                      className="mx-auto h-3.5 w-3.5 text-amber-500"
                      strokeWidth={2.2}
                    />
                  )}

                  {row.status === "failed" && (
                    <XCircle
                      className="mx-auto h-3.5 w-3.5 text-red-600"
                      strokeWidth={2.2}
                    />
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-gray-200 px-3 py-1.5">

        <button
          type="button"
          className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700"
        >
          View All ETL Monitor

          <ArrowRight
            className="h-3 w-3"
            strokeWidth={2.3}
          />

        </button>

      </div>

    </div>
  );
}