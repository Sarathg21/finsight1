import { motion } from "framer-motion";

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
  teal: "bg-teal-50 text-teal-600",
  red: "bg-red-50 text-red-600",
};

export default function StatCard({
  icon: Icon,
  title,
  value,
  label,
  description,
  trend,
  trendDir = "flat",
  color = "blue",
  delay = 0,
  className = "",
  onClick,
  loading = false,
  children,
  iconContainerClass = "", compact = false,
}) {
  const trendColor =
    trendDir === "up"
      ? "text-green-600"
      : trendDir === "down"
        ? "text-red-600"
        : "text-gray-400";

  const arrow =
    trendDir === "up"
      ? "↑"
      : trendDir === "down"
        ? "↓"
        : "—";

  const defaultIconClass = `flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[color] || colorMap.blue
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`
       bg-white
       rounded-lg
       border
       border-gray-200
       shadow-sm
       hover:shadow-md
       transition-all
       duration-300 
     
       ${compact
          ? "px-3 py-2 h-22.5"
          : "p-2.5 min-h-21"
        }
     
       ${onClick ? "cursor-pointer" : ""}
       ${className}
     `}
    >
      {loading ? (
        <div className="animate-pulse">
          <div className="h-8 w-8 rounded-md bg-gray-200 mb-2"></div>
          <div className="h-3 w-20 rounded bg-gray-200 mb-2"></div>
          <div className="h-5 w-14 rounded bg-gray-200"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div
                className={
                  iconContainerClass
                    ? iconContainerClass
                    : defaultIconClass
                }
              >
                <Icon className="h-7 w-7" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {label && (
                <p
                  className={
                    compact
                      ? "text-[10px] font-semibold text-gray-700"
                      : "text-[10px] font-medium uppercase tracking-wide text-black"
                  }>
                  {label}
                </p>
              )}

              <p
                className={
                  compact
                    ? "hidden"
                    : "truncate text-sm font-medium text-black"
                }>
                {title}
              </p>

              <p
                className={
                  compact
                    ? "text-xl font-bold text-gray-900 mt-1"
                    : "text-2xl font-bold text-gray-900"
                }
              >
                {value}
              </p>

              {description && (
                <p
                  className={
                    compact
                      ? "truncate text-[10px] text-gray-500"
                      : "truncate text-[11px] text-gray-500"
                  }
                >
                  {description}
                </p>
              )}

              {trend && (
                <p className={`mt-1 text-[11px] font-medium ${trendColor}`}>
                  {arrow} {trend}
                </p>
              )}
            </div>
          </div>

          {children && (
            <div className="mt-1.5 border-t border-gray-100 pt-1.5">
              {children}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}