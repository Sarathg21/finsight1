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
  cardBackground = "#FFFFFF",
}) {

  const isUp = trend === "up";

  return (
    <motion.div

      initial={{
        opacity:0,
        y:12
      }}

      animate={{
        opacity:1,
        y:0
      }}

      whileHover={{
        y:-2,
        scale:1.01,
        transition:{
          duration:0.2
        }
      }}

      transition={{
        duration:0.35,
        ease:"easeOut"
      }}

      className="kpi-card"

      style={{
        backgroundColor:cardBackground
      }}

    >


      {/* HEADER */}

      <div className="kpi-header">
        <div
          className="kpi-icon"
          style={{
            backgroundColor:iconBackground
          }}
        >
          {
            Icon && (
              <Icon
                size={14}
                style={{
                  color:iconColor
                }}
              />

            )
          }
        </div>
        <span
          className="kpi-title"
          style={{
            color:titleColor
          }}
        >
          {title}
        </span>
      </div>


      {/* VALUE SECTION */}

      <div className="kpi-content">
        <h2 className="kpi-value">
          {value}
        </h2>

        <div className="kpi-trend">
          {
            isUp ?
            (
              <FaArrowUp
                size={7}
                style={{
                  color:trendColor
                }}
              />
            )
            :
            (
              <FaArrowDown
                size={7}
                style={{
                  color:trendColor
                }}
              />

            )

          }
          <span
            className="kpi-trend-value"
            style={{
              color:trendColor
            }}
          >
            {trendValue}
          </span>

          <span className="kpi-comparison">
            {comparisonText}
          </span>
        </div>
      </div>


      {/* SPARKLINE */}
      <div className="kpi-sparkline">
        <Sparkline
          data={sparklineData}
          color={sparklineColor}
        />
      </div>
    </motion.div>
  );
}