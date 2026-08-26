import {
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Database,
  CircleCheckBig,
  Settings2,
  RefreshCcwDot,
} from "lucide-react";

import { recentActivity } from "../../data/adminDashboardData";

const iconStyles = {
  UserPlus: {
    bg: "bg-blue-100",
    color: "text-blue-600",
  },

  ShieldCheck: {
    bg: "bg-green-100",
    color: "text-green-600",
  },

  Database: {
    bg: "bg-violet-100",
    color: "text-violet-600",
  },

  CircleCheckBig: {
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },

  Settings2: {
    bg: "bg-orange-100",
    color: "text-orange-600",
  },

  RefreshCcwDot: {
    bg: "bg-cyan-100",
    color: "text-cyan-600",
  },
};

export default function RecentActivity() {
  return (
   <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">

        <h3 className="text-[13px] font-bold text-gray-900">
          Recent Activity
        </h3>

        <button className="text-[10px] font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>

      </div>

      {/* Activities */}

      <div>

        {recentActivity.map((item, index) => {

          const Icon = item.icon;

          const style =
            iconStyles[Icon?.displayName] ||
            iconStyles[Icon?.name] || {
              bg: "bg-blue-100",
              color: "text-blue-600",
            };

          return (

            <div
              key={index}
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-4
                py-1
                last:border-0
                hover:bg-gray-50
              "
            >

              <div className="flex items-center gap-2.5">

                <div
                  className={`
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    ${style.bg}
                  `}
                >

                  <Icon
                    className={`${style.color} h-4 w-4`}
                    strokeWidth={2.3}
                  />

                </div>

                <div>

                  <p className="text-[10px] font-bold text-gray-800 leading-4">
                    {item.title}
                  </p>

                  <p className="text-[9px] text-gray-600 leading-4">
                    {item.subtitle}
                  </p>

                </div>

              </div>

              <span className="text-[9px] text-gray-400 whitespace-nowrap">
                {item.time}
              </span>

            </div>

          );
        })}

      </div>
    </div>
  );
}