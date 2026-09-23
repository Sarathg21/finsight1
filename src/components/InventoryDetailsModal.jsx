import React, { useEffect, useState } from "react";
import { getInventoryDetails, getInventoryExport } from "../api/inventoryApi";
import { Search, X } from "lucide-react";

import InventoryDetailedViewTable from "./Tables/InventoryDetailedViewTable";

export default function InventoryDetailsModal({ open, onClose, filters = {}, drilldownFilters = {} }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ sort_by: "", sort_dir: "asc" });
    const [exporting, setExporting] = useState("");
    
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFetching, setIsFetching] = useState(false);
    
    const pageSize = 50; // Requested by spec

    // Reset page to 1 when filters or modal visibility changes
    useEffect(() => {
        setPage(1);
    }, [open, filters, drilldownFilters]);
    
    useEffect(() => {
        if (!open) {
            setSearch("");
            return;
        }
        const fetchServerData = async () => {
            setIsFetching(true);
            try {
                const response = await getInventoryDetails({
                    ...filters,
                    ...drilldownFilters,
                    page: page,
                    limit: pageSize,
                    search: search || undefined,
                    sort_by: sort.sort_by || undefined,
                    sort_dir: sort.sort_dir || undefined
                });
                
                const rawRows = response.data.rows || response.data.items || [];
                const mappedRows = rawRows.map(row => ({
                    legalEntity: row.legal_entity_name,
                    subDivision: row.subdivision_name,
                    warehouse: row.inv_org_code,
                    category: row.primary_category,
                    itemCode: row.item_code,
                    description: row.item_description,
                    quantity: Number(row.quantity),
                    inventoryValue: Number(row.inventory_value),
                    days0to30: 0, days31to60: 0, days61to90: 0, days91to120: 0,
                    days121to180: 0, days181to365: 0, days366to730: 0, daysAbove730: 0
                }));
                
                setData(mappedRows);
                setTotalCount(response.data.total || response.data.count || 0);
            } catch (err) {
                console.error("View All Fetch Error", err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchServerData();
    }, [open, page, search, sort, filters, drilldownFilters]);
    
    const paginatedData = data;
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
            const response = await getInventoryExport(
                type === "excel" ? "xlsx" : "pdf",
                { ...filters, ...drilldownFilters }
            );
            const blob = new Blob([response.data], {
                type: response.headers["content-type"],
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", type === "excel" ? "Inventory_ViewAll.xlsx" : "Inventory_ViewAll.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export Error:", error);
            alert("Export failed. Please try again.");
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

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={!!exporting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: exporting === 'excel' ? '#d1fae5' : '#f0fdf4',
                                    color: '#15803d', border: '1px solid #bbf7d0',
                                    borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, padding: '5px 10px',
                                    cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1,
                                }}
                            >
                                {exporting === 'excel' ? '...' : 'Excel'}
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={!!exporting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: exporting === 'pdf' ? '#fee2e2' : '#fff1f2',
                                    color: '#be123c', border: '1px solid #fecdd3',
                                    borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, padding: '5px 10px',
                                    cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.7 : 1,
                                }}
                            >
                                {exporting === 'pdf' ? '...' : 'PDF'}
                            </button>
                        </div>

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
                            {isFetching ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', fontSize: '0.85rem' }}>
                                    Loading…
                                </div>
                            ) : (
                                <InventoryDetailedViewTable
                                    data={paginatedData}
                                    onSort={handleSort}
                                    showHeader={false}
                                />
                            )}

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