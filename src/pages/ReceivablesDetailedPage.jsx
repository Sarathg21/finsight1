import React, { useEffect, useState } from "react";
import DetailedViewTable from "../components/Tables/DetailedViewTable";
import { getReceivableDetails } from "../api/recevablesApi";

export default function ReceivablesDetailedPage() {
  const [detailsData, setDetailsData] = useState([]);
  const [detailsPage, setDetailsPage] = useState(1);

  // Full page shows 25 records per page
  const detailsPageSize = 25;

  const [detailsTotalCount, setDetailsTotalCount] = useState(0);

  const [detailsSort, setDetailsSort] = useState({
    sort_by: "customer_name",
    sort_dir: "asc",
  });

  // Fetch data
  const fetchDetails = async (
    page = detailsPage,
    sort = detailsSort
  ) => {
    try {
      const params = {
        page,
        page_size: detailsPageSize,
        sort_by: sort.sort_by,
        sort_dir: sort.sort_dir,
      };

      const response = await getReceivableDetails(params);

      console.log("Detailed Page Response", response.data);

      setDetailsData(response.data.data.rows || []);
      setDetailsTotalCount(response.data.data.total_count || 0);
    } catch (error) {
      console.error(error);
    }
  };

  // Load data
  useEffect(() => {
    fetchDetails(detailsPage, detailsSort);
  }, [detailsPage, detailsSort]);

  // Pagination
  const handleDetailsPageChange = (page) => {
    setDetailsPage(page);
  };

  // Sorting
  const handleDetailsSort = (field) => {
    let direction = "desc";

    if (
      detailsSort.sort_by === field &&
      detailsSort.sort_dir === "desc"
    ) {
      direction = "asc";
    }

    setDetailsSort({
      sort_by: field,
      sort_dir: direction,
    });

    setDetailsPage(1);
  };

  return (
    <div className="p-5">

      <div className="card">

        <div className="flex items-center justify-between border-b px-5 py-4">

          <div>

            <h2 className="text-lg font-bold text-[#081B46]">
              Receivables Detailed View
            </h2>

            <p className="text-xs text-gray-500">
              Showing all receivable records
            </p>

          </div>

        </div>

        <DetailedViewTable
          data={detailsData}
          currency="AED"
          page={detailsPage}
          pageSize={detailsPageSize}
          totalCount={detailsTotalCount}
          onPageChange={handleDetailsPageChange}
          onSort={handleDetailsSort}
        />

      </div>

    </div>
  );
}