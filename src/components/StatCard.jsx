

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
  iconContainerClass = "",
  compact = false,
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

  const defaultIconClass = `
    flex
    h-8
    w-8
    shrink-0
    items-center
    justify-center
    rounded-lg
    ${colorMap[color] || colorMap.blue}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
      }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`
        w-full
        min-w-0
        overflow-hidden
        box-border
        rounded-lg
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:shadow-md

        ${onClick ? "cursor-pointer" : ""}

        ${className}
      `}
      style={{
        minHeight: compact ? "84px" : "88px",
        padding: compact ? "10px 12px" : "11px 12px",
      }}
    >
      {loading ? (
        /* =====================================================
           LOADING STATE
        ===================================================== */
        <div
          className="animate-pulse"
          style={{
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            className="rounded-md bg-gray-200"
            style={{
              width: "32px",
              height: "32px",
              marginBottom: "8px",
            }}
          />

          <div
            className="rounded bg-gray-200"
            style={{
              width: "80px",
              height: "12px",
              marginBottom: "7px",
            }}
          />

          <div
            className="rounded bg-gray-200"
            style={{
              width: "56px",
              height: "20px",
            }}
          />
        </div>
      ) : (
        <>
          {/* =====================================================
              MAIN CONTENT
          ===================================================== */}

          <div
            style={{
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              display: "grid",

              /*
               * Fixed icon column + flexible content column.
               * This keeps every StatCard consistent.
               */
              gridTemplateColumns: Icon
                ? "32px minmax(0, 1fr)"
                : "minmax(0, 1fr)",

              columnGap: "10px",

              alignItems: "start",
            }}
          >
            {/* =================================================
                ICON
            ================================================= */}

            {Icon && (
              <div
                className={
                  iconContainerClass
                    ? iconContainerClass
                    : defaultIconClass
                }
                style={{
                  width: "32px",
                  height: "32px",
                  minWidth: "32px",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>
            )}

            {/* =================================================
                TEXT CONTENT
            ================================================= */}

            <div
              style={{
                width: "100%",
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* =================================================
                  LABEL
              ================================================= */}

              {label && (
                <p
                  className={
                    compact
                      ? "truncate text-[10px] font-semibold text-gray-700"
                      : "truncate text-[10px] font-medium uppercase tracking-wide text-black"
                  }
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    margin: 0,
                    lineHeight: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </p>
              )}

              {/* =================================================
                  TITLE
              ================================================= */}

              {!compact && title && (
                <p
                  className="truncate text-sm font-medium text-black"
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    margin: 0,
                    lineHeight: "18px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {title}
                </p>
              )}

              {/* =================================================
                  VALUE
              ================================================= */}

              <p
                className={
                  compact
                    ? "text-xl font-bold text-gray-900"
                    : "text-2xl font-bold text-gray-900"
                }
                style={{
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                  margin: compact
                    ? "2px 0 0 0"
                    : "1px 0 0 0",
                  lineHeight: compact
                    ? "24px"
                    : "28px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  boxSizing: "border-box",
                }}
              >
                {value}
              </p>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              {description && (
                <p
                  className={
                    compact
                      ? "truncate text-[10px] text-gray-500"
                      : "truncate text-[11px] text-gray-500"
                  }
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    margin: "1px 0 0 0",
                    lineHeight: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {description}
                </p>
              )}

              {/* =================================================
                  TREND
              ================================================= */}

              {trend && (
                <p
                  className={`text-[11px] font-medium ${trendColor}`}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    maxWidth: "100%",
                    margin: "3px 0 0 0",
                    lineHeight: "14px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {arrow} {trend}
                </p>
              )}
            </div>
          </div>

          {/* =====================================================
              CHILDREN
          ===================================================== */}

          {children && (
            <div
              className="border-t border-gray-100"
              style={{
                width: "100%",
                minWidth: 0,
                marginTop: "7px",
                paddingTop: "6px",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              {children}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}