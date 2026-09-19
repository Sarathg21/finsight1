import React, { useMemo, useState } from "react";
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaFilter,
  FaSearch,
  FaSyncAlt,
  FaCalendarAlt,
  FaFileExport,
  FaFileExcel,
  FaFilePdf,
  FaClock,
  FaDatabase,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUserCircle,
  FaHome,
  FaChartLine,
  FaBalanceScale,
  FaReceipt,
  FaBoxes,
  FaUsers,
  FaCog,
  FaShieldAlt,
  FaDatabase as FaMasterData,
  FaTimes,
} from "react-icons/fa";

const BLUE = "#173b8f";
const PRIMARY = "#4f46e5";
const DARK_BLUE = "#06265f";
const BORDER = "#e3e9f3";
const MUTED = "#64748b";

const mockRows = [
  {
    id: 1,
    legalEntity: "Alpine Coils",
    parentDivision: "Alpine",
    subDivision: "Coils BU",
    supplierCode: "SUP1001",
    supplierName: "Alpha Supplies LLC",
    country: "UAE",
    currency: "USD",
    totalPayables: 18245320,
    current: 11230400,
    d0_30: 3120500,
    d31_60: 2450300,
    d61_90: 980200,
    d91_120: 420000,
    d121_180: 210000,
    d181_365: -120080,
    above365: -46000,
  },
  {
    id: 2,
    legalEntity: "DC Serve",
    parentDivision: "DC Serve",
    subDivision: "Service BU",
    supplierCode: "SUP1002",
    supplierName: "Global Industrial Co",
    country: "Germany",
    currency: "EUR",
    totalPayables: 12678450,
    current: 7560230,
    d0_30: 2345100,
    d31_60: 1890450,
    d61_90: 636220,
    d91_120: 120400,
    d121_180: 188000,
    d181_365: -50320,
    above365: -11630,
  },
  {
    id: 3,
    legalEntity: "Filter Fan",
    parentDivision: "Filter Fan",
    subDivision: "Fans BU",
    supplierCode: "SUP1003",
    supplierName: "TechParts Trading",
    country: "China",
    currency: "CNY",
    totalPayables: 9482170,
    current: 5210000,
    d0_30: 1980300,
    d31_60: 1255600,
    d61_90: 640150,
    d91_120: 310400,
    d121_180: 142700,
    d181_365: -36980,
    above365: -20000,
  },
  {
    id: 4,
    legalEntity: "Alpine Gears",
    parentDivision: "Alpine",
    subDivision: "Gears BU",
    supplierCode: "SUP1004",
    supplierName: "Metro Equipment FZE",
    country: "UAE",
    currency: "AED",
    totalPayables: 8306720,
    current: 4980120,
    d0_30: 1650400,
    d31_60: 820300,
    d61_90: 522600,
    d91_120: 280500,
    d121_180: 150000,
    d181_365: -70180,
    above365: -6900,
  },
  {
    id: 5,
    legalEntity: "Emirates Trading",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1005",
    supplierName: "Emirates Industrial",
    country: "UAE",
    currency: "USD",
    totalPayables: 7954310,
    current: 4120600,
    d0_30: 1730200,
    d31_60: 1222400,
    d61_90: 510300,
    d91_120: 260800,
    d121_180: 136400,
    d181_365: -48070,
    above365: 22310,
  },
  {
    id: 6,
    legalEntity: "Precision Materials",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1006",
    supplierName: "Precision Materials",
    country: "USA",
    currency: "USD",
    totalPayables: 6718450,
    current: 3650800,
    d0_30: 1420600,
    d31_60: 980220,
    d61_90: 420310,
    d91_120: 180500,
    d121_180: 120000,
    d181_365: -35180,
    above365: -18580,
  },
  {
    id: 7,
    legalEntity: "Union Hardware",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1007",
    supplierName: "Union Hardware LLC",
    country: "UAE",
    currency: "AED",
    totalPayables: 5982330,
    current: 3210600,
    d0_30: 1140300,
    d31_60: 820400,
    d61_90: 420600,
    d91_120: 230200,
    d121_180: 140300,
    d181_365: -32180,
    above365: -7290,
  },
  {
    id: 8,
    legalEntity: "Star Components",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1008",
    supplierName: "Star Components",
    country: "India",
    currency: "INR",
    totalPayables: 5141220,
    current: 2960500,
    d0_30: 950200,
    d31_60: 720600,
    d61_90: 310400,
    d91_120: 150300,
    d121_180: 90200,
    d181_365: -28600,
    above365: -22380,
  },
  {
    id: 9,
    legalEntity: "Al Noor Trading",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1009",
    supplierName: "Al Noor Trading",
    country: "UAE",
    currency: "AED",
    totalPayables: 4760550,
    current: 2540600,
    d0_30: 880600,
    d31_60: 620100,
    d61_90: 350400,
    d91_120: 220300,
    d121_180: 130400,
    d181_365: -18100,
    above365: 37450,
  },
  {
    id: 10,
    legalEntity: "Rapid Parts",
    parentDivision: "Others",
    subDivision: "Others",
    supplierCode: "SUP1010",
    supplierName: "Rapid Parts LLC",
    country: "UK",
    currency: "GBP",
    totalPayables: 4608770,
    current: 2180400,
    d0_30: 820500,
    d31_60: 610200,
    d61_90: 280600,
    d91_120: 180400,
    d121_180: 110300,
    d181_365: -12600,
    above365: 438970,
  },
];

/* ============================================================
   HELPERS
============================================================ */

const formatNumber = (value) => {
  const number = Number(value || 0);

  if (number < 0) {
    return `(${Math.abs(number).toLocaleString("en-US")})`;
  }

  return number.toLocaleString("en-US");
};

const formatMillions = (value) => {
  const number = Number(value || 0);
  return `AED ${(number / 1000000).toFixed(2)}M`;
};

const SelectField = ({
  label,
  value,
  options,
  onChange,
  width = 145,
}) => {
  return (
    <div style={{ width, minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#29468d",
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 39,
            border: "1px solid #d8e1ef",
            borderRadius: 7,
            background: "#ffffff",
            color: "#29468d",
            padding: "0 30px 0 11px",
            fontSize: 11,
            fontWeight: 700,
            outline: "none",
            appearance: "none",
            cursor: "pointer",
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <FaChevronDown
          size={10}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: BLUE,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
};

/* ============================================================
   SIDEBAR
============================================================ */

function Sidebar() {
  const [payablesOpen, setPayablesOpen] = useState(true);

  const menuItem = (
    icon,
    label,
    active = false,
    arrow = false,
    onClick = undefined
  ) => (
    <div
      onClick={onClick}
      style={{
        height: 37,
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "0 13px",
        margin: "2px 8px",
        borderRadius: 7,
        background: active ? "#5146df" : "transparent",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: active ? 800 : 600,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 18,
          display: "flex",
          justifyContent: "center",
          opacity: active ? 1 : 0.9,
        }}
      >
        {icon}
      </span>

      <span style={{ flex: 1 }}>{label}</span>

      {arrow && (
        <FaChevronDown
          size={9}
          style={{
            transform: active ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      )}
    </div>
  );

  return (
    <aside
      style={{
        width: 227,
        minWidth: 227,
        height: "100vh",
        background: "#06265f",
        color: "#ffffff",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflowY: "auto",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 76,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#6257ef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 900,
            marginRight: 9,
          }}
        >
          FJ
        </div>

        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            FinSight
          </div>

          <div
            style={{
              fontSize: 8,
              color: "#c7d4f7",
              marginTop: 5,
            }}
          >
            Financial Intelligence at Your Fingertips
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "17px 0",
        }}
      >
        <div
          style={{
            padding: "0 18px",
            color: "#d4def5",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.7,
            marginBottom: 7,
          }}
        >
          MAIN MENU
        </div>

        {menuItem(<FaHome />, "Dashboard")}
        {menuItem(<FaChartLine />, "Sales Revenue Report")}
        {menuItem(<FaBalanceScale />, "Profit & Loss Account")}
        {menuItem(<FaReceipt />, "Balance Sheet")}
        {menuItem(<FaReceipt />, "Receivables Report")}

        {menuItem(
          <FaReceipt />,
          "Payable Report",
          true,
          true,
          () => setPayablesOpen((prev) => !prev)
        )}

        {payablesOpen && (
          <div
            style={{
              margin: "0 0 6px 44px",
              borderLeft: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            {[
              "Top 10 Vendors",
              "Payable Aging Report",
              "Overdue Report",
              "Payment Run Report",
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  height: 31,
                  display: "flex",
                  alignItems: "center",
                  color: index === 1 ? "#ffffff" : "#c6d2ef",
                  fontSize: 10,
                  fontWeight: index === 1 ? 700 : 500,
                  paddingLeft: 15,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: -1,
                    width: 9,
                    height: 1,
                    background: "rgba(255,255,255,0.25)",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        )}

        {menuItem(<FaBoxes />, "Inventory Report", false, true)}
        {menuItem(<FaChartLine />, "Working Capital Report", false, true)}
        {menuItem(<FaClock />, "Short Term Financing", false, true)}
        {menuItem(<FaChartLine />, "Investment Analysis", false, true)}
        {menuItem(<FaUsers />, "Sales Engineer Performance", false, true)}

        <div
          style={{
            padding: "17px 18px 6px",
            color: "#d4def5",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.7,
          }}
        >
          MANAGEMENT
        </div>

        {menuItem(<FaDatabase />, "Data Management", false, true)}
        {menuItem(<FaUsers />, "User Management")}
        {menuItem(<FaShieldAlt />, "Role Management")}
        {menuItem(<FaShieldAlt />, "Access Control")}
        {menuItem(<FaCog />, "System Settings")}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 52,
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          color: "#d8e1f5",
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        <FaChevronLeft size={11} style={{ marginRight: 8 }} />
        Collapse Menu
      </div>
    </aside>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({ icon, title, value, iconBackground, iconColor }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: `1px solid ${BORDER}`,
        borderRadius: 7,
        minHeight: 78,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        boxShadow: "0 1px 5px rgba(31, 54, 90, 0.04)",
      }}
    >
      <div
        style={{
          width: 39,
          height: 39,
          minWidth: 39,
          borderRadius: "50%",
          background: iconBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor,
          fontSize: 16,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: 10,
            color: "#15966f",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 18,
            color: "#122c75",
            fontWeight: 900,
            letterSpacing: -0.3,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE
============================================================ */

function PayablesTable({ rows }) {
  const columns = [
    ["legalEntity", "Legal Entity"],
    ["parentDivision", "Parent Division"],
    ["subDivision", "Sub-Division"],
    ["supplierCode", "Supplier Code"],
    ["supplierName", "Supplier Name"],
    ["country", "Country"],
    ["currency", "Currency"],
    ["totalPayables", "Total Payables"],
    ["current", "Current"],
    ["d0_30", "0 – 30"],
    ["d31_60", "31 – 60"],
    ["d61_90", "61 – 90"],
    ["d91_120", "91 – 120"],
    ["d121_180", "121 – 180"],
    ["d181_365", "181 – 365"],
    ["above365", "Above 365"],
  ];

  const numericColumns = new Set([
    "totalPayables",
    "current",
    "d0_30",
    "d31_60",
    "d61_90",
    "d91_120",
    "d121_180",
    "d181_365",
    "above365",
  ]);

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        border: "1px solid #dfe6f0",
        borderRadius: 6,
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: 1220,
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontSize: 10,
        }}
      >
        <thead>
          <tr>
            {columns.map(([key, label], index) => (
              <th
                key={key}
                style={{
                  background: "#eaf2ff",
                  color: "#214395",
                  fontWeight: 800,
                  padding: "10px 6px",
                  borderRight: "1px solid #dbe5f3",
                  borderBottom: "1px solid #d7e1ef",
                  textAlign: numericColumns.has(key)
                    ? "right"
                    : "left",
                  whiteSpace: "nowrap",
                  width:
                    index < 3
                      ? 78
                      : key === "supplierName"
                        ? 125
                        : numericColumns.has(key)
                          ? 91
                          : 76,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: numericColumns.has(key)
                      ? "flex-end"
                      : "space-between",
                    gap: 4,
                  }}
                >
                  <span>{label}</span>
                  <FaChevronUp
                    size={7}
                    style={{
                      opacity: 0.65,
                    }}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              style={{
                background:
                  rowIndex % 2 === 0 ? "#ffffff" : "#f5f8fd",
              }}
            >
              {columns.map(([key]) => {
                const isNumber = numericColumns.has(key);
                const value = row[key];

                return (
                  <td
                    key={key}
                    style={{
                      padding: "8px 6px",
                      borderRight: "1px solid #e4eaf2",
                      borderBottom: "1px solid #e7edf5",
                      color:
                        isNumber && Number(value) < 0
                          ? "#b91c1c"
                          : "#29468d",
                      fontWeight:
                        key === "supplierName" ||
                        key === "totalPayables"
                          ? 600
                          : 500,
                      textAlign: isNumber
                        ? "right"
                        : "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {isNumber
                      ? formatNumber(value)
                      : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function PayablesViewAll() {
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [legalGroup, setLegalGroup] =
    useState("FJ Group (Consolidated)");

  const [legalEntity, setLegalEntity] =
    useState("All");

  const [parentDivision, setParentDivision] =
    useState("All");

  const [subDivision, setSubDivision] =
    useState("All");

  const [currency, setCurrency] =
    useState("AED");

  const [asOnDate, setAsOnDate] =
    useState("2024-04-30");

  const [agingBasis, setAgingBasis] =
    useState("Due Date");

  const [search, setSearch] = useState("");

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [applied, setApplied] = useState(false);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return mockRows;

    return mockRows.filter((row) =>
      [
        row.legalEntity,
        row.parentDivision,
        row.subDivision,
        row.supplierCode,
        row.supplierName,
        row.country,
        row.currency,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const totalRecords = 4152;

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRows.length / rowsPerPage)
  );

  const safePage = Math.min(
    currentPage,
    pageCount
  );

  const visibleRows = filteredRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const fromRecord =
    filteredRows.length === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const toRecord = Math.min(
    safePage * rowsPerPage,
    filteredRows.length
  );

  const handleApply = () => {
    setApplied(true);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setLegalGroup("FJ Group (Consolidated)");
    setLegalEntity("All");
    setParentDivision("All");
    setSubDivision("All");
    setCurrency("AED");
    setAsOnDate("2024-04-30");
    setAgingBasis("Due Date");
    setSearch("");
    setCurrentPage(1);
    setApplied(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f9fd",
        color: "#12213f",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <Sidebar />

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main
        style={{
          marginLeft: 227,
          minHeight: "100vh",
          padding: "0 15px 25px",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            height: 76,
            background: "#ffffff",
            margin: "0 -15px",
            padding: "0 19px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e6ebf3",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 17,
            }}
          >
            <FaBars
              size={17}
              color="#64748b"
              style={{ cursor: "pointer" }}
            />

            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#0d2d77",
                  fontSize: 24,
                  lineHeight: 1,
                  fontWeight: 900,
                  letterSpacing: -0.7,
                }}
              >
                Payables View All
              </h1>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 11,
                  color: "#7b8aa6",
                }}
              >
                Review complete payable balances and aging
                details for the selected snapshot.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <button
              style={{
                height: 32,
                padding: "0 15px",
                borderRadius: 5,
                border: "1px solid #4f46e5",
                background: "#4f46e5",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
              }}
            >
              Export
              <FaChevronDown size={8} />
            </button>

            <button
              style={{
                height: 32,
                padding: "0 13px",
                borderRadius: 5,
                border: "1px solid #cfd7ea",
                background: "#ffffff",
                color: "#384f96",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <FaCalendarAlt size={11} />
              Schedule
            </button>

            <button
              style={{
                width: 37,
                height: 32,
                borderRadius: 5,
                border: "1px solid #cfd7ea",
                background: "#ffffff",
                color: "#4f46e5",
                cursor: "pointer",
              }}
            >
              <FaSyncAlt size={12} />
            </button>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              AK
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#61708e",
                }}
              >
                <div
                  style={{
                    color: "#33477d",
                    fontWeight: 700,
                  }}
                >
                  Welcome,
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#122b72",
                  }}
                >
                  Admin
                </div>
              </div>

              <FaChevronDown
                size={9}
                color="#4b5e8d"
              />
            </div>

            <div
              style={{
                position: "relative",
                marginLeft: 5,
              }}
            >
              <FaBell
                size={17}
                color="#334b8b"
              />

              <span
                style={{
                  position: "absolute",
                  top: -3,
                  right: -4,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
            </div>
          </div>
        </header>

        {/* ==================================================
            FILTER CARD
        ================================================== */}

        <section
          style={{
            marginTop: 10,
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 7,
            boxShadow:
              "0 2px 9px rgba(34, 56, 100, 0.04)",
          }}
        >
          <div
            style={{
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              borderBottom: filtersOpen
                ? "1px solid #edf1f6"
                : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                color: BLUE,
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              <FaFilter
                size={14}
                color="#4f46e5"
              />
              Filters
            </div>

            <button
              onClick={() =>
                setFiltersOpen((prev) => !prev)
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#4f46e5",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {filtersOpen
                ? "Collapse Filters"
                : "Expand Filters"}

              {filtersOpen ? (
                <FaChevronUp size={9} />
              ) : (
                <FaChevronDown size={9} />
              )}
            </button>
          </div>

          {filtersOpen && (
            <div
              style={{
                padding: "12px 15px 15px",
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <SelectField
                label="Legal Group"
                value={legalGroup}
                onChange={setLegalGroup}
                options={[
                  "FJ Group (Consolidated)",
                  "FJ Group",
                  "Other Groups",
                ]}
                width={140}
              />

              <SelectField
                label="Legal Entity"
                value={legalEntity}
                onChange={setLegalEntity}
                options={[
                  "All",
                  "Alpine Coils",
                  "DC Serve",
                  "Filter Fan",
                  "Alpine Gears",
                  "Emirates Trading",
                  "Precision Materials",
                ]}
                width={140}
              />

              <SelectField
                label="Parent Division"
                value={parentDivision}
                onChange={setParentDivision}
                options={[
                  "All",
                  "Alpine",
                  "DC Serve",
                  "Filter Fan",
                  "Others",
                ]}
                width={140}
              />

              <SelectField
                label="Sub-Division"
                value={subDivision}
                onChange={setSubDivision}
                options={[
                  "All",
                  "Coils BU",
                  "Service BU",
                  "Fans BU",
                  "Gears BU",
                  "Others",
                ]}
                width={140}
              />

              <SelectField
                label="Reporting Currency"
                value={currency}
                onChange={setCurrency}
                options={[
                  "AED",
                  "USD",
                  "EUR",
                  "INR",
                  "GBP",
                ]}
                width={140}
              />

              <div style={{ width: 140 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#29468d",
                    marginBottom: 5,
                  }}
                >
                  As On Date
                </div>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <input
                    type="date"
                    value={asOnDate}
                    onChange={(e) =>
                      setAsOnDate(e.target.value)
                    }
                    style={{
                      width: "100%",
                      height: 39,
                      boxSizing: "border-box",
                      border: "1px solid #d8e1ef",
                      borderRadius: 7,
                      background: "#ffffff",
                      color: "#29468d",
                      padding: "0 9px",
                      fontSize: 11,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <SelectField
                label="Aging Basis"
                value={agingBasis}
                onChange={setAgingBasis}
                options={[
                  "Due Date",
                  "Invoice Date",
                ]}
                width={140}
              />

              <button
                onClick={handleApply}
                style={{
                  height: 39,
                  minWidth: 82,
                  border: "none",
                  borderRadius: 7,
                  background: "#4f46e5",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow:
                    "0 3px 7px rgba(79,70,229,0.22)",
                }}
              >
                Apply
              </button>

              <button
                onClick={handleReset}
                style={{
                  height: 39,
                  minWidth: 74,
                  border: "1px solid #d9dfeb",
                  borderRadius: 7,
                  background: "#ffffff",
                  color: "#334b8a",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            </div>
          )}
        </section>

        {/* ==================================================
            KPI CARDS
        ================================================== */}

        <section
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns:
              "1.05fr 1.05fr 1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              borderRadius: 7,
              minHeight: 78,
              display: "flex",
              alignItems: "center",
              padding: "0 15px",
              gap: 13,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#edf4ff",
                color: "#1d6be5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaReceipt size={17} />
            </div>

            <div
              style={{
                color: "#142f79",
                fontWeight: 900,
                fontSize: 19,
              }}
            >
              4,152 records
            </div>
          </div>

          <KpiCard
            icon={<FaMoneyBillWave />}
            title="Total Payables"
            value="AED 192.29M"
            iconBackground="#e8fff4"
            iconColor="#16a56e"
          />

          <KpiCard
            icon={<FaDatabase />}
            title="Current"
            value="AED 119.26M"
            iconBackground="#e8fff4"
            iconColor="#159b70"
          />

          <KpiCard
            icon={<FaClock />}
            title="Overdue"
            value="AED 73.03M"
            iconBackground="#fff5e6"
            iconColor="#f59e0b"
          />

          <KpiCard
            icon={<FaExclamationTriangle />}
            title="Overdue > 90 Days"
            value="AED 24.13M"
            iconBackground="#fff0f3"
            iconColor="#ef476f"
          />
        </section>

        {/* ==================================================
            TABLE CARD
        ================================================== */}

        <section
          style={{
            marginTop: 14,
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            borderRadius: 7,
            padding: "14px 14px 10px",
            boxShadow:
              "0 2px 10px rgba(28, 49, 88, 0.04)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 12,
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#142f79",
                }}
              >
                All Payables
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 10,
                  color: "#69799b",
                }}
              >
                <strong>Aging basis:</strong>{" "}
                {agingBasis}
                <span
                  style={{
                    margin: "0 9px",
                    color: "#a2acc0",
                  }}
                >
                  |
                </span>
                <strong>Snapshot:</strong>{" "}
                30 Apr 2024
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Search */}
              <div
                style={{
                  width: 245,
                  height: 33,
                  border: "1px solid #d9e1ed",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  gap: 8,
                }}
              >
                <FaSearch
                  size={12}
                  color="#4b63a0"
                />

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search supplier"
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 10,
                    color: "#29468d",
                    minWidth: 0,
                  }}
                />

                {search && (
                  <FaTimes
                    size={10}
                    color="#94a3b8"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>

              {/* Rows */}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(
                    Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
                style={{
                  width: 110,
                  height: 33,
                  border: "1px solid #d9e1ed",
                  borderRadius: 6,
                  background: "#ffffff",
                  color: "#29468d",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "0 9px",
                  outline: "none",
                }}
              >
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </select>

              <button
                disabled={safePage <= 1}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color:
                    safePage <= 1
                      ? "#c3ccdb"
                      : "#304993",
                  cursor:
                    safePage <= 1
                      ? "default"
                      : "pointer",
                }}
              >
                <FaChevronLeft size={11} />
              </button>

              <span
                style={{
                  color: "#344c92",
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {fromRecord} – {toRecord} of{" "}
                {totalRecords.toLocaleString()}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      pageCount,
                      p + 1
                    )
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#304993",
                  cursor: "pointer",
                }}
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>

          <PayablesTable rows={visibleRows} />

          {/* ==================================================
              BOTTOM PAGINATION
          ================================================== */}

          <div
            style={{
              height: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #eef2f7",
            }}
          >
            <div
              style={{
                color: "#536b9f",
                fontSize: 10,
              }}
            >
              Values shown in selected reporting
              currency
              <span
                style={{
                  margin: "0 9px",
                  color: "#b0b9c9",
                }}
              >
                |
              </span>
              Source: Oracle Fusion Cloud
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
              }}
            >
              <button
                disabled={safePage <= 1}
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color:
                    safePage <= 1
                      ? "#c6cfdd"
                      : "#334b8d",
                  cursor: "pointer",
                }}
              >
                <FaChevronLeft size={11} />
              </button>

              <span
                style={{
                  color: "#344c92",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {fromRecord} – {toRecord} of{" "}
                {totalRecords.toLocaleString()}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      pageCount,
                      p + 1
                    )
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#334b8d",
                  cursor: "pointer",
                }}
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>
        </section>

        {/* Applied indicator */}
        {applied && (
          <div
            style={{
              position: "fixed",
              right: 18,
              bottom: 18,
              background: "#173b8f",
              color: "#ffffff",
              borderRadius: 6,
              padding: "8px 13px",
              fontSize: 10,
              fontWeight: 700,
              boxShadow:
                "0 5px 20px rgba(23,59,143,0.25)",
              zIndex: 50,
            }}
          >
            Filters applied
          </div>
        )}
      </main>
    </div>
  );
}