// import {
//     Mail,
//     Building2,
//     Building,
//     Layers,
//     GitBranch,
//     Briefcase,
//     BarChart3,
// } from "lucide-react";


// export default function SelectedUserCard({
//     user,
//     accessSummary,
//     onSave,
//     onClose
// }) {
//     if (!user) {
//         return (
//             <div
//                 className="
//                 h-full
//                 rounded-xl
//                 border
//                 bg-white
//                 p-2
//                 text-xs
//                 text-gray-400
//                 flex
//                 items-center
//                 justify-center
//                 "
//             >
//                 Select a user
//             </div>
//         );
//     }



//     const accessRows = [
//         {
//             label: "Legal Groups",
//             value: accessSummary.legalGroups,
//             icon: Building2,
//             iconColor: "text-blue-500",
//         },
//         {
//             label: "Legal Entities",
//             value: accessSummary.legalEntities,
//             icon: Building,
//             iconColor: "text-purple-500",
//         },
//         {
//             label: "Parent Divisions",
//             value: accessSummary.parentDivisions,
//             icon: Layers,
//             iconColor: "text-orange-500",
//         },
//         {
//             label: "Subdivisions",
//             value: accessSummary.subdivisions,
//             icon: GitBranch,
//             iconColor: "text-green-500",
//         },
//         {
//             label: "Business Units",
//             value: accessSummary.businessUnits,
//             icon: Briefcase,
//             iconColor: "text-indigo-500",
//         },
//         {
//             label: "Analysis Codes",
//             value: accessSummary.analysisCodes,
//             icon: BarChart3,
//             iconColor: "text-red-500",
//         },
//     ];


//     const assignmentRows = [
//         [
//             "Access Level",
//             user.assignment?.level ?? "-"
//         ],
//         [
//             "Effective From",
//             user.assignment?.effectiveFrom ?? "-"
//         ],
//         [
//             "Last Updated",
//             user.assignment?.lastUpdated ?? "-"
//         ],
//         [
//             "Updated By",
//             user.assignment?.updatedBy ?? "-"
//         ],
//     ];




//     return (

//         <div
//             className="
//             h-full
//             min-h-0
//             flex
//             flex-col
//             gap-1.5
//             overflow-hidden
//             "
//         >



//             {/* USER DETAILS */}


//             <div
//                 className="
//                 shrink-0
//                 rounded-lg
//                 border
//                 border-gray-200
//                 bg-white
//                 p-2.5
//                 shadow-sm
//                 "
//             >


//                 <div
//                     className="
//                     flex
//                     items-center
//                     gap-1.5
//                     "
//                 >


//                     <div
//                         className="
//                         grid
//                         h-8
//                         w-8
//                         shrink-0
//                         place-items-center
//                         rounded-full
//                         bg-blue-600
//                         text-[11px]
//                         font-semibold
//                         text-white
//                         "
//                     >

//                         {user.name?.charAt(0)}

//                     </div>



//                     <div className="min-w-0">


//                         <div
//                             className="
//                             flex
//                             items-center
//                             gap-1
//                             "
//                         >


//                             <h3
//                                 className="
//                                 truncate
//                                 text-[11px]
//                                 font-bold
//                                 text-gray-800
//                                 "
//                             >

//                                 {user.name}

//                             </h3>



//                             <span
//                                 className="
//                                 rounded-full
//                                 bg-green-100
//                                 px-1
//                                 text-[8px]
//                                 font-medium
//                                 text-green-700
//                                 "
//                             >

//                                 {user.status}

//                             </span>


//                         </div>




//                         <p
//                             className="
//                             text-[9px]
//                             text-gray-500
//                             "
//                         >

//                             {user.code}

//                         </p>


//                     </div>


//                 </div>







//                 <div
//                     className="
//                     mt-1.5
//                     space-y-0.5
//                     text-[10px]
//                     "
//                 >



//                     <div
//                         className="
//                         flex
//                         items-center
//                         gap-1
//                         text-gray-600
//                         "
//                     >

//                         <Mail
//                             className="
//                             h-3
//                             w-3
//                             text-gray-400
//                             "
//                         />

//                         <span className="truncate">

//                             {user.email}

//                         </span>

//                     </div>

//                     <InfoRow
//                         label="Role"
//                         value={user.role}
//                     />

//                 </div>
//             </div>


//             {/* ACCESS SUMMARY */}



//             <div
//                 className="
//                 shrink-0
//                 rounded-lg
//                 border
//                 border-gray-200
//                 bg-white
//                 p-2.5
//                 shadow-sm
//                 "
//             >


//                 <h4
//                     className="
//                     mb-1.5
//                     text-[10px]
//                     font-bold
//                     uppercase
//                     tracking-wide
//                     text-gray-800
//                     "
//                 >

//                     Access Summary

//                 </h4>




//                 <div className="space-y-px">


//                     {
//                         accessRows.map(
//                             ({
//                                 label,
//                                 value,
//                                 icon: Icon,
//                                 iconColor
//                             }) => (


//                                 <div
//                                     key={label}
//                                     className="
//                                 flex
//                                 items-center
//                                 justify-between
//                                 py-[1.5px]
//                                 text-[10px]
//                                 leading-4
//                                 "
//                                 >



//                                     <div
//                                         className="
//                                     flex
//                                     items-center
//                                     gap-1.5
//                                     text-gray-600
//                                     "
//                                     >


//                                         <Icon
//                                             className={`
//                                         h-3
//                                         w-3
//                                         ${iconColor}
//                                         `}
//                                         />


//                                         <span>

//                                             {label}

//                                         </span>


//                                     </div>




//                                     <span
//                                         className="
//                                     font-semibold
//                                     text-gray-800
//                                     "
//                                     >

//                                         {value}

//                                     </span>



//                                 </div>


//                             ))
//                     }



//                 </div>


//             </div>








//             {/* CURRENT ACCESS ASSIGNMENT */}

//             <div
//                 className="
//     flex-1
//     min-h-0
//     flex
//     flex-col
//     overflow-hidden
//     rounded-lg
//     border
//     border-gray-200
//     bg-white
//     p-2.5
//     shadow-sm
//     "
//             >

//                 <h4
//                     className="
//         mb-1.5
//         shrink-0
//         text-[10px]
//         font-bold
//         uppercase
//         tracking-wide
//         text-gray-800
//         "
//                 >
//                     Current Access Assignment
//                 </h4>



//                 {/* Assignment Rows */}

//                 <div
//                     className="
//         flex-1
//         overflow-auto
//         space-y-1
//         "
//                 >

//                     {
//                         assignmentRows.map(([label, value]) => (

//                             <div
//                                 key={label}
//                                 className="
//                     flex
//                     items-center
//                     justify-between
//                     py-[1.5px]
//                     text-[10px]
//                     leading-4
//                     "
//                             >

//                                 <span
//                                     className="
//                         text-gray-600
//                         "
//                                 >
//                                     {label}
//                                 </span>


//                                 <span
//                                     className="
//                         font-medium
//                         text-gray-800
//                         "
//                                 >
//                                     {value}
//                                 </span>


//                             </div>

//                         ))
//                     }


//                 </div>





//                 {/* Fixed Bottom Buttons */}

//                 <div
//                     className="
//         mt-auto
//         pt-2
//         flex
//         gap-3
//         shrink-0
//         "
//                 >

//                     <button
//                         className="
//             h-6
//             flex-1
//             rounded
//             border
//             text-[12px]
//             hover:bg-gray-50
//             "
//                     >
//                         Cancel
//                     </button>



//                     <button
//                         onClick={onSave}
//                         className="
//                         h-6
//                         flex-1
//                         rounded
//                         bg-blue-600
//                         text-[10px]
//                         text-white
//                         hover:bg-blue-700
//                     "
//                     >
//                         Save Changes
//                     </button>
//                 </div>
//             </div>
//         </div>

//     );

// }

// function InfoRow({
//     label,
//     value
// }) {


//     return (

//         <div
//             className="
//             flex
//             items-center
//             justify-between
//             py-px
//             leading-4
//             "
//         >


//             <span className="text-gray-500">

//                 {label}

//             </span>




//             <span
//                 className="
//                 max-w-30
//                 truncate
//                 font-medium
//                 text-gray-700
//                 "
//             >

//                 {value || "-"}

//             </span>



//         </div>

//     );

// }


import {
    Mail,
    Building2,
    Building,
    Layers,
    GitBranch,
    Briefcase,
    BarChart3,
} from "lucide-react";


export default function SelectedUserCard({
    user,
    accessSummary,
    onSave,
    onClose
}) {

    if (!user) {
        return (
            <div
                className="
                h-full
                rounded-xl
                border
                bg-white
                text-xs
                text-gray-400
                flex
                items-center
                justify-center
                "
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 0,
                    padding: "8px",
                    boxSizing: "border-box",
                    borderColor: "#e5e7eb",
                }}
            >
                Select a user
            </div>
        );
    }


    const accessRows = [
        {
            label: "Legal Groups",
            value: accessSummary.legalGroups,
            icon: Building2,
            iconColor: "text-blue-500",
        },
        {
            label: "Legal Entities",
            value: accessSummary.legalEntities,
            icon: Building,
            iconColor: "text-purple-500",
        },
        {
            label: "Parent Divisions",
            value: accessSummary.parentDivisions,
            icon: Layers,
            iconColor: "text-orange-500",
        },
        {
            label: "Subdivisions",
            value: accessSummary.subdivisions,
            icon: GitBranch,
            iconColor: "text-green-500",
        },
        {
            label: "Business Units",
            value: accessSummary.businessUnits,
            icon: Briefcase,
            iconColor: "text-indigo-500",
        },
        {
            label: "Analysis Codes",
            value: accessSummary.analysisCodes,
            icon: BarChart3,
            iconColor: "text-red-500",
        },
    ];


    const assignmentRows = [
        [
            "Access Level",
            user.assignment?.level ?? "-"
        ],
        [
            "Effective From",
            user.assignment?.effectiveFrom ?? "-"
        ],
        [
            "Last Updated",
            user.assignment?.lastUpdated ?? "-"
        ],
        [
            "Updated By",
            user.assignment?.updatedBy ?? "-"
        ],
    ];


    return (

        <div
            className="
            h-full
            min-h-0
            flex
            flex-col
            overflow-hidden
            "
            style={{
                width: "100%",
                height: "100%",
                minWidth: 0,
                minHeight: 0,
                gap: "6px",
                boxSizing: "border-box",
            }}
        >

            {/* =====================================================
                USER DETAILS
            ===================================================== */}

            <div
                className="
                shrink-0
                rounded-lg
                border
                border-gray-200
                bg-white
                shadow-sm
                "
                style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                }}
            >

                <div
                    className="
                    flex
                    items-center
                    "
                    style={{
                        width: "100%",
                        minWidth: 0,
                        gap: "8px",
                    }}
                >

                    {/* AVATAR */}

                    <div
                        className="
                        grid
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-blue-600
                        text-white
                        "
                        style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            minHeight: "32px",
                            fontSize: "11px",
                            lineHeight: "14px",
                            fontWeight: 600,
                        }}
                    >
                        {user.name?.charAt(0)}
                    </div>


                    {/* USER NAME / CODE */}

                    <div
                        style={{
                            minWidth: 0,
                            flex: "1 1 auto",
                            overflow: "hidden",
                        }}
                    >

                        <div
                            className="
                            flex
                            items-center
                            "
                            style={{
                                minWidth: 0,
                                gap: "6px",
                                height: "18px",
                            }}
                        >

                            <h3
                                className="
                                truncate
                                font-bold
                                text-gray-800
                                "
                                style={{
                                    minWidth: 0,
                                    maxWidth: "100%",
                                    margin: 0,
                                    fontSize: "11px",
                                    lineHeight: "16px",
                                    fontWeight: 700,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.name}
                            </h3>


                            <span
                                className="
                                rounded-full
                                bg-green-100
                                text-green-700
                                "
                                style={{
                                    flexShrink: 0,
                                    padding: "2px 6px",
                                    fontSize: "8px",
                                    lineHeight: "11px",
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.status}
                            </span>

                        </div>


                        <p
                            className="
                            text-gray-500
                            "
                            style={{
                                margin: "1px 0 0 0",
                                fontSize: "9px",
                                lineHeight: "13px",
                            }}
                        >
                            {user.code}
                        </p>

                    </div>

                </div>


                {/* EMAIL + ROLE */}

                <div
                    className="
                    text-[10px]
                    "
                    style={{
                        width: "100%",
                        marginTop: "7px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        fontSize: "10px",
                        lineHeight: "15px",
                    }}
                >

                    {/* EMAIL */}

                    <div
                        className="
                        flex
                        items-center
                        text-gray-600
                        "
                        style={{
                            width: "100%",
                            minWidth: 0,
                            gap: "5px",
                        }}
                    >

                        <Mail
                            style={{
                                width: "12px",
                                height: "12px",
                                minWidth: "12px",
                                color: "#9ca3af",
                                flexShrink: 0,
                            }}
                        />

                        <span
                            className="truncate"
                            style={{
                                minWidth: 0,
                                flex: "1 1 auto",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                            title={user.email}
                        >
                            {user.email}
                        </span>

                    </div>


                    {/* ROLE */}

                    <InfoRow
                        label="Role"
                        value={user.role}
                    />

                </div>

            </div>


            {/* =====================================================
                ACCESS SUMMARY
            ===================================================== */}

            <div
                className="
                shrink-0
                rounded-lg
                border
                border-gray-200
                bg-white
                shadow-sm
                "
                style={{
                    width: "100%",
                    padding: "10px",
                    boxSizing: "border-box",
                }}
            >

                <h4
                    className="
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-800
                    "
                    style={{
                        margin: "0 0 7px 0",
                        fontSize: "10px",
                        lineHeight: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                    }}
                >
                    Access Summary
                </h4>


                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1px",
                    }}
                >

                    {accessRows.map(
                        ({
                            label,
                            value,
                            icon: Icon,
                            iconColor
                        }) => (

                            <div
                                key={label}
                                className="
                                flex
                                items-center
                                justify-between
                                "
                                style={{
                                    width: "100%",
                                    minWidth: 0,
                                    minHeight: "22px",
                                    padding: "2px 0",
                                    gap: "8px",
                                    boxSizing: "border-box",
                                }}
                            >

                                {/* LABEL */}

                                <div
                                    className="
                                    flex
                                    items-center
                                    text-gray-600
                                    "
                                    style={{
                                        minWidth: 0,
                                        flex: "1 1 auto",
                                        gap: "6px",
                                        overflow: "hidden",
                                    }}
                                >

                                    <Icon
                                        className={iconColor}
                                        style={{
                                            width: "13px",
                                            height: "13px",
                                            minWidth: "13px",
                                            flexShrink: 0,
                                        }}
                                    />

                                    <span
                                        className="truncate"
                                        style={{
                                            minWidth: 0,
                                            fontSize: "10px",
                                            lineHeight: "14px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {label}
                                    </span>

                                </div>


                                {/* VALUE */}

                                <span
                                    className="
                                    font-semibold
                                    text-gray-800
                                    "
                                    style={{
                                        flexShrink: 0,
                                        minWidth: "20px",
                                        textAlign: "right",
                                        fontSize: "10px",
                                        lineHeight: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {value}
                                </span>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =====================================================
                CURRENT ACCESS ASSIGNMENT
            ===================================================== */}

            <div
                className="
                flex-1
                min-h-0
                flex
                flex-col
                overflow-hidden
                rounded-lg
                border
                border-gray-200
                bg-white
                shadow-sm
                "
                style={{
                    width: "100%",
                    minWidth: 0,
                    padding: "10px",
                    boxSizing: "border-box",
                }}
            >

                <h4
                    className="
                    shrink-0
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-800
                    "
                    style={{
                        margin: "0 0 7px 0",
                        fontSize: "10px",
                        lineHeight: "14px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                    }}
                >
                    Current Access Assignment
                </h4>


                {/* ASSIGNMENT ROWS */}

                <div
                    className="
                    flex-1
                    overflow-auto
                    "
                    style={{
                        minHeight: 0,
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                    }}
                >

                    {assignmentRows.map(
                        ([label, value]) => (

                            <div
                                key={label}
                                className="
                                flex
                                items-center
                                justify-between
                                "
                                style={{
                                    width: "100%",
                                    minWidth: 0,
                                    minHeight: "22px",
                                    padding: "2px 0",
                                    gap: "10px",
                                    boxSizing: "border-box",
                                }}
                            >

                                <span
                                    className="
                                    text-gray-600
                                    "
                                    style={{
                                        minWidth: 0,
                                        flex: "1 1 auto",
                                        fontSize: "10px",
                                        lineHeight: "14px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {label}
                                </span>


                                <span
                                    className="
                                    font-medium
                                    text-gray-800
                                    "
                                    style={{
                                        minWidth: 0,
                                        maxWidth: "60%",
                                        flexShrink: 0,
                                        textAlign: "right",
                                        fontSize: "10px",
                                        lineHeight: "14px",
                                        fontWeight: 500,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                    title={String(value)}
                                >
                                    {value}
                                </span>

                            </div>

                        )
                    )}

                </div>


                {/* =================================================
                    FIXED BOTTOM BUTTONS
                ================================================= */}

                <div
                    className="
                    mt-auto
                    flex
                    shrink-0
                    "
                    style={{
                        width: "100%",
                        paddingTop: "8px",
                        gap: "8px",
                        boxSizing: "border-box",
                    }}
                >

                    {/* CANCEL */}

                    <button
                        className="
                        flex-1
                        rounded
                        border
                        text-[12px]
                        hover:bg-gray-50
                        "
                        style={{
                            height: "28px",
                            minHeight: "28px",
                            flex: "1 1 0",
                            padding: "0 8px",
                            borderColor: "#d1d5db",
                            backgroundColor: "#ffffff",
                            fontSize: "10px",
                            lineHeight: "14px",
                            color: "#374151",
                            boxSizing: "border-box",
                        }}
                    >
                        Cancel
                    </button>


                    {/* SAVE */}

                    <button
                        onClick={onSave}
                        className="
                        flex-1
                        rounded
                        bg-blue-600
                        text-white
                        hover:bg-blue-700
                        "
                        style={{
                            height: "28px",
                            minHeight: "28px",
                            flex: "1 1 0",
                            padding: "0 8px",
                            border: "none",
                            fontSize: "10px",
                            lineHeight: "14px",
                            fontWeight: 500,
                            boxSizing: "border-box",
                        }}
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </div>

    );
}


/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
    label,
    value
}) {

    return (

        <div
            className="
            flex
            items-center
            justify-between
            "
            style={{
                width: "100%",
                minWidth: 0,
                minHeight: "18px",
                padding: "1px 0",
                gap: "8px",
                boxSizing: "border-box",
            }}
        >

            <span
                className="text-gray-500"
                style={{
                    flexShrink: 0,
                    fontSize: "10px",
                    lineHeight: "14px",
                }}
            >
                {label}
            </span>


            <span
                className="
                truncate
                font-medium
                text-gray-700
                "
                style={{
                    minWidth: 0,
                    maxWidth: "65%",
                    textAlign: "right",
                    fontSize: "10px",
                    lineHeight: "14px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={value || "-"}
            >
                {value || "-"}
            </span>

        </div>

    );
}

