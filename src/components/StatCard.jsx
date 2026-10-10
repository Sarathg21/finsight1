

// // import { motion } from "framer-motion";

// // const colorMap = {
// //   blue: "bg-blue-50 text-blue-600",
// //   green: "bg-green-50 text-green-600",
// //   orange: "bg-orange-50 text-orange-600",
// //   purple: "bg-purple-50 text-purple-600",
// //   teal: "bg-teal-50 text-teal-600",
// //   red: "bg-red-50 text-red-600",
// // };

// // export default function StatCard({
// //   icon: Icon,
// //   title,
// //   value,
// //   label,
// //   description,
// //   trend,
// //   trendDir = "flat",
// //   color = "blue",
// //   delay = 0,
// //   className = "",
// //   onClick,
// //   loading = false,
// //   children,
// //   iconContainerClass = "",
// //   compact = false,
// // }) {
// //   const trendColor =
// //     trendDir === "up"
// //       ? "text-green-600"
// //       : trendDir === "down"
// //         ? "text-red-600"
// //         : "text-gray-400";

// //   const arrow =
// //     trendDir === "up"
// //       ? "↑"
// //       : trendDir === "down"
// //         ? "↓"
// //         : "—";

// //   const defaultIconClass = `
// //     flex
// //     h-8
// //     w-8
// //     shrink-0
// //     items-center
// //     justify-center
// //     rounded-lg
// //     ${colorMap[color] || colorMap.blue}
// //   `;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 8 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{
// //         duration: 0.3,
// //         delay,
// //       }}
// //       whileHover={{ y: -2 }}
// //       onClick={onClick}
// //       className={`
// //         w-full
// //         min-w-0
// //         overflow-hidden
// //         box-border
// //         rounded-lg
// //         border
// //         border-gray-200
// //         bg-white
// //         shadow-sm
// //         transition-all
// //         duration-300
// //         hover:shadow-md

// //         ${onClick ? "cursor-pointer" : ""}

// //         ${className}
// //       `}
// //       style={{
// //         minHeight: compact ? "84px" : "88px",
// //         padding: compact ? "10px 12px" : "11px 12px",
// //       }}
// //     >
// //       {loading ? (
// //         /* =====================================================
// //            LOADING STATE
// //         ===================================================== */
// //         <div
// //           className="animate-pulse"
// //           style={{
// //             width: "100%",
// //             minWidth: 0,
// //             boxSizing: "border-box",
// //           }}
// //         >
// //           <div
// //             className="rounded-md bg-gray-200"
// //             style={{
// //               width: "32px",
// //               height: "32px",
// //               marginBottom: "8px",
// //             }}
// //           />

// //           <div
// //             className="rounded bg-gray-200"
// //             style={{
// //               width: "80px",
// //               height: "12px",
// //               marginBottom: "7px",
// //             }}
// //           />

// //           <div
// //             className="rounded bg-gray-200"
// //             style={{
// //               width: "56px",
// //               height: "20px",
// //             }}
// //           />
// //         </div>
// //       ) : (
// //         <>
// //           {/* =====================================================
// //               MAIN CONTENT
// //           ===================================================== */}

// //           <div
// //             style={{
// //               width: "100%",
// //               minWidth: 0,
// //               boxSizing: "border-box",
// //               display: "grid",

// //               /*
// //                * Fixed icon column + flexible content column.
// //                * This keeps every StatCard consistent.
// //                */
// //               gridTemplateColumns: Icon
// //                 ? "32px minmax(0, 1fr)"
// //                 : "minmax(0, 1fr)",

// //               columnGap: "10px",

// //               alignItems: "start",
// //             }}
// //           >
// //             {/* =================================================
// //                 ICON
// //             ================================================= */}

// //             {Icon && (
// //               <div
// //                 className={
// //                   iconContainerClass
// //                     ? iconContainerClass
// //                     : defaultIconClass
// //                 }
// //                 style={{
// //                   width: "32px",
// //                   height: "32px",
// //                   minWidth: "32px",
// //                   flexShrink: 0,
// //                   boxSizing: "border-box",
// //                 }}
// //               >
// //                 <Icon
// //                   className="h-5 w-5"
// //                   strokeWidth={2}
// //                 />
// //               </div>
// //             )}

// //             {/* =================================================
// //                 TEXT CONTENT
// //             ================================================= */}

// //             <div
// //               style={{
// //                 width: "100%",
// //                 minWidth: 0,
// //                 maxWidth: "100%",
// //                 overflow: "hidden",
// //                 boxSizing: "border-box",
// //               }}
// //             >
// //               {/* =================================================
// //                   LABEL
// //               ================================================= */}

// //               {label && (
// //                 <p
// //                   className={
// //                     compact
// //                       ? "truncate text-[10px] font-semibold text-gray-700"
// //                       : "truncate text-[10px] font-medium uppercase tracking-wide text-black"
// //                   }
// //                   style={{
// //                     width: "100%",
// //                     minWidth: 0,
// //                     maxWidth: "100%",
// //                     margin: 0,
// //                     lineHeight: "14px",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {label}
// //                 </p>
// //               )}

// //               {/* =================================================
// //                   TITLE
// //               ================================================= */}

// //               {!compact && title && (
// //                 <p
// //                   className="truncate text-sm font-medium text-black"
// //                   style={{
// //                     width: "100%",
// //                     minWidth: 0,
// //                     maxWidth: "100%",
// //                     margin: 0,
// //                     lineHeight: "18px",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {title}
// //                 </p>
// //               )}

// //               {/* =================================================
// //                   VALUE
// //               ================================================= */}

// //               <p
// //                 className={
// //                   compact
// //                     ? "text-xl font-bold text-gray-900"
// //                     : "text-2xl font-bold text-gray-900"
// //                 }
// //                 style={{
// //                   width: "100%",
// //                   minWidth: 0,
// //                   maxWidth: "100%",
// //                   margin: compact
// //                     ? "2px 0 0 0"
// //                     : "1px 0 0 0",
// //                   lineHeight: compact
// //                     ? "24px"
// //                     : "28px",
// //                   whiteSpace: "nowrap",
// //                   overflow: "hidden",
// //                   textOverflow: "ellipsis",
// //                   boxSizing: "border-box",
// //                 }}
// //               >
// //                 {value}
// //               </p>

// //               {/* =================================================
// //                   DESCRIPTION
// //               ================================================= */}

// //               {description && (
// //                 <p
// //                   className={
// //                     compact
// //                       ? "truncate text-[10px] text-gray-500"
// //                       : "truncate text-[11px] text-gray-500"
// //                   }
// //                   style={{
// //                     width: "100%",
// //                     minWidth: 0,
// //                     maxWidth: "100%",
// //                     margin: "1px 0 0 0",
// //                     lineHeight: "14px",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {description}
// //                 </p>
// //               )}

// //               {/* =================================================
// //                   TREND
// //               ================================================= */}

// //               {trend && (
// //                 <p
// //                   className={`text-[11px] font-medium ${trendColor}`}
// //                   style={{
// //                     width: "100%",
// //                     minWidth: 0,
// //                     maxWidth: "100%",
// //                     margin: "3px 0 0 0",
// //                     lineHeight: "14px",
// //                     whiteSpace: "nowrap",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {arrow} {trend}
// //                 </p>
// //               )}
// //             </div>
// //           </div>

// //           {/* =====================================================
// //               CHILDREN
// //           ===================================================== */}

// //           {children && (
// //             <div
// //               className="border-t border-gray-100"
// //               style={{
// //                 width: "100%",
// //                 minWidth: 0,
// //                 marginTop: "7px",
// //                 paddingTop: "6px",
// //                 boxSizing: "border-box",
// //                 overflow: "hidden",
// //               }}
// //             >
// //               {children}
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </motion.div>
// //   );
// // }



// import { motion } from "framer-motion";

// const colorMap = {
//   blue: {
//     surface: "#EEF4FF",
//     iconBg: "#DCE9FF",
//     accent: "#246BFD",
//     track: "#DCE7FB",
//   },
//   green: {
//     surface: "#EEFBF2",
//     iconBg: "#D9F8E5",
//     accent: "#0CA65B",
//     track: "#DDF3E5",
//   },
//   orange: {
//     surface: "#FFF6EC",
//     iconBg: "#FFE9D1",
//     accent: "#F26A00",
//     track: "#FCE8D5",
//   },
//   purple: {
//     surface: "#F5F1FF",
//     iconBg: "#E9E0FF",
//     accent: "#8755FF",
//     track: "#EAE2FC",
//   },
//   teal: {
//     surface: "#EAFBFD",
//     iconBg: "#D5F5FA",
//     accent: "#00A6BD",
//     track: "#D8F2F5",
//   },
//   red: {
//     surface: "#FFF0F5",
//     iconBg: "#FFE0EB",
//     accent: "#F02D72",
//     track: "#F9DFE8",
//   },
// };

// export default function StatCard({
//   icon: Icon,
//   title,
//   value,
//   label,
//   description,
//   trend,
//   trendDir = "flat",
//   color = "blue",
//   delay = 0,
//   className = "",
//   onClick,
//   loading = false,
//   children,
//   iconContainerClass = "",
//   compact = false,
// }) {
//   const palette = colorMap[color] || colorMap.blue;
//   // Slightly enlarge only User/Role KPI names; all other cards keep their current sizing.
//   const isUserOrRoleKpi = /\b(user|users|role|roles)\b/i.test(
//     `${label ?? ""} ${title ?? ""}`
//   );
//   const trendColor =
//     trendDir === "up"
//       ? "#159447"
//       : trendDir === "down"
//         ? "#E53935"
//         : "#64748B";
//   const arrow = trendDir === "up" ? "↑" : trendDir === "down" ? "↓" : "—";

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 5 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{
//         opacity: { duration: 0.28, delay },
//         y: { type: "spring", stiffness: 320, damping: 24 },
//         scale: { type: "spring", stiffness: 320, damping: 24 },
//         boxShadow: { duration: 0.2 },
//       }}
//       whileHover={{
//         y: -3,
//         scale: 1.012,
//         boxShadow: `0 9px 22px ${palette.accent}20, 0 3px 8px rgba(15,23,42,0.06)`,
//         borderColor: `${palette.accent}55`,
//       }}
//       whileTap={onClick ? { scale: 0.99 } : undefined}
//       onClick={onClick}
//       className={`relative box-border w-full min-w-0 overflow-hidden rounded-[13px] border border-white/70 transition-shadow duration-200 ${onClick ? "cursor-pointer" : ""} ${className}`}
//       style={{
//         minHeight: compact ? 76 : 84,
//         padding: compact ? "10px 11px" : "11px 12px",
//         background: palette.surface,
//         boxShadow: "0 1px 3px rgba(15,23,42,0.025)",
//         boxSizing: "border-box",
//         fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
//       }}
//     >
//       {/* Subtle hover sheen; it is decorative and does not intercept clicks. */}
//       <motion.div
//         aria-hidden="true"
//         initial={{ opacity: 0 }}
//         whileHover={{ opacity: 1 }}
//         transition={{ duration: 0.2 }}
//         style={{
//           position: "absolute",
//           inset: 0,
//           borderRadius: "inherit",
//           background: `linear-gradient(115deg, transparent 15%, ${palette.accent}0A 48%, transparent 78%)`,
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {loading ? (
//         <div className="relative z-[1] flex h-full min-h-[54px] items-center gap-3 animate-pulse">
//           <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200/80" />
//           <div className="min-w-0 flex-1">
//             <div className="mb-2 h-2.5 w-24 rounded bg-slate-200/80" />
//             <div className="mb-2 h-4 w-28 rounded bg-slate-200/80" />
//             <div className="h-3 w-32 rounded bg-slate-200/70" />
//           </div>
//         </div>
//       ) : (
//         <div className="flex min-w-0 items-center gap-[9px]">
//           {Icon && (
//             <div
//               className={iconContainerClass}
//               style={{
//                 width: compact ? 31 : 34,
//                 height: compact ? 31 : 34,
//                 minWidth: compact ? 31 : 34,
//                 flexShrink: 0,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 borderRadius: "50%",
//                 background: palette.iconBg,
//                 color: palette.accent,
//                 boxSizing: "border-box",
//               }}
//             >
//               <motion.span
//                 className="flex items-center justify-center"
//                 whileHover={{ scale: 1.12, rotate: 4 }}
//                 transition={{ type: "spring", stiffness: 380, damping: 16 }}
//               >
//                 <Icon size={compact ? 16 : 18} strokeWidth={2} aria-hidden="true" />
//               </motion.span>
//             </div>
//           )}

//           <div className="min-w-0 flex-1">
//             {label && (
//               <p
//                 title={label}
//                 style={{
//                   margin: 0,
//                   color: palette.accent,
//                   fontSize: isUserOrRoleKpi ? (compact ? 12 : 13) : compact ? 11 : 12,
//                   fontWeight: 700,
//                   lineHeight: "14px",
//                   letterSpacing: "-0.1px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 {label}
//               </p>
//             )}

//             {title && !compact && (
//               <p
//                 title={title}
//                 style={{
//                   margin: "1px 0 0",
//                   color: palette.accent,
//                   fontSize: 10,
//                   fontWeight: 600,
//                   lineHeight: "12px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 {title}
//               </p>
//             )}

//             <p
//               title={value == null ? "" : String(value)}
//               style={{
//                 margin: title && !compact ? "1px 0 0" : "2px 0 0",
//                 color: "#172033",
//                 fontSize: compact ? 16 : 17,
//                 fontWeight: 750,
//                 lineHeight: compact ? "19px" : "20px",
//                 letterSpacing: "-0.35px",
//                 fontVariantNumeric: "tabular-nums",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//             >
//               {value ?? "—"}
//             </p>

//             {(description || trend) && (
//               <div className="flex min-w-0 items-center gap-1" style={{ marginTop: 3 }}>
//                 {description && (
//                   <span
//                     title={description}
//                     style={{
//                       minWidth: 0,
//                       maxWidth: trend ? "72%" : "100%",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                       whiteSpace: "nowrap",
//                       display: "inline-block",
//                       borderRadius: 5,
//                       padding: "2px 5px",
//                       background: "rgba(100,116,139,0.08)",
//                       color: "#536176",
//                       fontSize: 9,
//                       fontWeight: 600,
//                       lineHeight: "11px",
//                     }}
//                   >
//                     {description}
//                   </span>
//                 )}
//                 {trend && (
//                   <span
//                     title={`${arrow} ${trend}`}
//                     style={{
//                       flexShrink: 0,
//                       color: trendColor,
//                       fontSize: 9,
//                       fontWeight: 700,
//                       lineHeight: "12px",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     {arrow} {trend}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {children && !loading && (
//         <div
//           className="relative z-[1] min-w-0 border-t border-slate-200/60"
//           style={{ width: "100%", marginTop: 7, paddingTop: 6, boxSizing: "border-box" }}
//         >
//           {children}
//         </div>
//       )}

//       <div
//         aria-hidden="true"
//         style={{
//           position: "absolute",
//           left: 10,
//           right: 10,
//           bottom: 0,
//           height: 2,
//           borderRadius: "3px 3px 0 0",
//           background: palette.track,
//           pointerEvents: "none",
//         }}
//       />
//     </motion.div>
//   );
// }


import { motion } from "framer-motion";

const colorMap = {
  blue: {
    surface: "#EEF4FF",
    iconBg: "#DCE9FF",
    accent: "#246BFD",
    track: "#DCE7FB",
  },
  green: {
    surface: "#EEFBF2",
    iconBg: "#D9F8E5",
    accent: "#0CA65B",
    track: "#DDF3E5",
  },
  orange: {
    surface: "#FFF6EC",
    iconBg: "#FFE9D1",
    accent: "#F26A00",
    track: "#FCE8D5",
  },
  purple: {
    surface: "#F5F1FF",
    iconBg: "#E9E0FF",
    accent: "#8755FF",
    track: "#EAE2FC",
  },
  teal: {
    surface: "#EAFBFD",
    iconBg: "#D5F5FA",
    accent: "#00A6BD",
    track: "#D8F2F5",
  },
  red: {
    surface: "#FFF0F5",
    iconBg: "#FFE0EB",
    accent: "#F02D72",
    track: "#F9DFE8",
  },
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
  const palette = colorMap[color] || colorMap.blue;
  // Keep all KPI heading text consistent, including User Access, Users, Roles, and Master Data.
  // Both label and title use the card accent color and matching font sizing.
  const trendColor =
    trendDir === "up"
      ? "#159447"
      : trendDir === "down"
        ? "#E53935"
        : "#64748B";
  const arrow = trendDir === "up" ? "↑" : trendDir === "down" ? "↓" : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.28, delay },
        y: { type: "spring", stiffness: 320, damping: 24 },
        scale: { type: "spring", stiffness: 320, damping: 24 },
        boxShadow: { duration: 0.2 },
      }}
      whileHover={{
        y: -3,
        scale: 1.012,
        boxShadow: `0 9px 22px ${palette.accent}20, 0 3px 8px rgba(15,23,42,0.06)`,
        borderColor: `${palette.accent}55`,
      }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`relative box-border w-full min-w-0 overflow-hidden rounded-[13px] border border-white/70 transition-shadow duration-200 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        minHeight: compact ? 76 : 84,
        padding: compact ? "10px 11px" : "11px 12px",
        background: palette.surface,
        boxShadow: "0 1px 3px rgba(15,23,42,0.025)",
        boxSizing: "border-box",
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
      }}
    >
      {/* Subtle hover sheen; it is decorative and does not intercept clicks. */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: `linear-gradient(115deg, transparent 15%, ${palette.accent}0A 48%, transparent 78%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {loading ? (
        <div className="relative z-[1] flex h-full min-h-[54px] items-center gap-3 animate-pulse">
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200/80" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-2.5 w-24 rounded bg-slate-200/80" />
            <div className="mb-2 h-4 w-28 rounded bg-slate-200/80" />
            <div className="h-3 w-32 rounded bg-slate-200/70" />
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-[9px]">
          {Icon && (
            <div
              className={iconContainerClass}
              style={{
                width: compact ? 31 : 34,
                height: compact ? 31 : 34,
                minWidth: compact ? 31 : 34,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: palette.iconBg,
                color: palette.accent,
                boxSizing: "border-box",
              }}
            >
              <motion.span
                className="flex items-center justify-center"
                whileHover={{ scale: 1.12, rotate: 4 }}
                transition={{ type: "spring", stiffness: 380, damping: 16 }}
              >
                <Icon size={compact ? 16 : 18} strokeWidth={2} aria-hidden="true" />
              </motion.span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            {label && (
              <p
                title={label}
                style={{
                  margin: 0,
                  color: palette.accent,
                  fontSize: compact ? 11 : 12,
                  fontWeight: 700,
                  lineHeight: "14px",
                  letterSpacing: "-0.1px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </p>
            )}

            {title && !compact && (
              <p
                title={title}
                style={{
                  margin: "1px 0 0",
                  color: palette.accent,
                  fontSize: compact ? 11 : 12,
                  fontWeight: 700,
                  lineHeight: compact ? "13px" : "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </p>
            )}

            <p
              title={value == null ? "" : String(value)}
              style={{
                margin: title && !compact ? "1px 0 0" : "2px 0 0",
                color: "#172033",
                fontSize: compact ? 16 : 17,
                fontWeight: 750,
                lineHeight: compact ? "19px" : "20px",
                letterSpacing: "-0.35px",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {value ?? "—"}
            </p>

            {(description || trend) && (
              <div className="flex min-w-0 items-center gap-1" style={{ marginTop: 3 }}>
                {description && (
                  <span
                    title={description}
                    style={{
                      minWidth: 0,
                      maxWidth: trend ? "72%" : "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                      borderRadius: 5,
                      padding: "2px 5px",
                      background: "rgba(100,116,139,0.08)",
                      color: "#536176",
                      fontSize: 9,
                      fontWeight: 600,
                      lineHeight: "11px",
                    }}
                  >
                    {description}
                  </span>
                )}
                {trend && (
                  <span
                    title={`${arrow} ${trend}`}
                    style={{
                      flexShrink: 0,
                      color: trendColor,
                      fontSize: 9,
                      fontWeight: 700,
                      lineHeight: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {arrow} {trend}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {children && !loading && (
        <div
          className="relative z-[1] min-w-0 border-t border-slate-200/60"
          style={{ width: "100%", marginTop: 7, paddingTop: 6, boxSizing: "border-box" }}
        >
          {children}
        </div>
      )}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          bottom: 0,
          height: 2,
          borderRadius: "3px 3px 0 0",
          background: palette.track,
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
