// import { motion } from "framer-motion";
// import { CalendarDays, RefreshCw } from "lucide-react";

// export default function PageHeader({
//   title,
//   subtitle,

//   buttonText,
//   buttonIcon: ButtonIcon,
//   onButtonClick,

//   children,
//   actions,

//   variant = "default",

//   date = new Date().toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   }),

//   onRefresh,
// }) {
//   const isDashboard = variant === "dashboard";

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -4 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className={`
//         flex
//         items-start
//         justify-between
//         flex-wrap
//         ${isDashboard ? "mb-2" : "mb-2"}
//       `}
//     >
//       {/* Left */}
//       <div className="min-w-0">

//         <h1
//           className={
//             isDashboard
//               ? "text-[24px] font-bold tracking-tight leading-none text-gray-900"
//               : "text-xl font-bold leading-none text-gray-900"
//           }
//         >
//           {title}
//         </h1>

//         {subtitle && (
//           <p
//             className={
//               isDashboard
//                 ? "mt-1 text-[13px] leading-4 text-gray-700 max-w-3xl"
//                 : "mt-0 text-[12px] leading-3 text-gray-700"
//             }
//           >
//             {subtitle}
//           </p>
//         )}

//       </div>

//       {/* Right */}

//       <div className="flex items-center gap-2">

//         {isDashboard ? (
//           <>
//             {/* Date */}

//             <div
//               className="
//                 flex
//                 items-center
//                 gap-2
//                 rounded-lg
//                 border
//                 border-gray-200
//                 bg-white
//                 px-3
//                 py-1.5
//                 shadow-sm
//               "
//             >
//               <CalendarDays
//                 className="h-4 w-4 text-gray-500"
//               />

//               <span className="text-[12px] font-medium text-gray-700">
//                 {date}
//               </span>
//             </div>

//             {/* Refresh */}

//             <button
//               onClick={onRefresh}
//               className="
//                 flex
//                 h-8
//                 items-center
//                 gap-2
//                 rounded-lg
//                 bg-blue-600
//                 px-3
//                 text-[12px]
//                 font-semibold
//                 text-white
//                 shadow-sm
//                 transition
//                 hover:bg-blue-700
//               "
//             >
//               <RefreshCw className="h-4 w-4" />

//               Refresh
//             </button>
//           </>
//         ) : children ? (
//           children
//         ) : actions ? (
//           actions
//         ) : (
//           buttonText && (
//             <button
//               onClick={onButtonClick}
//               className="
//                 flex
//                 h-8
//                 items-center
//                 gap-1
//                 rounded-md
//                 bg-blue-600
//                 px-3
//                 text-[12px]
//                 font-medium
//                 text-white
//                 shadow-sm
//                 hover:bg-blue-700
//               "
//             >
//               {ButtonIcon && <ButtonIcon className="h-3 w-3" />}

//               {buttonText}
//             </button>
//           )
//         )}

//       </div>
//     </motion.div>
//   );
// }

import { motion } from "framer-motion";
import { CalendarDays, RefreshCw } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,

  buttonText,
  buttonIcon: ButtonIcon,
  onButtonClick,

  children,
  actions,

  variant = "default",

  date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),

  onRefresh,
}) {
  const isDashboard = variant === "dashboard";

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="
        mb-2
        flex
        flex-wrap
        items-start
        justify-between
      "
    >
      {/* Left */}
      <div>
        <h1
          className={
            isDashboard
              ? "text-[24px] font-bold leading-none tracking-tight text-gray-900"
              : "text-xl font-bold leading-none text-gray-900"
          }
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={
              isDashboard
                ? "mt-1 max-w-3xl text-[13px] leading-4 text-gray-700"
                : "mt-1 text-[12px] leading-4 text-gray-700"
            }
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {isDashboard ? (
          <>
            {/* Date */}
            <div
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                py-1.5
                shadow-sm
              "
            >
              <CalendarDays className="h-4 w-4 text-gray-500" />

              <span className="text-[12px] font-medium text-gray-700">
                {date}
              </span>
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="
                flex
                h-8
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-3
                text-[12px]
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-blue-700
              "
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </>
        ) : children ? (
          children
        ) : actions ? (
          actions
        ) : (
          buttonText && (
            <button
              type="button"
              onClick={onButtonClick}
              className="
                flex
                h-8
                items-center
                gap-1
                rounded-md
                bg-blue-600
                px-3
                text-[12px]
                font-medium
                text-white
                shadow-sm
                hover:bg-blue-700
              "
            >
              {ButtonIcon && (
                <ButtonIcon className="h-3.5 w-3.5" />
              )}

              {buttonText}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}