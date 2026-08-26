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
                p-2
                text-xs
                text-gray-400
                flex
                items-center
                justify-center
                "
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
            gap-1.5
            overflow-hidden
            "
        >



            {/* USER DETAILS */}


            <div
                className="
                shrink-0
                rounded-lg
                border
                border-gray-200
                bg-white
                p-2.5
                shadow-sm
                "
            >


                <div
                    className="
                    flex
                    items-center
                    gap-1.5
                    "
                >


                    <div
                        className="
                        grid
                        h-8
                        w-8
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-blue-600
                        text-[11px]
                        font-semibold
                        text-white
                        "
                    >

                        {user.name?.charAt(0)}

                    </div>



                    <div className="min-w-0">


                        <div
                            className="
                            flex
                            items-center
                            gap-1
                            "
                        >


                            <h3
                                className="
                                truncate
                                text-[11px]
                                font-bold
                                text-gray-800
                                "
                            >

                                {user.name}

                            </h3>



                            <span
                                className="
                                rounded-full
                                bg-green-100
                                px-1
                                text-[8px]
                                font-medium
                                text-green-700
                                "
                            >

                                {user.status}

                            </span>


                        </div>




                        <p
                            className="
                            text-[9px]
                            text-gray-500
                            "
                        >

                            {user.code}

                        </p>


                    </div>


                </div>







                <div
                    className="
                    mt-1.5
                    space-y-0.5
                    text-[10px]
                    "
                >



                    <div
                        className="
                        flex
                        items-center
                        gap-1
                        text-gray-600
                        "
                    >

                        <Mail
                            className="
                            h-3
                            w-3
                            text-gray-400
                            "
                        />

                        <span className="truncate">

                            {user.email}

                        </span>

                    </div>

                    <InfoRow
                        label="Role"
                        value={user.role}
                    />

                </div>
            </div>


            {/* ACCESS SUMMARY */}



            <div
                className="
                shrink-0
                rounded-lg
                border
                border-gray-200
                bg-white
                p-2.5
                shadow-sm
                "
            >


                <h4
                    className="
                    mb-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-800
                    "
                >

                    Access Summary

                </h4>




                <div className="space-y-px">


                    {
                        accessRows.map(
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
                                py-[1.5px]
                                text-[10px]
                                leading-4
                                "
                                >



                                    <div
                                        className="
                                    flex
                                    items-center
                                    gap-1.5
                                    text-gray-600
                                    "
                                    >


                                        <Icon
                                            className={`
                                        h-3
                                        w-3
                                        ${iconColor}
                                        `}
                                        />


                                        <span>

                                            {label}

                                        </span>


                                    </div>




                                    <span
                                        className="
                                    font-semibold
                                    text-gray-800
                                    "
                                    >

                                        {value}

                                    </span>



                                </div>


                            ))
                    }



                </div>


            </div>








            {/* CURRENT ACCESS ASSIGNMENT */}

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
    p-2.5
    shadow-sm
    "
            >

                <h4
                    className="
        mb-1.5
        shrink-0
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        text-gray-800
        "
                >
                    Current Access Assignment
                </h4>



                {/* Assignment Rows */}

                <div
                    className="
        flex-1
        overflow-auto
        space-y-1
        "
                >

                    {
                        assignmentRows.map(([label, value]) => (

                            <div
                                key={label}
                                className="
                    flex
                    items-center
                    justify-between
                    py-[1.5px]
                    text-[10px]
                    leading-4
                    "
                            >

                                <span
                                    className="
                        text-gray-600
                        "
                                >
                                    {label}
                                </span>


                                <span
                                    className="
                        font-medium
                        text-gray-800
                        "
                                >
                                    {value}
                                </span>


                            </div>

                        ))
                    }


                </div>





                {/* Fixed Bottom Buttons */}

                <div
                    className="
        mt-auto
        pt-2
        flex
        gap-3
        shrink-0
        "
                >

                    <button
                        className="
            h-6
            flex-1
            rounded
            border
            text-[12px]
            hover:bg-gray-50
            "
                    >
                        Cancel
                    </button>



                    <button
                        onClick={onSave}
                        className="
                        h-6
                        flex-1
                        rounded
                        bg-blue-600
                        text-[10px]
                        text-white
                        hover:bg-blue-700
                    "
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>

    );

}

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
            py-px
            leading-4
            "
        >


            <span className="text-gray-500">

                {label}

            </span>




            <span
                className="
                max-w-30
                truncate
                font-medium
                text-gray-700
                "
            >

                {value || "-"}

            </span>



        </div>

    );

}