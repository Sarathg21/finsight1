// // import React, { useState, useEffect } from "react";
// // import { NavLink } from "react-router-dom";

// // import PageHeader from "../components/Common/PageHeader";
// // import FooterNote from "../components/FooterNote";

// // import {
// //   Users, UserCheck, ShieldCheck, LockKeyhole, Building2, Building, GitBranch, Layers, BriefcaseBusiness, FileCode2,
// //   CheckCircle2, UserPlus, Shield, KeyRound,
// // } from "lucide-react";
// // import { getAdminSystemStatus } from "../api/adminApi";

// // export default function AdminMainDashboard() {

// //   /* =========================================================
// //      LOADING
// //   ========================================================= */

// //   const [loading, setLoading] = useState(true);
// //   const [summary, setSummary] = useState(null);
// //   const [error, setError] = useState("");


// //   useEffect(() => {
// //     fetchAdminSummary();
// //   }, []);


// //   const fetchAdminSummary = async () => {
// //     try {
// //       setLoading(true);
// //       setError("");

// //       const response = await getAdminSystemStatus();

// //       console.log("Admin System Status:", response.data);

// //       setSummary(response.data.data);
// //     } catch (error) {
// //       console.error("Admin System Status API Error:", error);

// //       setError("Unable to load admin dashboard data.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* =========================================================
// //      REFRESH
// //   ========================================================= */

// //   const handleRefresh = () => {
// //     fetchAdminSummary();
// //   };

// //   /* =========================================================
// //      LOADING STATE
// //   ========================================================= */

// //   // if (loading) {
// //   //   return (
// //   //     <div className="p-4">
// //   //       <PageSkeleton />
// //   //     </div>
// //   //   );
// //   // }

// //   /* =========================================================
// //      SECURITY KPI DATA
// //   ========================================================= */

// //   const securityKpis = [
// //     {
// //       title: "Total Users",
// //       value: summary?.total_users ?? 0,
// //       description: "Registered users",
// //       icon: Users,
// //       background: "bg-[#EEF2FF]",
// //       border: "border-[#D7DEF0]",
// //     },

// //     {
// //       title: "Active Users",
// //       value: summary?.active_users ?? 0,
// //       description: "Live status count",
// //       icon: UserCheck,
// //       background: "bg-[#EDF9F2]",
// //       border: "border-[#CFE8D8]",
// //     },

// //     {
// //       title: "Active Roles",
// //       value: summary?.total_roles ?? 0,
// //       description: "Active roles",
// //       icon: ShieldCheck,
// //       background: "bg-[#F5F0FF]",
// //       border: "border-[#DED3F3]",
// //     },

// //     {
// //       title: "Active Accesses",
// //       value: summary?.active_accesses ?? 0,
// //       description: "Access assignments",
// //       icon: LockKeyhole,
// //       background: "bg-[#FFF5E8]",
// //       border: "border-[#EBDCC5]",
// //     },
// //   ];

// //   /* =========================================================
// //      MASTER DATA KPI DATA
// //   ========================================================= */

// //   const masterDataKpis = [
// //     {
// //       title: "Legal Groups",
// //       value: summary?.legal_groups ?? 0,
// //       description: "Active records",
// //       icon: Building2,
// //     },

// //     {
// //       title: "Legal Entities",
// //       value: summary?.legal_entities ?? 0,
// //       description: "Active records",
// //       icon: Building,
// //     },

// //     {
// //       title: "Parent Divisions",
// //       value: summary?.parent_divisions ?? 0,
// //       description: "Active records",
// //       icon: GitBranch,
// //     },

// //     {
// //       title: "Subdivisions",
// //       value: summary?.subdivisions ?? 0,
// //       description: "Active records",
// //       icon: Layers,
// //     },

// //     {
// //       title: "Business Units",
// //       value: summary?.business_units ?? 0,
// //       description: "Active records",
// //       icon: BriefcaseBusiness,
// //     },

// //     {
// //       title: "Analysis Codes",
// //       value: summary?.analysis_codes ?? 0,
// //       description: "Active records",
// //       icon: FileCode2,
// //     },
// //   ];

// //   /* =========================================================
// //      KPI CARD
// //      Reduced vertical padding/height
// //   ========================================================= */

// //   const renderKpiCard = (card, index) => {
// //     const Icon = card.icon;

// //     return (
// //       <div
// //         key={`${card.title}-${index}`}
// //         className={`
// //           relative
// //           min-h-23

// //           rounded-xl
// //           border

// //           ${card.border || "border-[#D7E0ED]"}
// //           ${card.background || "bg-white"}

// //           px-4
// //           py-2.5

// //           transition-all
// //           duration-200

// //           hover:-translate-y-px
// //           hover:shadow-sm
// //         `}
// //       >
// //         {/* Card Header */}

// //         <div
// //           className="
// //             flex
// //             items-center
// //             justify-between
// //             gap-2
// //           "
// //         >
// //           <span
// //             className="
// //               text-[12px]
// //               font-semibold
// //               tracking-wide
// //               text-[#64748B]
// //             "
// //           >
// //             {card.title}
// //           </span>

// //           <Icon
// //             className="
// //               h-4
// //               w-4
// //               shrink-0
// //               text-[#64748B]
// //             "
// //             strokeWidth={1.8}
// //           />
// //         </div>

// //         {/* Value */}

// //         <div
// //           className="
// //             mt-2
// //             text-[27px]
// //             leading-none
// //             font-bold
// //             tracking-tight
// //             text-[#182238]
// //           "
// //         >
// //           {card.value}
// //         </div>

// //         {/* Description */}

// //         <div
// //           className="
// //             mt-1.5
// //             text-[11px]
// //             leading-tight
// //             text-[#718096]
// //           "
// //         >
// //           {card.description}
// //         </div>
// //       </div>
// //     );
// //   };

// //   /* =========================================================
// //      SYSTEM STATUS
// //   ========================================================= */

// //   const systemStatus = [
// //     {
// //       name: "Backend API",
// //       description: "FastAPI service",
// //       status: summary?.api_status ?? "unknown",
// //     },

// //     {
// //       name: "Database",
// //       description: "PostgreSQL",
// //       status: summary?.database ?? "unknown",
// //     },
// //   ];
// //   /* =========================================================
// //      QUICK ACTIONS
// //      Existing routing preserved
// //   ========================================================= */

// //   const quickActions = [
// //     {
// //       title: "Add User",
// //       description: "Create a new user",
// //       icon: UserPlus,
// //       path: "/admin/users",
// //     },

// //     {
// //       title: "Manage Roles",
// //       description: "Roles and permissions",
// //       icon: Shield,
// //       path: "/admin/roles",
// //     },

// //     {
// //       title: "Assign Access",
// //       description: "Organization access scope",
// //       icon: KeyRound,
// //       path: "/admin/user-access",
// //     },

// //     {
// //       title: "Master Data",
// //       description: "Maintain hierarchy",
// //       icon: Layers,
// //       path: "/admin/master-data",
// //     },
// //   ];

// //   const formatStatus = (status) => {
// //     if (!status) return "Unknown";

// //     return status.charAt(0).toUpperCase() + status.slice(1);
// //   };

// //   /* =========================================================
// //      MAIN UI
// //   ========================================================= */
// //   /* -------------------- LOADING -------------------- */

// //   // if (loading) {
// //   //   return (
// //   //     <div className="p-4">
// //   //       <PageSkeleton />
// //   //     </div>
// //   //   );
// //   // }

// //   return (
// //     <div
// //       className="
// //         min-h-screen
// //         w-full
// //         flex
// //         flex-col
// //         bg-[#F7F9FC]
// //         px-4
// //         pb-0
// //         overflow-visible
// //       "
// //     >

// //       {/* =====================================================
// //           DASHBOARD CONTENT
// //           flex-1 allows footer to stay at bottom
// //       ===================================================== */}

// //       <div className="flex-1">

// //         {/* =====================================================
// //             PAGE HEADER
// //         ===================================================== */}

// //         <PageHeader
// //           variant="dashboard"
// //           title="Admin Dashboard"
// //           subtitle="Users, access control, organization master data and system health."
// //           onRefresh={handleRefresh}
// //         />

// //         {error && (
// //           <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
// //             {error}
// //           </div>
// //         )}

// //         {/* =====================================================
// //             SECURITY & ACCESS
// //         ===================================================== */}

// //         <section className="mt-5">

// //           <div
// //             className="
// //               mb-1.5
// //               text-[11px]
// //               font-bold
// //               uppercase
// //               tracking-wide
// //               text-[#64748B]
// //             "
// //           >
// //             Security & Access
// //           </div>

// //           <div
// //             className="
// //               grid
// //               grid-cols-1
// //               sm:grid-cols-2
// //               xl:grid-cols-4
// //               gap-3
// //             "
// //           >
// //             {securityKpis.map((card, index) =>
// //               renderKpiCard(card, index)
// //             )}
// //           </div>

// //         </section>

// //         {/* =====================================================
// //             ORGANIZATION MASTER DATA
// //         ===================================================== */}

// //         <section className="mt-3.5">

// //           <div
// //             className="
// //               mb-1.5
// //               text-[11px]
// //               font-bold
// //               uppercase
// //               tracking-wide
// //               text-[#64748B]
// //             "
// //           >
// //             Organization Master Data
// //           </div>

// //           <div
// //             className="
// //               grid
// //               grid-cols-2
// //               md:grid-cols-3
// //               xl:grid-cols-6
// //               gap-2.5
// //             "
// //           >
// //             {masterDataKpis.map((card, index) =>
// //               renderKpiCard(card, index)
// //             )}
// //           </div>

// //         </section>

// //         {/* =====================================================
// //             SYSTEM STATUS + QUICK ACTIONS
// //         ===================================================== */}

// //         <section
// //           className="
// //             grid
// //             grid-cols-1
// //             xl:grid-cols-10
// //             gap-3
// //             mt-3.5
// //           "
// //         >

// //           {/* ===================================================
// //               SYSTEM STATUS
// //           =================================================== */}

// //           <div
// //             className="
// //               xl:col-span-6

// //               rounded-xl
// //               border
// //               border-[#D6DFEC]

// //               bg-white

// //               px-4
// //               py-2.5

// //               shadow-[0_1px_2px_rgba(15,23,42,0.02)]
// //             "
// //           >

// //             {/* Header */}

// //             <div
// //               className="
// //                 flex
// //                 items-start
// //                 justify-between
// //                 gap-3
// //                 mb-1
// //               "
// //             >

// //               <div>

// //                 <h2
// //                   className="
// //                     text-[21px]
// //                     leading-tight
// //                     font-bold
// //                     text-[#182238]
// //                   "
// //                 >
// //                   System Status
// //                 </h2>

// //                 <p
// //                   className="
// //                     mt-0.5
// //                     text-[11px]
// //                     leading-tight
// //                     text-[#718096]
// //                   "
// //                 >
// //                   Live application health
// //                 </p>

// //               </div>

// //               {/* Healthy Badge */}

// //               <span
// //                 className="
// //                   inline-flex
// //                   items-center
// //                   gap-1.5

// //                   rounded-full

// //                   bg-[#EAF8F1]

// //                   px-3
// //                   py-1

// //                   text-[11px]
// //                   font-bold
// //                   text-[#12A36A]
// //                 "
// //               >
// //                 <CheckCircle2
// //                   className="h-3.5 w-3.5"
// //                   strokeWidth={2.5}
// //                 />

// //                 Healthy
// //               </span>

// //             </div>

// //             {/* Status Rows */}

// //             <div
// //               className="
// //                 divide-y
// //                 divide-[#DCE3EE]
// //               "
// //             >

// //               {systemStatus.map((item) => (

// //                 <div
// //                   key={item.name}
// //                   className="
// //                     grid
// //                     grid-cols-[145px_1fr_auto]
// //                     items-center
// //                     gap-3

// //                     min-h-8.5
// //                     py-1

// //                     text-[11px]
// //                   "
// //                 >

// //                   {/* Name */}

// //                   <div
// //                     className="
// //                       font-bold
// //                       text-[#1E293B]
// //                     "
// //                   >
// //                     {item.name}
// //                   </div>

// //                   {/* Description */}

// //                   <div
// //                     className="
// //                       text-[#718096]
// //                     "
// //                   >
// //                     {item.description}
// //                   </div>

// //                   {/* Status */}
// //                   <div className="text-right">
// //                     <span
// //                       className={`font-semibold ${item.status === "running" || item.status === "connected"
// //                           ? "text-[#12A36A]"
// //                           : "text-[#DC2626]"
// //                         }`}
// //                     >
// //                       {formatStatus(item.status)}
// //                     </span>
// //                   </div>

// //                 </div>

// //               ))}

// //             </div>

// //           </div>


// //           {/* ===================================================
// //               QUICK ACTIONS
// //           =================================================== */}

// //           <div
// //             className="
// //               xl:col-span-4

// //               rounded-xl
// //               border
// //               border-[#D6DFEC]

// //               bg-white

// //               p-3

// //               shadow-[0_1px_2px_rgba(15,23,42,0.02)]
// //             "
// //           >

// //             {/* Quick Actions Header */}

// //             <div className="mb-2">

// //               <h2
// //                 className="
// //                   text-[21px]
// //                   leading-tight
// //                   font-bold
// //                   text-[#182238]
// //                 "
// //               >
// //                 Quick Actions
// //               </h2>

// //             </div>

// //             {/* Compact Action List */}

// //             <div className="space-y-1">

// //               {quickActions.map((action) => {

// //                 const Icon = action.icon;

// //                 return (
// //                   <NavLink
// //                     key={action.title}
// //                     to={action.path}
// //                     className="
// //                       group

// //                       flex
// //                       items-center
// //                       gap-3

// //                       w-full

// //                       min-h-7.5

// //                       rounded-lg

// //                       border
// //                       border-[#D9E1EC]

// //                       bg-white

// //                       px-3
// //                       py-1

// //                       transition-all
// //                       duration-200

// //                       hover:border-[#C5D2E5]
// //                       hover:bg-[#F8FAFD]
// //                       hover:shadow-sm
// //                     "
// //                   >

// //                     {/* Icon */}

// //                     <Icon
// //                       className="
// //                         h-3.5
// //                         w-3.5
// //                         shrink-0
// //                         text-[#64748B]

// //                         group-hover:text-[#4F5EF7]
// //                       "
// //                       strokeWidth={1.8}
// //                     />

// //                     {/* Title */}

// //                     <span
// //                       className="
// //                         w-31.25
// //                         shrink-0

// //                         text-[11px]
// //                         font-bold

// //                         text-[#27344D]
// //                       "
// //                     >
// //                       {action.title}
// //                     </span>

// //                     {/* Description */}

// //                     <span
// //                       className="
// //                         min-w-0
// //                         truncate

// //                         text-[11px]

// //                         text-[#718096]
// //                       "
// //                     >
// //                       {action.description}
// //                     </span>

// //                   </NavLink>
// //                 );

// //               })}

// //             </div>

// //           </div>

// //         </section>

// //       </div>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { NavLink } from "react-router-dom";

// import PageHeader from "../components/Common/PageHeader";

// import {
//   Users,
//   UserCheck,
//   ShieldCheck,
//   LockKeyhole,
//   Building2,
//   Building,
//   GitBranch,
//   Layers,
//   BriefcaseBusiness,
//   FileCode2,
//   CheckCircle2,
//   UserPlus,
//   Shield,
//   KeyRound,
// } from "lucide-react";

// import { getAdminSystemStatus } from "../api/adminApi";

// export default function AdminMainDashboard() {
//   /* =========================================================
//      STATE
//   ========================================================= */

//   const [loading, setLoading] = useState(true);
//   const [summary, setSummary] = useState(null);
//   const [error, setError] = useState("");

//   /* =========================================================
//      FETCH ADMIN SUMMARY
//   ========================================================= */

//   useEffect(() => {
//     fetchAdminSummary();
//   }, []);

//   const fetchAdminSummary = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await getAdminSystemStatus();

//       console.log("Admin System Status:", response.data);

//       setSummary(response.data.data);
//     } catch (error) {
//       console.error("Admin System Status API Error:", error);

//       setError("Unable to load admin dashboard data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* =========================================================
//      REFRESH
//   ========================================================= */

//   const handleRefresh = () => {
//     fetchAdminSummary();
//   };

//   /* =========================================================
//      SECURITY KPI DATA
//   ========================================================= */

//   const securityKpis = [
//     {
//       title: "Total Users",
//       value: summary?.total_users ?? 0,
//       description: "Registered users",
//       icon: Users,
//       background: "bg-[#EEF2FF]",
//       border: "border-[#D7DEF0]",
//     },
//     {
//       title: "Active Users",
//       value: summary?.active_users ?? 0,
//       description: "Live status count",
//       icon: UserCheck,
//       background: "bg-[#EDF9F2]",
//       border: "border-[#CFE8D8]",
//     },
//     {
//       title: "Active Roles",
//       value: summary?.total_roles ?? 0,
//       description: "Active roles",
//       icon: ShieldCheck,
//       background: "bg-[#F5F0FF]",
//       border: "border-[#DED3F3]",
//     },
//     {
//       title: "Active Accesses",
//       value: summary?.active_accesses ?? 0,
//       description: "Access assignments",
//       icon: LockKeyhole,
//       background: "bg-[#FFF5E8]",
//       border: "border-[#EBDCC5]",
//     },
//   ];

//   /* =========================================================
//      MASTER DATA KPI DATA
//   ========================================================= */

//   const masterDataKpis = [
//     {
//       title: "Legal Groups",
//       value: summary?.legal_groups ?? 0,
//       description: "Active records",
//       icon: Building2,
//     },
//     {
//       title: "Legal Entities",
//       value: summary?.legal_entities ?? 0,
//       description: "Active records",
//       icon: Building,
//     },
//     {
//       title: "Parent Divisions",
//       value: summary?.parent_divisions ?? 0,
//       description: "Active records",
//       icon: GitBranch,
//     },
//     {
//       title: "Subdivisions",
//       value: summary?.subdivisions ?? 0,
//       description: "Active records",
//       icon: Layers,
//     },
//     {
//       title: "Business Units",
//       value: summary?.business_units ?? 0,
//       description: "Active records",
//       icon: BriefcaseBusiness,
//     },
//     {
//       title: "Analysis Codes",
//       value: summary?.analysis_codes ?? 0,
//       description: "Active records",
//       icon: FileCode2,
//     },
//   ];

//   /* =========================================================
//      KPI CARD
//   ========================================================= */

//   const renderKpiCard = (card, index) => {
//     const Icon = card.icon;

//     return (
//       <div
//         key={`${card.title}-${index}`}
//         className={`
//           relative
//           rounded-xl
//           border
//           ${card.border || "border-[#D7E0ED]"}
//           ${card.background || "bg-white"}
//           px-3.5
//           py-3
//           min-h-24
//           transition-all
//           duration-200
//          hover:-translate-y-1
//           hover:shadow-sm
//         `}
//       >
//         {/* CARD HEADER */}
//         <div className="flex items-center justify-between gap-3">
//           <span className="text-[12px] font-semibold tracking-wide text-[#64748B]">
//             {card.title}
//           </span>

//           <Icon
//             className="h-4 w-4 shrink-0 text-[#64748B]"
//             strokeWidth={1.7}
//           />
//         </div>

//         {/* VALUE */}
//         <div className="mt-2 text-[27px] leading-none font-bold tracking-tight text-[#182238]">
//           {card.value}
//         </div>

//         {/* DESCRIPTION */}
//         <div className="mt-1.5 text-[11px] leading-tight text-[#718096]">
//           {card.description}
//         </div>
//       </div>
//     );
//   };

//   /* =========================================================
//      SYSTEM STATUS
//   ========================================================= */

//   const systemStatus = [
//     {
//       name: "Backend API",
//       description: "FastAPI service",
//       status: summary?.api_status ?? "unknown",
//     },
//     {
//       name: "Database",
//       description: "PostgreSQL",
//       status: summary?.database ?? "unknown",
//     },
//   ];

//   /* =========================================================
//      QUICK ACTIONS
//   ========================================================= */

//   const quickActions = [
//     {
//       title: "Add User",
//       description: "Create a new user",
//       icon: UserPlus,
//       path: "/admin/users",
//     },
//     {
//       title: "Manage Roles",
//       description: "Roles and permissions",
//       icon: Shield,
//       path: "/admin/roles",
//     },
//     {
//       title: "Assign Access",
//       description: "Organization access scope",
//       icon: KeyRound,
//       path: "/admin/user-access",
//     },
//     {
//       title: "Master Data",
//       description: "Maintain hierarchy",
//       icon: Layers,
//       path: "/admin/master-data",
//     },
//   ];

//   const formatStatus = (status) => {
//     if (!status) return "Unknown";

//     return status.charAt(0).toUpperCase() + status.slice(1);
//   };

//   /* =========================================================
//      MAIN UI
//   ========================================================= */

//   return (
//     <div className="min-h-screen w-full bg-[#F7F9FC]">
//       <div className="w-full px-4 pb-6">
//         {/* PAGE HEADER */}

//         <PageHeader
//           variant="dashboard"
//           title="Admin Dashboard"
//           subtitle="Users, access control, organization master data and system health."
//           onRefresh={handleRefresh}
//         />

//         {/* ERROR */}

//         {error && (
//           <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
//             {error}
//           </div>
//         )}

//         {/* =====================================================
//             SECURITY & ACCESS
//         ===================================================== */}

//         <section className="mt-5">
//           <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
//             Security & Access
//           </div>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//             {securityKpis.map((card, index) =>
//               renderKpiCard(card, index)
//             )}
//           </div>
//         </section>

//         {/* =====================================================
//             ORGANIZATION MASTER DATA
//         ===================================================== */}

//         <section className="mt-3">
//           <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
//             Organization Master Data
//           </div>

//           <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
//             {masterDataKpis.map((card, index) =>
//               renderKpiCard(card, index)
//             )}
//           </div>
//         </section>

//         {/* =====================================================
//             SYSTEM STATUS + QUICK ACTIONS
//         ===================================================== */}

//         <section className="mt-3.5 grid grid-cols-1 gap-3 xl:grid-cols-10">
//           {/* ===================================================
//               SYSTEM STATUS
//           =================================================== */}

//           <div className="xl:col-span-6 rounded-xl border border-[#D6DFEC] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
//             {/* HEADER */}

//             <div className="mb-2 flex items-start justify-between gap-3">
//               <div>
//                 <h2 className="text-[21px] leading-tight font-bold text-[#182238]">
//                   System Status
//                 </h2>

//                 <p className="mt-0.5 text-[11px] leading-tight text-[#718096]">
//                   Live application health
//                 </p>
//               </div>

//               {/* HEALTH BADGE */}

//               <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8F1] px-3 py-1 text-[11px] font-bold text-[#12A36A]">
//                 <CheckCircle2
//                   className="h-3.5 w-3.5"
//                   strokeWidth={2.5}
//                 />
//                 Healthy
//               </span>
//             </div>

//             {/* STATUS ROWS */}

//             <div className="divide-y divide-[#DCE3EE]">
//               {systemStatus.map((item) => (
//                 <div
//                   key={item.name}
//                   className="grid min-h-[32px] grid-cols-[145px_1fr_auto] items-center gap-3 py-1 text-[11px]"
//                 >
//                   {/* NAME */}

//                   <div className="font-bold text-[#1E293B]">
//                     {item.name}
//                   </div>

//                   {/* DESCRIPTION */}

//                   <div className="text-[#718096]">
//                     {item.description}
//                   </div>

//                   {/* STATUS */}

//                   <div className="text-right">
//                     <span
//                       className={`font-semibold ${
//                         item.status === "running" ||
//                         item.status === "connected"
//                           ? "text-[#12A36A]"
//                           : "text-[#DC2626]"
//                       }`}
//                     >
//                       {formatStatus(item.status)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ===================================================
//               QUICK ACTIONS
//           =================================================== */}

//           <div className="xl:col-span-4 rounded-xl border border-[#D6DFEC] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
//             {/* HEADER */}

//             <div className="mb-2">
//               <h2 className="text-[21px] leading-tight font-bold text-[#182238]">
//                 Quick Actions
//               </h2>
//             </div>

//             {/* ACTION LIST */}

//             <div className="space-y-1.5">
//               {quickActions.map((action) => {
//                 const Icon = action.icon;

//                 return (
//                   <NavLink
//                     key={action.title}
//                     to={action.path}
//                     className="
//                       group
//                       flex
//                       min-h-[32px]
//                       w-full
//                       items-center
//                       gap-3
//                       rounded-lg
//                       border
//                       border-[#D9E1EC]
//                       bg-white
//                       px-3
//                       py-1.5
//                       transition-all
//                       duration-200
//                       hover:border-[#C5D2E5]
//                       hover:bg-[#F8FAFD]
//                       hover:shadow-sm
//                     "
//                   >
//                     {/* ICON */}

//                     <Icon
//                       className="
//                         h-3.5
//                         w-3.5
//                         shrink-0
//                         text-[#64748B]
//                         group-hover:text-[#4F5EF7]
//                       "
//                       strokeWidth={1.8}
//                     />

//                     {/* TITLE */}

//                     <span className="w-[130px] shrink-0 text-[11px] font-bold text-[#27344D]">
//                       {action.title}
//                     </span>

//                     {/* DESCRIPTION */}

//                     <span className="min-w-0 truncate text-[11px] text-[#718096]">
//                       {action.description}
//                     </span>
//                   </NavLink>
//                 );
//               })}
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import PageHeader from "../components/Common/PageHeader";

import {
  Users,
  UserCheck,
  ShieldCheck,
  LockKeyhole,
  Building2,
  Building,
  GitBranch,
  Layers,
  BriefcaseBusiness,
  FileCode2,
  CheckCircle2,
  UserPlus,
  Shield,
  KeyRound,
} from "lucide-react";

import { getAdminSystemStatus } from "../api/adminApi";

export default function AdminMainDashboard() {
  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminSummary();
  }, []);

  const fetchAdminSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSystemStatus();

      console.log("Admin System Status:", response.data);

      setSummary(response.data.data);
    } catch (error) {
      console.error("Admin System Status API Error:", error);

      setError("Unable to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {
    fetchAdminSummary();
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  // if (loading) {
  //   return (
  //     <div style={styles.loadingWrapper}>
  //       <PageSkeleton />
  //     </div>
  //   );
  // }

  /* =========================================================
     SECURITY KPI DATA
  ========================================================= */

  const securityKpis = [
    {
      title: "Total Users",
      value: summary?.total_users ?? 0,
      description: "Registered users",
      icon: Users,
      background: "#EEF2FF",
      border: "#D7DEF0",
    },

    {
      title: "Active Users",
      value: summary?.active_users ?? 0,
      description: "Live status count",
      icon: UserCheck,
      background: "#EDF9F2",
      border: "#CFE8D8",
    },

    {
      title: "Active Roles",
      value: summary?.total_roles ?? 0,
      description: "Active roles",
      icon: ShieldCheck,
      background: "#F5F0FF",
      border: "#DED3F3",
    },

    {
      title: "Active Accesses",
      value: summary?.active_accesses ?? 0,
      description: "Access assignments",
      icon: LockKeyhole,
      background: "#FFF5E8",
      border: "#EBDCC5",
    },
  ];

  /* =========================================================
     MASTER DATA KPI DATA
  ========================================================= */

  const masterDataKpis = [
    {
      title: "Legal Groups",
      value: summary?.legal_groups ?? 0,
      description: "Active records",
      icon: Building2,
    },

    {
      title: "Legal Entities",
      value: summary?.legal_entities ?? 0,
      description: "Active records",
      icon: Building,
    },

    {
      title: "Parent Divisions",
      value: summary?.parent_divisions ?? 0,
      description: "Active records",
      icon: GitBranch,
    },

    {
      title: "Subdivisions",
      value: summary?.subdivisions ?? 0,
      description: "Active records",
      icon: Layers,
    },

    {
      title: "Business Units",
      value: summary?.business_units ?? 0,
      description: "Active records",
      icon: BriefcaseBusiness,
    },

    {
      title: "Analysis Codes",
      value: summary?.analysis_codes ?? 0,
      description: "Active records",
      icon: FileCode2,
    },
  ];

  /* =========================================================
     KPI CARD
  ========================================================= */

  const renderKpiCard = (card, index) => {
    const Icon = card.icon;

    return (
      <div
        key={`${card.title}-${index}`}
        style={{
          ...styles.kpiCard,
          background: card.background || "#FFFFFF",
          borderColor: card.border || "#D7E0ED",
        }}
      >
        {/* Card Header */}

        <div style={styles.kpiHeader}>
          <span style={styles.kpiTitle}>
            {card.title}
          </span>

          <Icon
            style={styles.kpiIcon}
            strokeWidth={1.8}
          />
        </div>

        {/* Value */}

        <div style={styles.kpiValue}>
          {card.value}
        </div>

        {/* Description */}

        <div style={styles.kpiDescription}>
          {card.description}
        </div>
      </div>
    );
  };

  /* =========================================================
     SYSTEM STATUS
  ========================================================= */

  const systemStatus = [
    {
      name: "Backend API",
      description: "FastAPI service",
      status: summary?.api_status ?? "unknown",
    },

    {
      name: "Database",
      description: "PostgreSQL",
      status: summary?.database ?? "unknown",
    },
  ];

  /* =========================================================
     QUICK ACTIONS
     Existing routing preserved
  ========================================================= */

  const quickActions = [
    {
      title: "Add User",
      description: "Create a new user",
      icon: UserPlus,
      path: "/admin/users",
    },

    {
      title: "Manage Roles",
      description: "Roles and permissions",
      icon: Shield,
      path: "/admin/roles",
    },

    {
      title: "Assign Access",
      description: "Organization access scope",
      icon: KeyRound,
      path: "/admin/user-access",
    },

    {
      title: "Master Data",
      description: "Maintain hierarchy",
      icon: Layers,
      path: "/admin/master-data",
    },
  ];

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div style={styles.page}>
      {/* =====================================================
          DASHBOARD CONTENT
      ===================================================== */}

      <div style={styles.content}>
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <PageHeader
          variant="dashboard"
          title="Admin Dashboard"
          subtitle="Users, access control, organization master data and system health."
          onRefresh={handleRefresh}
        />

        {/* ERROR */}

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* =====================================================
            SECURITY & ACCESS
        ===================================================== */}

        <section style={styles.securitySection}>
          <div style={styles.sectionTitle}>
            Security & Access
          </div>

          <div style={styles.securityGrid}>
            {securityKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>
        </section>

        {/* =====================================================
            ORGANIZATION MASTER DATA
        ===================================================== */}

        <section style={styles.masterDataSection}>
          <div style={styles.sectionTitle}>
            Organization Master Data
          </div>

          <div style={styles.masterDataGrid}>
            {masterDataKpis.map((card, index) =>
              renderKpiCard(card, index)
            )}
          </div>
        </section>

        {/* =====================================================
            SYSTEM STATUS + QUICK ACTIONS
        ===================================================== */}

        <section style={styles.bottomGrid}>
          {/* ===================================================
              SYSTEM STATUS
          =================================================== */}

          <div style={styles.systemStatusCard}>
            {/* Header */}

            <div style={styles.statusHeader}>
              <div>
                <h2 style={styles.largeTitle}>
                  System Status
                </h2>

                <p style={styles.subtitle}>
                  Live application health
                </p>
              </div>

              {/* Healthy Badge */}

              <span style={styles.healthyBadge}>
                <CheckCircle2
                  style={styles.healthyIcon}
                  strokeWidth={2.5}
                />

                Healthy
              </span>
            </div>

            {/* Status Rows */}

            <div style={styles.statusRows}>
              {systemStatus.map((item) => (
                <div
                  key={item.name}
                  style={styles.statusRow}
                >
                  {/* Name */}

                  <div style={styles.statusName}>
                    {item.name}
                  </div>

                  {/* Description */}

                  <div style={styles.statusDescription}>
                    {item.description}
                  </div>

                  {/* Status */}

                  <div style={styles.statusValueWrapper}>
                    <span
                      style={{
                        ...styles.statusValue,
                        color:
                          item.status === "running" ||
                          item.status === "connected"
                            ? "#12A36A"
                            : "#DC2626",
                      }}
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===================================================
              QUICK ACTIONS
          =================================================== */}

          <div style={styles.quickActionsCard}>
            {/* Quick Actions Header */}

            <div style={styles.quickActionsHeader}>
              <h2 style={styles.largeTitle}>
                Quick Actions
              </h2>
            </div>

            {/* Compact Action List */}

            <div style={styles.quickActionsList}>
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <NavLink
                    key={action.title}
                    to={action.path}
                    style={({ isActive }) => ({
                      ...styles.quickActionLink,
                      background: isActive
                        ? "#F8FAFD"
                        : "#FFFFFF",
                    })}
                  >
                    {/* Icon */}

                    <Icon
                      style={styles.quickActionIcon}
                      strokeWidth={1.8}
                    />

                    {/* Title */}

                    <span style={styles.quickActionTitle}>
                      {action.title}
                    </span>

                    {/* Description */}

                    <span style={styles.quickActionDescription}>
                      {action.description}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   INLINE STYLE CONFIGURATION
   No Tailwind classes
========================================================= */

const styles = {
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#F7F9FC",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingBottom: "0",
    overflow: "visible",
    boxSizing: "border-box",
  },

  content: {
    flex: 1,
    width: "100%",
  },

  loadingWrapper: {
    padding: "16px",
    boxSizing: "border-box",
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorBox: {
    marginTop: "12px",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    background: "#FEF2F2",
    padding: "12px 16px",
    color: "#DC2626",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  /* =======================================================
     SECTION
  ======================================================= */

  securitySection: {
    marginTop: "20px",
  },

  masterDataSection: {
    marginTop: "14px",
  },

  sectionTitle: {
    marginBottom: "6px",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    lineHeight: "16px",
  },

  /* =======================================================
     KPI GRIDS
  ======================================================= */

  securityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
    width: "100%",
  },

  masterDataGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    width: "100%",
  },

  /* =======================================================
     KPI CARD
  ======================================================= */

  kpiCard: {
    position: "relative",
    minHeight: "92px",
    borderRadius: "12px",
    border: "1px solid",
    padding: "10px 16px",
    boxSizing: "border-box",
    transition:
      "transform 200ms ease, box-shadow 200ms ease",
  },

  kpiHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },

  kpiTitle: {
    color: "#64748B",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.025em",
    lineHeight: "16px",
  },

  kpiIcon: {
    width: "16px",
    height: "16px",
    flexShrink: 0,
    color: "#64748B",
  },

  kpiValue: {
    marginTop: "8px",
    color: "#182238",
    fontSize: "27px",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "-0.025em",
  },

  kpiDescription: {
    marginTop: "6px",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },

  /* =======================================================
     BOTTOM GRID
  ======================================================= */

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.5fr) minmax(280px, 1fr)",
    gap: "12px",
    marginTop: "14px",
    width: "100%",
    alignItems: "stretch",
  },

  /* =======================================================
     SYSTEM STATUS
  ======================================================= */

  systemStatusCard: {
    borderRadius: "12px",
    border: "1px solid #D6DFEC",
    background: "#FFFFFF",
    padding: "10px 16px",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.02)",
    boxSizing: "border-box",
    minWidth: 0,
  },

  statusHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "4px",
  },

  largeTitle: {
    margin: 0,
    color: "#182238",
    fontSize: "21px",
    lineHeight: 1.2,
    fontWeight: 700,
  },

  subtitle: {
    margin: "2px 0 0",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },

  healthyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    flexShrink: 0,
    borderRadius: "999px",
    background: "#EAF8F1",
    padding: "4px 12px",
    color: "#12A36A",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  healthyIcon: {
    width: "14px",
    height: "14px",
  },

  statusRows: {
    width: "100%",
  },

  statusRow: {
    display: "grid",
    gridTemplateColumns:
      "145px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: "12px",
    minHeight: "34px",
    paddingTop: "4px",
    paddingBottom: "4px",
    borderBottom: "1px solid #DCE3EE",
    fontSize: "11px",
    boxSizing: "border-box",
  },

  statusName: {
    color: "#1E293B",
    fontWeight: 700,
  },

  statusDescription: {
    minWidth: 0,
    color: "#718096",
  },

  statusValueWrapper: {
    textAlign: "right",
  },

  statusValue: {
    fontWeight: 600,
  },

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  quickActionsCard: {
    borderRadius: "12px",
    border: "1px solid #D6DFEC",
    background: "#FFFFFF",
    padding: "12px",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.02)",
    boxSizing: "border-box",
    minWidth: 0,
  },

  quickActionsHeader: {
    marginBottom: "8px",
  },

  quickActionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    width: "100%",
  },

  quickActionLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minHeight: "30px",
    borderRadius: "8px",
    border: "1px solid #D9E1EC",
    padding: "4px 12px",
    boxSizing: "border-box",
    textDecoration: "none",
    transition:
      "border-color 200ms ease, background 200ms ease, box-shadow 200ms ease",
  },

  quickActionIcon: {
    width: "14px",
    height: "14px",
    flexShrink: 0,
    color: "#64748B",
  },

  quickActionTitle: {
    width: "125px",
    flexShrink: 0,
    color: "#27344D",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  quickActionDescription: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#718096",
    fontSize: "11px",
    lineHeight: 1.2,
  },
};

