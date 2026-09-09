import React, { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import InventoryDetailedViewTable from "./Tables/InventoryDetailedViewTable";
import ExportButtons from "./Common/ExportButtons";

export default function InventoryDetailsModal({
    open,
    onClose,
    data = [], onExportExcel,
    onExportPdf,
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({
        sort_by: "",
        sort_dir: "asc",
    });
    const [exporting, setExporting] = useState("");

    const pageSize = 20;

    useEffect(() => {
        if (!open) {
            setSearch("");
            setPage(1);
        }
    }, [open]);

    const filteredData = useMemo(() => {
        let rows = [...data];

        /* Search */
        if (search.trim()) {
            const value = search.toLowerCase();

            rows = rows.filter((row) =>
                Object.values(row).some((item) =>
                    String(item).toLowerCase().includes(value)
                )
            );
        }

        /* Sorting */
        if (sort.sort_by) {
            rows.sort((a, b) => {
                const aVal = a[sort.sort_by];
                const bVal = b[sort.sort_by];

                if (typeof aVal === "number") {
                    return sort.sort_dir === "asc"
                        ? aVal - bVal
                        : bVal - aVal;
                }

                return sort.sort_dir === "asc"
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            });
        }

        return rows;
    }, [data, search, sort]);

    const totalCount = filteredData.length;

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;

        return filteredData.slice(
            start,
            start + pageSize
        );
    }, [filteredData, page]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const handleSort = (field) => {
        let direction = "asc";

        if (
            sort.sort_by === field &&
            sort.sort_dir === "asc"
        ) {
            direction = "desc";
        }

        setSort({
            sort_by: field,
            sort_dir: direction,
        });
    };

    const handleExport = async (type) => {
        try {
            setExporting(type);

            if (type === "excel") {
                await onExportExcel();
            }

            if (type === "pdf") {
                await onExportPdf();
            }

        } catch (error) {
            console.error("Export Error:", error);
        } finally {
            setExporting("");
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;

        setSearch(value);
        setPage(1);
    };

    if (!open) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-9999
                flex
                items-center
                justify-center
                bg-black/40
                backdrop-blur-sm
                p-4
            "
        >

            {/* =====================================================
                MODAL
            ====================================================== */}

            <div
                className="
                    flex
                    h-[88vh]
                    w-[92vw]
                    max-w-375
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                "
            >

                {/* =================================================
                    TOP HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        h-14.5
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        px-5
                    "
                >

                    <h2
                        className="
                            text-[21px]
                            font-bold
                            text-[#081B46]
                        "
                    >
                        Inventory Detailed View
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            text-slate-500
                            transition
                            hover:bg-slate-100
                            hover:text-slate-800
                        "
                    >
                        <X size={19} />
                    </button>

                </div>


                {/* =================================================
                    SEARCH / EXPORT TOOLBAR
                ================================================= */}

                <div
                    className="
                        flex
                        shrink-0
                        items-center
                        justify-between
                        border-b
                        border-slate-200
                        px-5
                        py-3
                    "
                >

                    {/* Search */}

                    <div className="relative w-150">

                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search customer..."
                            style={{
                                paddingLeft: "42px"
                            }}
                            className="h-10 w-full rounded-lg border border-slate-300"
                        />

                    </div>


                    {/* RECORDS + EXPORT */}

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <span
                            className="
                                text-[12px]
                                font-medium
                                text-slate-500
                            "
                        >
                            {totalCount} Records
                        </span>

                        <ExportButtons
                            endpoint="inventory"
                            exporting={exporting}
                            handleExport={handleExport}
                        />

                    </div>

                </div>


                {/* =================================================
                    TABLE AREA
                ================================================= */}

                <div
                    className="
                        min-h-0
                        flex-1
                        px-0
                        py-3
                    "
                >

                    <div
                        className="
                            h-full
                            w-full
                            overflow-hidden
                            rounded-xl
                            border
                            border-slate-200
                        "
                    >

                        <div
                            className="
                                h-full
                                w-full
                                overflow-auto
                            "
                        >

                            <InventoryDetailedViewTable
                                data={paginatedData}
                                onSort={handleSort}
                                showHeader={false}
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}
                <div
                    className="
                      flex
                      h-12
                      shrink-0
                      items-center
                      justify-between
                      border-t
                      border-slate-200
                      px-5
                  "
                >
                    <span
                        style={{ fontWeight: 700 }}
                        className="text-[12px] text-slate-900"
                    >
                        Page {page} of {Math.max(totalPages, 1)}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="
                             rounded-md
                             border
                             border-slate-300
                             px-3
                             py-1.5
                             text-[12px]
                             text-slate-900
                             transition
                             hover:bg-slate-50
                             disabled:cursor-not-allowed
                             disabled:opacity-40
                         "
                        >
                            <span style={{ fontWeight: "900" }}>
                                Previous
                            </span>
                        </button>
                        <button
                            type="button"
                            disabled={
                                page === totalPages ||
                                totalPages === 0
                            }
                            onClick={() => setPage((p) => p + 1)}
                            className="
                            rounded-md
                            border
                            border-slate-300
                            px-3
                            py-1.5
                            text-[12px]
                            text-slate-900
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        >
                            <span style={{ fontWeight: "900" }}>
                                Next
                            </span>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}