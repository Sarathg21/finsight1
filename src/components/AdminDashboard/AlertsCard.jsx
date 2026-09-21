import {
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { alerts } from "../../data/adminDashboardData";

const colorMap = {
  danger: "bg-red-100 text-red-600",
  warning: "bg-yellow-100 text-yellow-600",
  info: "bg-blue-100 text-blue-600",
  success: "bg-green-100 text-green-600",
};

export default function AlertsCard() {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">

      <div className="border-b border-gray-200 px-3 py-1">

        <h3 className="text-[11px] font-bold text-gray-900">
          System Alerts
        </h3>

      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-hidden">

        {alerts.map((alert, index) => (

          <div
            key={index}
            className="flex items-center gap-2 border-b border-gray-100 px-3 py-1 last:border-0 hover:bg-gray-50 transition-colors"
          >

            {/* Icon */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colorMap[alert.color]}`}
            >
              <alert.icon
                className="h-3 w-3"
                strokeWidth={2.2}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">

              <p className="truncate text-[9px] font-semibold text-gray-800 leading-3">
                {alert.title}
              </p>

              <p className="truncate text-[8px] leading-3 text-gray-500">
                {alert.desc}
              </p>

            </div>

            {/* Time */}
            <div className="flex items-center gap-0.5 whitespace-nowrap text-[8px] text-gray-400">

              {alert.time}

              <ChevronRight
                className="h-2.5 w-2.5"
                strokeWidth={2.2}
              />

            </div>

          </div>

        ))}

      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-gray-200 px-2 py-0.5">

        <button
          type="button"
          className="flex items-center gap-1 text-[8.5px] font-semibold text-blue-600 hover:text-blue-700"
        >

          View All Alerts

          <ArrowRight
            className="h-2.5 w-2.5"
            strokeWidth={2.2}
          />

        </button>

      </div>

    </div>
  );
}