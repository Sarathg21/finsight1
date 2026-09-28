

import StatusBadge from "../StatusBadge";

export default function ChildItemsTable({
    title,
    items = [],
    total,
    columns = [],
    onViewAll,
    emptyMessage = "No records found",
    showStatus = true,
    scrollHeight = "145px",
}) {
    const count = total ?? items.length;

    const totalColumns =
        columns.length + (showStatus ? 1 : 0);

    return (
        <div
            style={{
                width: "100%",

                /* REDUCED TABLE HEIGHT */
                height: "145px",
                minHeight: "145px",
                maxHeight: "145px",

                display: "flex",
                flexDirection: "column",

                overflow: "hidden",

                border: "1px solid #e5e7eb",
                borderRadius: "8px",

                backgroundColor: "#ffffff",

                boxSizing: "border-box",
            }}
        >
            {/* =====================================================
                HEADER - FIXED
            ===================================================== */}

            <div
                style={{
                    width: "100%",
                    height: "30px",
                    minHeight: "30px",
                    maxHeight: "30px",

                    flexShrink: 0,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",

                    padding: "0 8px",

                    backgroundColor: "#ffffff",

                    borderBottom:
                        "1px solid #e5e7eb",

                    boxSizing: "border-box",
                }}
            >
                {/* TITLE */}

                <h3
                    style={{
                        margin: 0,
                        padding: 0,

                        fontSize: "11px",
                        lineHeight: "14px",
                        fontWeight: 600,

                        color: "#111827",

                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",

                        minWidth: 0,
                    }}
                >
                    {title} ({count})
                </h3>

                {/* VIEW ALL */}

                {onViewAll && (
                    <button
                        type="button"
                        onClick={onViewAll}
                        style={{
                            margin: 0,
                            marginLeft: "8px",

                            padding: 0,

                            border: "none",
                            background: "transparent",

                            fontSize: "9px",
                            lineHeight: "12px",
                            fontWeight: 500,

                            color: "#2563eb",

                            cursor: "pointer",

                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration =
                                "underline";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration =
                                "none";
                        }}
                    >
                        View All
                    </button>
                )}
            </div>

            {/* =====================================================
                TABLE AREA
                REDUCED FROM 130px TO 90px
            ===================================================== */}

            <div
                style={{
                    width: "100%",

                    /* REDUCED SCROLL AREA */
                    height: "90px",
                    minHeight: 0,

                    flex: "1 1 auto",

                    overflowX: "auto",
                    overflowY: "auto",

                    boxSizing: "border-box",

                    scrollbarWidth: "thin",

                    margin: 0,
                    padding: 0,
                }}
            >
                <table
                    style={{
                        width: "100%",
                        minWidth: "max-content",

                        borderCollapse: "collapse",
                        borderSpacing: 0,

                        tableLayout: "auto",

                        margin: 0,
                        padding: 0,
                    }}
                >
                    {/* =================================================
                        COLUMN HEADER
                    ================================================= */}

                    <thead>
                        <tr
                            style={{
                                height: "25px",
                                margin: 0,
                                padding: 0,
                            }}
                        >
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 10,

                                        height: "25px",
                                        minHeight: "25px",

                                        padding: "3px 8px",

                                        margin: 0,

                                        backgroundColor:
                                            "#f9fafb",

                                        borderBottom:
                                            "1px solid #e5e7eb",

                                        fontSize: "10px",
                                        lineHeight: "13px",
                                        fontWeight: 600,

                                        color: "#374151",

                                        textAlign: "left",

                                        whiteSpace:
                                            "nowrap",

                                        boxSizing:
                                            "border-box",
                                    }}
                                >
                                    {col.label}
                                </th>
                            ))}

                            {showStatus && (
                                <th
                                    style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 10,

                                        height: "25px",
                                        minHeight: "25px",

                                        padding: "3px 8px",

                                        margin: 0,

                                        backgroundColor:
                                            "#f9fafb",

                                        borderBottom:
                                            "1px solid #e5e7eb",

                                        fontSize: "10px",
                                        lineHeight: "13px",
                                        fontWeight: 600,

                                        color: "#374151",

                                        textAlign: "left",

                                        whiteSpace:
                                            "nowrap",

                                        boxSizing:
                                            "border-box",
                                    }}
                                >
                                    Status
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* =================================================
                        DATA
                    ================================================= */}

                    <tbody
                        style={{
                            margin: 0,
                            padding: 0,
                        }}
                    >
                        {items.length === 0 ? (
                            <tr
                                style={{
                                    margin: 0,
                                    padding: 0,
                                }}
                            >
                                <td
                                    colSpan={totalColumns}
                                    style={{
                                        height: "45px",

                                        padding:
                                            "10px 8px",

                                        margin: 0,

                                        textAlign:
                                            "center",

                                        fontSize: "10px",
                                        lineHeight: "13px",

                                        color: "#6b7280",

                                        boxSizing:
                                            "border-box",
                                    }}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            items.map(
                                (item, index) => (
                                    <tr
                                        key={
                                            item.id ??
                                            item.subdivision_id ??
                                            item.business_unit_id ??
                                            item.analysis_code_id ??
                                            index
                                        }
                                        style={{
                                            height: "21px",
                                            minHeight: "21px",

                                            margin: 0,
                                            padding: 0,

                                            borderBottom:
                                                "1px solid #f3f4f6",

                                            backgroundColor:
                                                "#ffffff",
                                        }}
                                        onMouseEnter={(
                                            e
                                        ) => {
                                            e.currentTarget.style.backgroundColor =
                                                "#f9fafb";
                                        }}
                                        onMouseLeave={(
                                            e
                                        ) => {
                                            e.currentTarget.style.backgroundColor =
                                                "#ffffff";
                                        }}
                                    >
                                        {columns.map(
                                            (col) => (
                                                <td
                                                    key={
                                                        col.key
                                                    }
                                                    style={{
                                                        height: "21px",

                                                        padding:
                                                            "2px 8px",

                                                        margin: 0,

                                                        fontSize:
                                                            "9px",

                                                        lineHeight:
                                                            "12px",

                                                        color:
                                                            "#374151",

                                                        verticalAlign:
                                                            "middle",

                                                        whiteSpace:
                                                            "nowrap",

                                                        boxSizing:
                                                            "border-box",
                                                    }}
                                                >
                                                    {
                                                        item[
                                                            col
                                                                .key
                                                        ] ??
                                                            "-"
                                                    }
                                                </td>
                                            )
                                        )}

                                        {showStatus && (
                                            <td
                                                style={{
                                                    height: "21px",

                                                    padding:
                                                        "2px 8px",

                                                    margin: 0,

                                                    verticalAlign:
                                                        "middle",

                                                    whiteSpace:
                                                        "nowrap",

                                                    boxSizing:
                                                        "border-box",
                                                }}
                                            >
                                                <StatusBadge
                                                    label={
                                                        item.status ??
                                                        (item.active
                                                            ? "Active"
                                                            : "Inactive")
                                                    }
                                                    tone={
                                                        item.active ===
                                                        false
                                                            ? "red"
                                                            : "green"
                                                    }
                                                />
                                            </td>
                                        )}
                                    </tr>
                                )
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* =====================================================
                FOOTER - FIXED
            ===================================================== */}

            <div
                style={{
                    width: "100%",

                    height: "25px",
                    minHeight: "25px",
                    maxHeight: "25px",

                    flexShrink: 0,

                    display: "flex",
                    alignItems: "center",

                    padding: "0 8px",

                    margin: 0,

                    backgroundColor: "#ffffff",

                    borderTop:
                        "1px solid #e5e7eb",

                    boxSizing: "border-box",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        padding: 0,

                        fontSize: "8px",
                        lineHeight: "11px",
                        fontWeight: 600,

                        color: "#6b7280",
                    }}
                >
                    Showing {items.length} of {count}
                </p>
            </div>
        </div>
    );
}

