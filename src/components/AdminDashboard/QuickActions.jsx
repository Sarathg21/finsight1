import { motion } from "framer-motion";
import { quickActions } from "../../data/adminDashboardData";

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  teal: "bg-teal-100 text-teal-600",
  pink: "bg-pink-100 text-pink-600",
  red: "bg-red-100 text-red-600",
};

export default function QuickActions() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

      {/* Header */}
      <div className="border-b border-gray-200 px-3 py-1.5">
        <h3 className="text-[12px] font-bold text-gray-900">
          Quick Actions
        </h3>
      </div>

      {/* Grid */}
      <div className="grid flex-1 grid-cols-3 gap-1.5 p-2">

        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
              rounded-md
              border
              border-gray-200
              bg-white
              px-1
              py-1.5
              transition-all
              duration-200
              hover:border-blue-200
              hover:bg-blue-50
              hover:shadow-sm
            "
          >

            {/* Icon */}
            <div
              className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                ${colorMap[action.color]}
              `}
            >
              <action.icon
                className="h-4 w-4"
                strokeWidth={2.3}
              />
            </div>

            {/* Label */}
            <span
              className="
                text-center
                text-[10px]
                font-bold
                leading-3
                text-gray-700
              "
            >
              {action.label}
            </span>

          </motion.button>
        ))}

      </div>

    </div>
  );
}