import React from "react";
import { motion } from "framer-motion";
import Sparkline from "../Sparkline";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function KPICard({
  icon: Icon,
  title,
  value,
  trend,
  trendValue,
  comparisonText,
  titleColor = "#475569",
  iconColor = "#2563EB",
  iconBackground = "#EFF6FF",
  sparklineColor = "#2563EB",
  sparklineData = [],
  trendColor = "#16A34A",
  borderColor = "#E2E8F0",
  cardBackground = "#FFFFFF",
}) {
  const isUp = trend === "up";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -2,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="rounded-lg border shadow-sm overflow-hidden flex flex-col justify-between transition-all"
      style={{
        backgroundColor: cardBackground,
        borderColor: borderColor,
        height: "90px",
        padding: "8px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: iconBackground,
          }}
        >
          {Icon ? (
            <Icon
              size={14}
              style={{ color: iconColor }}
            />
          ) : (
            <span className="text-red-500 text-[8px]">!</span>
          )}
        </div>

        <span
          className="text-[10px] font-semibold leading-tight"
          style={{ color: titleColor }}
        >
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="leading-none">
        <h2 className="text-[16px] font-bold text-slate-900">
          {value}
        </h2>

        <div className="mt-1 flex items-center gap-1 text-[9px]">
          {isUp ? (
            <FaArrowUp
              size={6}
              style={{ color: trendColor }}
            />
          ) : (
            <FaArrowDown
              size={6}
              style={{ color: trendColor }}
            />
          )}

          <span
            className="font-semibold"
            style={{ color: trendColor }}
          >
            {trendValue}
          </span>

          <span className="text-slate-500">
            {comparisonText}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-4.5 -mx-1">
        <Sparkline
          data={sparklineData}
          color={sparklineColor}
        />
      </div>
    </motion.div>
  );
}