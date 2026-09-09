
import React, { useEffect, useState } from "react";
import {
    Search,
    X,
} from "lucide-react";

import DetailedViewTable from "./Tables/DetailedViewTable";
import ExportButtons from "../components/Common/ExportButtons";
import {
    getReceivableDetails,
    getReceivableExport,
} from "../api/recevablesApi";

export default function ReceivablesDetailsModal({
    open,
    onClose,
    filters = {},
}) {
    const [detailsData, setDetailsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 20;

    const [totalCount, setTotalCount] = useState(0);

    const [search, setSearch] = useState("");

    const [sort, setSort] = useState({
        sort_by: "customer_name",
        sort_dir: "asc",
    });

    useEffect(() => {
        if (open) {
            fetchDetails();
        }
    }, [open, page, sort]);

    const fetchDetails = async (currentPage = page) => {
        try {
            setLoading(true);

            const response = await getReceivableDetails({
                ...filters,
                page: currentPage,
                page_size: pageSize,
                search,
                sort_by: sort.sort_by,
                sort_dir: sort.sort_dir,
            });

            setDetailsData(response?.data?.data?.rows || []);
            setTotalCount(response?.data?.data?.total_count || 0);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleSearchKey = (e) => {
        if (e.key === "Enter") {
            setPage(1);
            fetchDetails(1, search);
        }
    };

    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);
    };

    const handleExport = async (type) => {
        try {
            setExporting(type);

            const response = await getReceivableExport(type, {
                ...filters,
                search,
                sort_by: sort.sort_by,
                sort_dir: sort.sort_dir,
            });

            downloadFile(
                response.data,
                type === "excel"
                    ? "Receivables.xlsx"
                    : "Receivables.pdf"
            );

        } catch (err) {
            console.error(err);
        } finally {
            setExporting("");
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;

        setSearch(value);
        setPage(1);
    };

    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            fetchDetails(1, search);
        }, 500);

        return () => clearTimeout(timer);

    }, [search]);

    const handlePage = (newPage) => {
        setPage(newPage);
    };

    const handleSort = (field) => {
        let direction = "desc";

        if (
            sort.sort_by === field &&
            sort.sort_dir === "desc"
        ) {
            direction = "asc";
        }

        setSort({
            sort_by: field,
            sort_dir: direction,
        });

        setPage(1);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/35 backdrop-blur-sm">

            {/* Modal */}

            <div className="flex h-[88vh] w-[92vw] max-w-362.5 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl p-5 gap-4">

                {/* Header */}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-6 py-4">

                    <div className="flex flex-col receivables-title">

                        <h2 className="text-[22px] font-bold text-[#081B46] leading-none">
                            Receivables Detailed View
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
                    >
                        <X
                            size={20}
                            className="text-slate-500"
                        />
                    </button>

                </div>

                {/* Toolbar */}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-6 py-3">
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

                    {/* Right Side */}

                    <div className="flex items-center gap-3"
                        style={{ transform: "translateX(-35px)", }}>

                        <span className="text-xs font-medium text-slate-500">
                            {totalCount} Records
                        </span>

                        <ExportButtons
                            endpoint="receivables"
                            exporting={exporting}
                            handleExport={handleExport}
                        />
                    </div>
                </div>
                {/* Content */}

                <div className="flex-1 min-h-0 overflow-hidden rounded-xl bg-slate-100 p-5">

                    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        {loading ? (

                            <div className="flex flex-1 items-center justify-center">

                                <div className="flex flex-col items-center gap-3">

                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                                    <span className="text-sm font-medium text-slate-500">
                                        Loading receivables...
                                    </span>

                                </div>

                            </div>

                        ) : (
                            <div className="flex-1 min-h-0 p-4">
                                <DetailedViewTable
                                    data={detailsData}
                                    currency="AED"
                                    page={page}
                                    pageSize={pageSize}
                                    totalCount={totalCount}
                                    onPageChange={handlePage}
                                    onSort={handleSort}
                                    showPagination={true}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}