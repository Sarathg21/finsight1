import {
  Pencil,
  MoreVertical,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";

import ConfirmationModel from "../common/ConfirmationModel";


export default function AnalysisCodeTable({
  analysisCodes = [],
  onEdit,
  onSelect,
  selectedAnalysisCode,
  onStatusToggle,
}) {

  const tableRef = useRef(null);
  const menuRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [selectedStatusCode, setSelectedStatusCode] = useState(null);


  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,] = useState(8);

  const totalRows = analysisCodes.length;
  const totalPages = Math.ceil(totalRows / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentRows = analysisCodes.slice(startIndex, endIndex);

  /* Close menu */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const pages = Math.ceil(analysisCodes.length / pageSize);

    if (pages === 0) {
      setCurrentPage(1);
    } else if (currentPage > pages) {
      setCurrentPage(pages);
    }
  }, [analysisCodes.length, currentPage, pageSize]);


  /* Pagination handlers */
  const goFirst = () => {
    setCurrentPage(1);
    tableRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };

  const goLast = () => {
    setCurrentPage(totalPages);
    tableRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };

  const goPrevious = () => {
    setCurrentPage((prev) =>
      Math.max(prev - 1, 1)
    );

    tableRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  const goNext = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );

    tableRef.current?.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border
        border-gray-200
        bg-white
      ">

      {/* Table */}
      <div
        ref={tableRef}
        className="
        max-h-105
        overflow-y-auto
        overflow-x-hidden
      " >

        <table className="w-full border-collapse">
          {/* Header */}
          <thead
            className="
              sticky
              top-0
              z-10
              border-b
              border-gray-200
              bg-gray-50
            " >


            <tr>
              <th
                className="
                  px-3
                  py-2
                  text-left
                  text-[9px]
                  font-bold
                  text-gray-600
                "
              >

                <span className="flex items-center gap-1">
                  Analysis Code
                  <ArrowUpDown
                    size={10}
                    className="opacity-40"
                  />
                </span>
              </th>

              <th
                className="
                  px-3
                  py-2
                  text-left
                  text-[9px]
                  font-bold
                  text-gray-600
                "
              >
                <span className="flex items-center gap-1">
                  Analysis Name
                  <ArrowUpDown
                    size={10}
                    className="opacity-40"
                  />
                </span>
              </th>

              <th
                className="
                  px-3
                  py-2
                  text-left
                  text-[9px]
                  font-bold
                  text-gray-600
                "
              >
                <span className="flex items-center gap-1">
                  SubDivision Name
                  <ArrowUpDown
                    size={10}
                    className="opacity-40"
                  />
                </span>
              </th>

              <th
                className="
                  px-3
                  py-2
                  text-left
                  text-[9px]
                  font-bold
                  text-gray-600
                "
              >
                Status
              </th>

              <th
                className="
                  px-3
                  py-2
                  text-center
                  text-[9px]
                  font-bold
                  text-gray-600
                "
              >
                Action
              </th>
            </tr>
          </thead>


          {/* Body */}
          <tbody>
            {
              currentRows.length > 0 ? (
                currentRows.map((code, index) => {
                  // Last 3 rows → dropdown opens upward
                  const openUp = index >= currentRows.length - 3;

                  return (
                    <tr
                      key={code.analysis_code_id}
                      onClick={() => onSelect?.(code)}
                      className={`
                           cursor-pointer
                           border-b
                           border-gray-100
                           ${selectedAnalysisCode?.analysis_code_id ===
                          code.analysis_code_id
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      <td
                        className="
                           px-3
                           py-1.5
                           text-[10px]
                           font-medium
                           text-gray-800
                         "
                      >
                        {code.analysis_code}
                      </td>

                      <td
                        className="
                            px-3
                            py-1.5
                            text-[10px]
                            text-gray-800
                          "
                      >
                        {code.analysis_name}
                      </td>

                      <td
                        className="
                            px-3
                            py-1.5
                            text-[10px]
                            text-gray-800
                          "
                      >
                        {code.subdivision_name}
                      </td>

                      <td className="px-3 py-1.5">
                        <span
                          className={`
                              rounded-full
                              px-2
                              py-0.5
                              text-[9px]
                              ${code.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {code.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action */}
                      <td
                        className="relative w-17.5 px-3 py-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="relative flex justify-center gap-1"
                          ref={
                            openMenu === code.analysis_code_id
                              ? menuRef
                              : null
                          }
                        >
                          {/* Edit */}
                          <button
                            onClick={() => onEdit?.(code)}
                            className="
                               flex
                               h-6
                               w-6
                               items-center
                               justify-center
                               rounded
                               hover:bg-gray-100
                             "
                          >
                            <Pencil
                              size={11}
                              className="text-gray-700"
                            />
                          </button>

                          {/* More */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              setOpenMenu(
                                openMenu === code.analysis_code_id
                                  ? null
                                  : code.analysis_code_id
                              );
                            }}
                            className="
                                  flex
                                  h-6
                                  w-6
                                  items-center
                                  justify-center
                                  rounded
                                  hover:bg-gray-100
                                "
                          >
                            <MoreVertical
                              size={11}
                              className="text-gray-700"
                            />
                          </button>

                          {/* Dropdown */}
                          {openMenu === code.analysis_code_id && (
                            <div
                              className={`
                                    absolute
                                    right-2
                                    z-100
                                    w-32
                                    overflow-hidden
                                    rounded-md
                                    border
                                    border-gray-200
                                    bg-white
                                    shadow-lg
                                    ${openUp
                                  ? "bottom-7"
                                  : "top-7"
                                } `}
                            >
                              {/* View Details */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect?.(code);
                                  setOpenMenu(null);
                                }}
                                className="
                                    block
                                    w-full
                                    px-3
                                    py-2
                                    text-left
                                    text-xs
                                    hover:bg-gray-50
                                  "
                              >
                                View Details
                              </button>

                              {/* Activate / Deactivate */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setSelectedStatusCode(code);
                                  setShowStatusConfirm(true);
                                  setOpenMenu(null);
                                }}
                                className="
                                   block
                                   w-full
                                   px-3
                                   py-2
                                   text-left
                                   text-xs
                                   hover:bg-gray-50
                                 "
                              >
                                {code.active
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="
                      py-10
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >
                    No Analysis Codes found.
                  </td>
                </tr>
              )
            }

          </tbody>
        </table>
      </div>


      {/* Pagination - UserTable Style */}
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          border-t
          border-gray-200
          bg-gray-50/40
          px-4
          py-2
        "
      >

        {/* Record Info */}
        <p
          className="
            text-[9px]
            text-gray-700
          "
        >
          Showing{" "}
          {
            totalRows === 0
              ?
              0
              :
              startIndex + 1
          }

          {" "}to{" "}

          {
            Math.min(
              endIndex,
              totalRows
            )
          }

          {" "}of{" "}

          {totalRows}

          {" "}Analysis Codes
        </p>

        {/* Pagination Buttons */}
        <div
          className="
            flex
            items-center
            gap-1
          "
        >

          {/* First */}
          <button
            onClick={goFirst}
            disabled={
              currentPage === 1
            }
            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-40
            "

          >
            <ChevronsLeft
              className="h-3.5 w-3.5"
            />
          </button>



          {/* Previous */}
          <button

            onClick={goPrevious}

            disabled={
              currentPage === 1
            }


            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-40
            "

          >

            <ChevronLeft
              className="h-3.5 w-3.5"
            />


          </button>






          {/* Page Numbers */}


          {

            Array.from(
              {
                length: totalPages
              },

              (_, index) => {

                const page = index + 1;


                return (

                  <button

                    key={page}


                    onClick={() => {

                      setCurrentPage(page);


                      tableRef.current?.scrollTo({

                        top: 0,

                        behavior: "smooth"

                      });


                    }}


                    className={`

                      h-6
                      w-6
                      rounded
                      text-[9px]
                      font-medium

                      ${currentPage === page

                        ?

                        "bg-blue-600 text-white"

                        :

                        "text-gray-600 hover:bg-gray-100"

                      }

                    `}

                  >

                    {page}


                  </button>

                );


              }

            )

          }







          {/* Next */}


          <button

            onClick={goNext}

            disabled={

              currentPage === totalPages ||
              totalPages === 0

            }


            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-40
            "

          >

            <ChevronRight
              className="h-3.5 w-3.5"
            />

          </button>







          {/* Last */}


          <button

            onClick={goLast}

            disabled={

              currentPage === totalPages ||
              totalPages === 0

            }


            className="
              rounded
              p-1
              text-gray-500
              hover:bg-gray-100
              disabled:opacity-40
            "

          >

            <ChevronsRight
              className="h-3.5 w-3.5"
            />

          </button>



        </div>


      </div>







      {/* Confirmation Modal */}


      <ConfirmationModel

        open={showStatusConfirm}


        title={
          selectedStatusCode?.active
            ?
            "Deactivate Analysis Code"
            :
            "Activate Analysis Code"
        }


        message={
          selectedStatusCode?.active
            ?

            `Are you sure you want to deactivate ${selectedStatusCode?.analysis_name}?`

            :

            `Are you sure you want to activate ${selectedStatusCode?.analysis_name}?`
        }


        confirmText={
          selectedStatusCode?.active
            ?
            "Deactivate"
            :
            "Activate"
        }


        cancelText="Cancel"



        onCancel={() => {

          setShowStatusConfirm(false);

          setSelectedStatusCode(null);

        }}




        onConfirm={() => {


          onStatusToggle?.(
            selectedStatusCode
          );


          setShowStatusConfirm(false);


          setSelectedStatusCode(null);

        }}

      />

    </div>

  );

}