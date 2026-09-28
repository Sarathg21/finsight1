import { motion } from "framer-motion";

const colors = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
  },
  orange: {
    bg: "bg-orange-50",
    icon: "text-orange-500",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
  },
  cyan: {
    bg: "bg-cyan-50",
    icon: "text-cyan-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    icon: "text-yellow-500",
  },
  pink: {
    bg: "bg-pink-50",
    icon: "text-pink-500",
  },
};

export default function DashboardKPICard({
  title,
  value,
  trend,
  trendType = "up",
  icon: Icon,
  color = "blue",
}) {
  const c = colors[color] || colors.blue;

  const trendColor =
    trendType === "up"
      ? "text-green-600"
      : trendType === "down"
      ? "text-red-500"
      : "text-gray-500";

  const arrow =
    trendType === "up"
      ? "↑"
      : trendType === "down"
      ? "↓"
      : "—";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="
        relative
        h-21
        w-full
        rounded-lg
        border
        border-gray-200
        bg-white
        px-2.5
        py-1.5
        shadow-sm
        transition-all
        duration-300
        hover:shadow-md
      "
    >
      <div className="flex h-full items-start justify-between gap-2">

        {/* Left */}
        <div className="flex min-w-0 flex-1 flex-col">

          <p className="truncate text-[11px] font-bold leading-none text-gray-700">
            {title}
          </p>

          <h2 className="mt-1.5 text-[26px] font-extrabold leading-none tracking-tight text-gray-900">
            {value}
          </h2>

          <div
            className={`mt-1.5 flex items-center gap-1 text-[10px] font-semibold ${trendColor}`}
          >
            <span>{arrow}</span>
            <span>{trend}</span>
          </div>

        </div>

        {/* Icon */}
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            ${c.bg}
          `}
        >
          {Icon && (
            <Icon
              className={`h-5 w-5 ${c.icon}`}
              strokeWidth={2.2}
            />
          )}
        </div>

      </div>
    </motion.div>
  );
}