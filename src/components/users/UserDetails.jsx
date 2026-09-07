
// import toast, { Toaster } from "react-hot-toast";
// import { Info } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getUserAccess } from "../../api/userAccessApi";
// import {
//   X,
//   KeyRound,
//   UserX,
//   Edit,
//   CheckCircle2,
// } from "lucide-react";

// import StatusBadge from "../StatusBadge";
// import RoleAccessTab from "./RoleAccessTab";

// const tabs = [
//   "Profile",
//   "Roles & Access",
// ];


// function Field({ label, value }) {
//   return (
//     <div className="text-[11px] font-semibold text-gray-500">
//       <p className="
//         text-[10px]
//         font-medium
//         uppercase
//         tracking-wide
//         text-gray-400
//       ">
//         {label}
//       </p>

//       <div className="
//       mt-1
//       truncate
//       text-[13px]
//       font-semibold
//       text-gray-80">{value || "-"}</div>
//     </div>
//   );
// }

// export default function UserDetails({
//   user,
//   onClose, onEdit,
//   onToggleStatus,
// }) {

//   const [tab, setTab] = useState("Profile");
//   const [userAccess, setUserAccess] = useState(null);
//   const [loadingAccess, setLoadingAccess] = useState(false);

//   // if (!user) {
//   //   return null;
//   // }

//   useEffect(() => {
//     if (!user?.id) return;
//     loadAccess();
//   }, [user]);

//   const loadAccess = async () => {
//     try {
//       setLoadingAccess(true);
//       const res = await getUserAccess(user.id);
//       setUserAccess(
//         Array.isArray(res.data)
//           ? res.data
//           : [res.data]
//       );
//     }
//     finally {
//       setLoadingAccess(false);
//     }
//   }

//   const initials = user.name
//     ?.split(" ")
//     .map((n) => n[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   return (
//     <aside className="
//       flex
//       h-full
//       min-h-0
//       flex-col
//       overflow-hidden
//       rounded-xl
//       border
//       border-gray-200
//       bg-white
//       shadow-sm
//     ">

//       {/* HEADER */}
//       <div className="
//         flex
//         shrink-0
//         items-center
//         justify-between
//         border-b
//         border-gray-200
//         px-5
//         py-2
//       ">

//         <h3 className="
//           text-[13px]
//           font-semibold
//           text-gray-800
//         ">
//           User Details
//         </h3>

//         <button
//           onClick={onClose}
//           className="
//             rounded
//             p-1
//             text-gray-500
//             hover:bg-gray-100
//           "
//         >
//           <X className="h-4 w-4" />
//         </button>
//       </div>

//       {/* PROFILE HEADER */}

//       <div className="
//         flex
//         shrink-0
//         items-center
//         gap-3
//         border-b
//         border-gray-100
//         px-5
//         py-2
//       ">

//         <div className="
//           flex
//           h-10
//           w-10
//           items-center
//           justify-center
//           rounded-full
//           bg-blue-600
//           text-sm
//           font-semibold
//           text-white
//         ">

//           {initials}

//         </div>

//         <div className="min-w-0 flex-1">

//           <div className="
//             flex
//             items-center
//             gap-2
//           ">
//             <p className="
//               truncate
//               text-[13px]
//               font-semibold
//               text-gray-900
//             ">
//               {user.name} ({user.code})
//             </p>

//             <StatusBadge
//               label={user.status}
//               tone={
//                 user.status === "Active"
//                   ? "green"
//                   : "gray"
//               }
//               className="
//                 px-2
//                 py-0
//                 text-[9px]
//               "
//             />
//           </div>

//           <p className="
//             truncate
//             text-[11px]
//             text-gray-600
//           ">
//             {user.email}
//           </p>

//         </div>
//       </div>

//       {/* TABS */}

//       <div className="
//         flex
//         shrink-0
//         border-b
//         border-gray-200
//         px-2
//       ">

//         {tabs.map((item) => (
//           <button
//             key={item}
//             onClick={() => setTab(item)}
//             className={`
//               border-b-2
//               px-3
//               py-1
//               text-[12px]
//               font-medium

//               ${tab === item
//                 ? "border-blue-600 text-blue-600"
//                 : "border-transparent text-gray-500"
//               }
//             `}
//           >
//             {item}
//           </button>
//         ))}
//       </div>


//       {/* CONTENT */}
//       <div className="
//         flex-1
//         min-h-0
//         overflow-hidden
//         px-5
//         py-3">

//         {tab === "Profile" && (

//           <div className="
//             grid
//             grid-cols-2
//             gap-x-4
//             gap-y-2
//           ">
//             <Field
//               label="Employee Code"
//               value={user.code}
//             />

//             <Field
//               label="Date Of Joining"
//               value={user.dateOfJoining}
//             />

//             <Field
//               label="Last Login"
//               value={user.lastLogin}
//             />

//             <Field
//               label="Job Title"
//               value={user.jobTitle}
//             />

//             <Field
//               label="Phone"
//               value={user.phone}
//             />

//             <Field
//               label="Location"
//               value={user.location}
//             />

//             <Field
//               label="Email Verified"
//               value={
//                 <span className="
//                   inline-flex
//                   items-center
//                   gap-1
//                   text-green-600
//                   text-[11px]
//                 ">
//                   <CheckCircle2 className="h-3 w-3" />
//                   {
//                     user.emailVerified
//                       ? "Verified"
//                       : "Not Verified"
//                   }
//                 </span>
//               }
//             />
//             <Field
//               label="MFA Status"
//               value={
//                 <span className="
//                   inline-flex
//                   items-center
//                   gap-1
//                   text-green-600
//                   text-[11px]
//                 ">

//                   <CheckCircle2 className="h-3 w-3" />

//                   {
//                     user.mfaEnabled
//                       ? "Enabled"
//                       : "Disabled"
//                   }

//                 </span>
//               }
//             />
//           </div>
//         )}

//         {tab === "Roles & Access" && (
//           <RoleAccessTab
//             user={user}
//             access={userAccess}
//             loading={loadingAccess}
//           />
//         )}
//       </div>

//       {/* FOOTER */}
//       {
//         tab !== "Roles & Access" && (

//           <div className="
//         grid
//         shrink-0
//         grid-cols-3
//         gap-2
//         border-t
//         border-gray-200
//         px-5
//         py-2
//       ">

//             <button onClick={() => {
//               toast.custom(() => (
//                 <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-lg">
//                   <Info className="h-5 w-5 text-red-600" />
//                   <span className="text-md font-medium text-blue-900">
//                     Reset password will be available shortly.
//                   </span>
//                 </div>
//               ));
//             }}
//               className="flex h-7 items-center justify-center gap-1 rounded-md border border-gray-200 text-[11px]">
//               <KeyRound className="h-3 w-3" />
//               Reset Password
//             </button>

//             <button
//               onClick={() => onToggleStatus(user)}
//               className="
//                 flex
//                 h-7
//                 items-center
//                 justify-center
//                 gap-1
//                 rounded-md
//                 border
//                 border-red-200
//                 text-[11px]
//                 text-red-600
//                 hover:bg-red-50
//               "
//             >
//               <UserX className="h-3 w-3" />
//               {user.active ? "Deactivate" : "Activate"}
//             </button>

//            <button
//            onClick={() => onEdit(user)}
//            className="
//              flex
//              h-7
//              items-center
//              justify-center
//              gap-1
//              rounded-md
//              bg-blue-600
//              text-[11px]
//              text-white
//              hover:bg-blue-700
//            "
//          >
//         <Edit className="h-3 w-3" />
//            Edit User
//         </button>
//           </div>
//         )
//       }
//     </aside>
//   );
// }


import toast, { Toaster } from "react-hot-toast";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserAccess } from "../../api/userAccessApi";

import {
  X,
  KeyRound,
  UserX,
  Edit,
  CheckCircle2,
} from "lucide-react";

import StatusBadge from "../StatusBadge";
import RoleAccessTab from "./RoleAccessTab";

const tabs = [
  "Profile",
  "Roles & Access",
];

/* =========================================================
   FIELD COMPONENT
========================================================= */

function Field({ label, value }) {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <p
        style={{
          margin: 0,
          padding: 0,
          fontSize: "9px",
          lineHeight: "12px",
          fontWeight: 600,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>

      <div
        style={{
          margin: 0,
          padding: 0,
          minWidth: 0,
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
          color: "#374151",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={
          typeof value === "string"
            ? value
            : undefined
        }
      >
        {value || "-"}
      </div>
    </div>
  );
}

/* =========================================================
   USER DETAILS
========================================================= */

export default function UserDetails({
  user,
  onClose,
  onEdit,
  onToggleStatus,
}) {
  const [tab, setTab] = useState("Profile");
  const [userAccess, setUserAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(false);

  /* =========================================================
     LOAD USER ACCESS
  ========================================================= */

  useEffect(() => {
    if (!user?.id) return;

    loadAccess();
  }, [user]);

  const loadAccess = async () => {
    try {
      setLoadingAccess(true);

      const res = await getUserAccess(user.id);

      setUserAccess(
        Array.isArray(res.data)
          ? res.data
          : [res.data]
      );
    } finally {
      setLoadingAccess(false);
    }
  };

  /* =========================================================
     INITIALS
  ========================================================= */

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      <Toaster />

      <aside
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow:
            "0 1px 2px rgba(0, 0, 0, 0.05)",
          boxSizing: "border-box",
        }}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            width: "100%",
            minHeight: "42px",
            height: "42px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #e5e7eb",
            boxSizing: "border-box",
          }}
        >
          <h3
            style={{
              margin: 0,
              padding: 0,
              fontSize: "13px",
              lineHeight: "18px",
              fontWeight: 600,
              color: "#1f2937",
              whiteSpace: "nowrap",
            }}
          >
            User Details
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details"
            style={{
              width: "26px",
              height: "26px",
              padding: 0,
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "none",
              borderRadius: "5px",
              backgroundColor: "transparent",
              color: "#6b7280",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "transparent";
            }}
          >
            <X
              style={{
                width: "15px",
                height: "15px",
              }}
            />
          </button>
        </div>

        {/* =====================================================
            PROFILE HEADER
        ===================================================== */}

        <div
          style={{
            width: "100%",
            minHeight: "64px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            borderBottom: "1px solid #f3f4f6",
            boxSizing: "border-box",
          }}
        >
          {/* Avatar */}

          <div
            style={{
              width: "38px",
              height: "38px",
              minWidth: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "12px",
              lineHeight: "16px",
              fontWeight: 600,
            }}
          >
            {initials}
          </div>

          {/* User information */}

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                minWidth: 0,
              }}
            >
              <p
                style={{
                  flex: 1,
                  minWidth: 0,
                  margin: 0,
                  padding: 0,
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 600,
                  color: "#111827",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={`${user?.name || ""} (${user?.code || ""})`}
              >
                {user?.name} ({user?.code})
              </p>

              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <StatusBadge
                  label={user?.status}
                  tone={
                    user?.status === "Active"
                      ? "green"
                      : "gray"
                  }
                  className="px-2 py-0"
                  style={{
                    fontSize: "8px",
                    lineHeight: "11px",
                  }}
                />
              </div>
            </div>

            <p
              style={{
                margin: "3px 0 0 0",
                padding: 0,
                fontSize: "10px",
                lineHeight: "14px",
                color: "#6b7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={user?.email}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div
          style={{
            width: "100%",
            height: "40px",
            minHeight: "40px",
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-end",
            gap: "18px",
            padding: "0 16px",
            borderBottom: "1px solid #e5e7eb",
            boxSizing: "border-box",
          }}
        >
          {tabs.map((item) => {
            const active = tab === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                style={{
                  height: "40px",
                  padding: "0 2px",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: "none",
                  borderBottom: active
                    ? "2px solid #2563eb"
                    : "2px solid transparent",
                  backgroundColor: "transparent",
                  color: active
                    ? "#2563eb"
                    : "#6b7280",
                  fontSize: "11px",
                  lineHeight: "15px",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxSizing: "border-box",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            overflow: "auto",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          {/* ===================================================
              PROFILE TAB
          =================================================== */}

          {tab === "Profile" && (
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) minmax(0, 1fr)",
                columnGap: "24px",
                rowGap: "16px",
                alignItems: "start",
              }}
            >
              <Field
                label="Employee Code"
                value={user?.code}
              />

              <Field
                label="Date Of Joining"
                value={user?.dateOfJoining}
              />

              <Field
                label="Last Login"
                value={user?.lastLogin}
              />

              <Field
                label="Job Title"
                value={user?.jobTitle}
              />

              <Field
                label="Phone"
                value={user?.phone}
              />

              <Field
                label="Location"
                value={user?.location}
              />

              <Field
                label="Email Verified"
                value={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      lineHeight: "15px",
                      fontWeight: 600,
                      color: user?.emailVerified
                        ? "#16a34a"
                        : "#6b7280",
                    }}
                  >
                    <CheckCircle2
                      style={{
                        width: "12px",
                        height: "12px",
                        flexShrink: 0,
                      }}
                    />

                    {user?.emailVerified
                      ? "Verified"
                      : "Not Verified"}
                  </span>
                }
              />

              <Field
                label="MFA Status"
                value={
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      lineHeight: "15px",
                      fontWeight: 600,
                      color: user?.mfaEnabled
                        ? "#16a34a"
                        : "#6b7280",
                    }}
                  >
                    <CheckCircle2
                      style={{
                        width: "12px",
                        height: "12px",
                        flexShrink: 0,
                      }}
                    />

                    {user?.mfaEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                }
              />
            </div>
          )}

          {/* ===================================================
              ROLES & ACCESS TAB
          =================================================== */}

          {tab === "Roles & Access" && (
            <div
              style={{
                width: "100%",
                minHeight: 0,
              }}
            >
              <RoleAccessTab
                user={user}
                access={userAccess}
                loading={loadingAccess}
              />
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        {tab !== "Roles & Access" && (
          <div
            style={{
              width: "100%",
              minHeight: "48px",
              flexShrink: 0,
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
              gap: "8px",
              padding: "8px 16px",
              borderTop: "1px solid #e5e7eb",
              boxSizing: "border-box",
            }}
          >
            {/* RESET PASSWORD */}

            <button
              type="button"
              onClick={() => {
                toast.custom(() => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      border:
                        "1px solid #bfdbfe",
                      borderRadius: "8px",
                      backgroundColor: "#eff6ff",
                      boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                    }}
                  >
                    <Info
                      style={{
                        width: "18px",
                        height: "18px",
                        color: "#2563eb",
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: "11px",
                        lineHeight: "15px",
                        fontWeight: 500,
                        color: "#1e3a8a",
                      }}
                    >
                      Reset password will be
                      available shortly.
                    </span>
                  </div>
                ));
              }}
              style={{
                width: "100%",
                height: "30px",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border:
                  "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "10px",
                lineHeight: "14px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
            >
              <KeyRound
                style={{
                  width: "12px",
                  height: "12px",
                  flexShrink: 0,
                }}
              />

              Reset Password
            </button>

            {/* ACTIVATE / DEACTIVATE */}

            <button
              type="button"
              onClick={() =>
                onToggleStatus(user)
              }
              style={{
                width: "100%",
                height: "30px",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border:
                  "1px solid #fecaca",
                borderRadius: "6px",
                backgroundColor: "#ffffff",
                color: "#dc2626",
                fontSize: "10px",
                lineHeight: "14px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#fef2f2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#ffffff";
              }}
            >
              <UserX
                style={{
                  width: "12px",
                  height: "12px",
                  flexShrink: 0,
                }}
              />

              {user?.active
                ? "Deactivate"
                : "Activate"}
            </button>

            {/* EDIT USER */}

            <button
              type="button"
              onClick={() => onEdit(user)}
              style={{
                width: "100%",
                height: "30px",
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "10px",
                lineHeight: "14px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "#2563eb";
              }}
            >
              <Edit
                style={{
                  width: "12px",
                  height: "12px",
                  flexShrink: 0,
                }}
              />

              Edit User
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

