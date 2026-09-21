
import React from "react";

/* =========================================================
   MONTH-ON-MONTH COLUMNS
========================================================= */

const monthColumns = [
  { label: "Jan", field: "jan" },
  { label: "Feb", field: "feb" },
  { label: "Mar", field: "mar" },
  { label: "Apr", field: "apr" },
  { label: "May", field: "may" },
  { label: "Jun", field: "jun" },
  { label: "Jul", field: "jul" },
  { label: "Aug", field: "aug" },
  { label: "Sep", field: "sep" },
  { label: "Oct", field: "oct" },
  { label: "Nov", field: "nov" },
  { label: "Dec", field: "dec" },
];


/* =========================================================
   HIERARCHY COLUMNS
========================================================= */

const hierarchyColumns = [
  {
    label: "Legal Entity",
    field: "legal_entity",
    width: 180,
  },
  {
    label: "Parent Division",
    field: "parent_division",
    width: 170,
  },
  {
    label: "Sub-Division",
    field: "sub_division",
    width: 170,
  },
];


/* =========================================================
   MONTH VALUE HELPERS
========================================================= */

const isMissingValue = (value) => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "-"
  );
};


/* =========================================================
   FORMAT MONTHLY RECEIVABLE
========================================================= */

const formatReceivable = (
  value,
  currency = "AED"
) => {
  if (isMissingValue(value)) {
    return "N/A";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "N/A";
  }

  return `${currency} ${numericValue.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};


/* =========================================================
   SORT VALUE
========================================================= */

const getSortValue = (row, field) => {
  const value = row?.[field];

  if (isMissingValue(value)) {
    return null;
  }

  if (
    [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].includes(field)
  ) {
    const numericValue = Number(value);

    return Number.isNaN(numericValue)
      ? null
      : numericValue;
  }

  return String(value).toLowerCase();
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DetailedViewTable({
  data = [],
  currency = "AED",
  year = new Date().getFullYear(),
  agingBasis = "Due Date Based",
  page = 1,
  pageSize = 50,
  totalCount = 0,
  onPageChange,
  onSort,
  showPagination = false,
  sortField,
  sortDirection = "asc",
}) {

  /* =======================================================
     TOTAL PAGES
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize)
  );


  /* =======================================================
     START INDEX
  ======================================================= */

  const startIndex =
    (page - 1) * pageSize;


  /* =======================================================
     DISPLAY COLUMNS
  ======================================================= */

  const allColumns = [
    ...hierarchyColumns,
    ...monthColumns,
  ];


  /* =======================================================
     SORT HANDLER
  ======================================================= */

  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };


  /* =======================================================
     SORT ICON
  ======================================================= */

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return "↕";
    }

    return sortDirection === "asc"
      ? "▲"
      : "▼";
  };


  return (
    <div className="flex flex-col h-full overflow-hidden p-2">

      {/* =====================================================
          SECTION HEADING
      ===================================================== */}

      <div className="flex items-center justify-between px-2 pb-2">

        <div>
          <h3 className="m-0 text-[14px] leading-4 font-bold text-slate-900">
            Month-on-Month Receivables – {year}
          </h3>

          <div className="mt-0.5 text-[10px] font-medium text-slate-500">
            {currency}, {agingBasis}
          </div>
        </div>

      </div>


      {/* =====================================================
          TABLE CONTAINER
      ===================================================== */}

      <div className="h-[calc(100%-55px)] overflow-auto border border-slate-200 rounded-lg">

        <table
          className="w-full min-w-[2200px] table-fixed border-collapse"
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <thead className="sticky top-0 bg-slate-50 z-30">

            <tr>

              {/* =============================================
                  HIERARCHY HEADERS
              ============================================= */}

              {hierarchyColumns.map(
                (col, index) => (

                  <th
                    key={col.field}
                    onClick={() =>
                      handleSort(col.field)
                    }
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      position: "sticky",
                      left:
                        index === 0
                          ? 0
                          : index === 1
                            ? hierarchyColumns[0]
                                .width
                            : hierarchyColumns[0]
                                .width +
                              hierarchyColumns[1]
                                .width,
                      zIndex: 40,
                      color: "#061644",
                    }}
                    className="
                      cursor-pointer
                      px-2
                      py-2
                      text-[10px]
                      font-bold
                      text-left
                      bg-slate-50
                      border-b
                      border-r
                      border-slate-200
                      hover:bg-slate-100
                      whitespace-nowrap
                    "
                  >
                    <div className="flex items-center justify-between gap-1">

                      <span>
                        {col.label}
                      </span>

                      <span className="text-[8px] text-slate-400">
                        {getSortIcon(col.field)}
                      </span>

                    </div>
                  </th>

                )
              )}


              {/* =============================================
                  MONTH HEADERS
              ============================================= */}

              {monthColumns.map(
                (col) => (

                  <th
                    key={col.field}
                    onClick={() =>
                      handleSort(col.field)
                    }
                    style={{
                      width: 120,
                      minWidth: 120,
                      color: "#061644",
                    }}
                    className="
                      cursor-pointer
                      px-2
                      py-2
                      text-[10px]
                      font-bold
                      text-right
                      bg-slate-50
                      border-b
                      border-slate-200
                      hover:bg-slate-100
                      whitespace-nowrap
                    "
                  >
                    <div className="flex items-center justify-end gap-1">

                      <span>
                        {col.label}
                      </span>

                      <span className="text-[8px] text-slate-400">
                        {getSortIcon(col.field)}
                      </span>

                    </div>
                  </th>

                )
              )}

            </tr>

          </thead>


          {/* =================================================
              BODY
          ================================================= */}

          <tbody>

            {data.length === 0 ? (

              <tr>

                <td
                  colSpan={allColumns.length}
                  className="
                    py-16
                    text-center
                    text-slate-400
                    text-sm
                  "
                >
                  No Records Available
                </td>

              </tr>

            ) : (

              data.map(
                (row, index) => (

                  <tr
                    key={
                      row.id ??
                      `${row.legal_entity}-${row.parent_division}-${row.sub_division}-${index}`
                    }
                    className={`
                      transition-colors
                      duration-150
                      hover:bg-violet-50
                      ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-slate-50/40"
                      }
                    `}
                  >

                    {/* =======================================
                        LEGAL ENTITY
                    ======================================= */}

                    <td
                      style={{
                        width:
                          hierarchyColumns[0]
                            .width,
                        minWidth:
                          hierarchyColumns[0]
                            .width,
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                      }}
                      className="
                        px-2
                        py-2
                        text-[10px]
                        font-semibold
                        text-slate-900
                        bg-inherit
                        border-r
                        border-slate-100
                        wrap-break-word
                      "
                    >
                      {row.legal_entity ||
                        "N/A"}
                    </td>


                    {/* =======================================
                        PARENT DIVISION
                    ======================================= */}

                    <td
                      style={{
                        width:
                          hierarchyColumns[1]
                            .width,
                        minWidth:
                          hierarchyColumns[1]
                            .width,
                        position: "sticky",
                        left:
                          hierarchyColumns[0]
                            .width,
                        zIndex: 10,
                      }}
                      className="
                        px-2
                        py-2
                        text-[10px]
                        text-slate-700
                        bg-inherit
                        border-r
                        border-slate-100
                        wrap-break-word
                      "
                    >
                      {row.parent_division ||
                        "N/A"}
                    </td>


                    {/* =======================================
                        SUB-DIVISION
                    ======================================= */}

                    <td
                      style={{
                        width:
                          hierarchyColumns[2]
                            .width,
                        minWidth:
                          hierarchyColumns[2]
                            .width,
                        position: "sticky",
                        left:
                          hierarchyColumns[0]
                            .width +
                          hierarchyColumns[1]
                            .width,
                        zIndex: 10,
                      }}
                      className="
                        px-2
                        py-2
                        text-[10px]
                        text-slate-700
                        bg-inherit
                        border-r
                        border-slate-200
                        wrap-break-word
                      "
                    >
                      {row.sub_division ||
                        "N/A"}
                    </td>


                    {/* =======================================
                        MONTHS
                    ======================================= */}

                    {monthColumns.map(
                      (col) => (

                        <td
                          key={col.field}
                          className="
                            px-2
                            py-2
                            text-[10px]
                            text-right
                            font-semibold
                            text-slate-800
                            whitespace-nowrap
                          "
                        >
                          {formatReceivable(
                            row[col.field],
                            currency
                          )}
                        </td>

                      )
                    )}

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {showPagination && (

        <div className="
          h-13.75
          flex
          items-center
          justify-between
          px-3
          mt-2
          border-t
          border-slate-200
          bg-white
        ">

          {/* ===============================================
              LEFT
          =============================================== */}

          <span className="
            text-[12px]
            text-slate-900
            font-bold
          ">

            Showing{" "}

            <span className="font-bold text-slate-700">
              {totalCount === 0
                ? 0
                : startIndex + 1}
            </span>

            {" - "}

            <span className="font-bold text-slate-700">
              {Math.min(
                startIndex + pageSize,
                totalCount
              )}
            </span>

            {" of "}

            <span className="font-bold text-slate-700">
              {totalCount}
            </span>

            {" records"}

          </span>


          {/* ===============================================
              RIGHT
          =============================================== */}

          <div className="
            flex
            items-center
            gap-4
            mr-5
          ">

            <button
              onClick={() =>
                onPageChange &&
                onPageChange(1)
              }
              disabled={page === 1}
              className="
                px-2
                py-1
                text-[12px]
                rounded
                border
                disabled:opacity-40
              "
            >
              {"<<"}
            </button>


            <button
              onClick={() =>
                onPageChange &&
                onPageChange(page - 1)
              }
              disabled={page === 1}
              className="
                px-2
                py-1
                text-[12px]
                rounded
                border
                disabled:opacity-40
              "
            >
              {"<"}
            </button>


            <span className="
              px-3
              py-1
              rounded
              bg-slate-100
              text-[12px]
              font-semibold
            ">
              Page {page} / {totalPages}
            </span>


            <button
              onClick={() =>
                onPageChange &&
                onPageChange(page + 1)
              }
              disabled={
                page === totalPages
              }
              className="
                px-2
                py-1
                text-[11px]
                rounded
                border
                disabled:opacity-40
              "
            >
              {">"}
            </button>


            <button
              onClick={() =>
                onPageChange &&
                onPageChange(totalPages)
              }
              disabled={
                page === totalPages
              }
              className="
                px-2
                py-1
                text-[12px]
                rounded
                border
                disabled:opacity-40
              "
            >
              {">>"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

