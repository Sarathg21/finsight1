const auditLogs = [
    {
        id: 1,
        dateTime: "17-Jul-2026 10:30 AM",
        action: "Permission Updated",
        changedBy: "Admin",
        description:
            "Added Delete permission for Users module"
    },

    {
        id: 2,
        dateTime: "16-Jul-2026 02:15 PM",
        action: "User Assigned",
        changedBy: "Manager",
        description:
            "Assigned John to Finance Manager role"
    },

    {
        id: 3,
        dateTime: "15-Jul-2026 09:45 AM",
        action: "Role Created",
        changedBy: "Admin",
        description:
            "Finance Manager role created"
    }
];


export default function AuditLog() {


    return (

        <div className="h-full overflow-y-auto p-3">

            <div className="
                rounded-lg
                border
                bg-white
            ">


                {/* Header */}

                <div className="
                    border-b
                    bg-gray-50
                    px-3
                    py-2
                ">

                    <h3 className="
                        text-[11px]
                        font-semibold
                        text-gray-800
                    ">
                        Audit Log
                    </h3>


                    <p className="
                        text-[9px]
                        text-gray-500
                    ">
                        View role activity history
                    </p>

                </div>



                {/* Logs */}

                <div className="divide-y">


                    {
                        auditLogs.map((log)=>(
                            
                            <div
                                key={log.id}
                                className="
                                    px-3
                                    py-3
                                "
                            >


                                {/* Top row */}

                                <div className="
                                    grid
                                    grid-cols-3
                                    gap-2
                                ">


                                    <div>

                                        <p className="
                                            text-[9px]
                                            text-gray-500
                                        ">
                                            Date Time
                                        </p>

                                        <p className="
                                            text-[10px]
                                            font-medium
                                        ">
                                            {log.dateTime}
                                        </p>

                                    </div>



                                    <div>

                                        <p className="
                                            text-[9px]
                                            text-gray-500
                                        ">
                                            Action
                                        </p>

                                        <p className="
                                            text-[10px]
                                            font-medium
                                            text-blue-600
                                        ">
                                            {log.action}
                                        </p>

                                    </div>



                                    <div>

                                        <p className="
                                            text-[9px]
                                            text-gray-500
                                        ">
                                            Changed By
                                        </p>

                                        <p className="
                                            text-[10px]
                                            font-medium
                                        ">
                                            {log.changedBy}
                                        </p>

                                    </div>


                                </div>




                                {/* Description */}

                                <div className="mt-2">


                                    <p className="
                                        text-[9px]
                                        text-gray-500
                                    ">
                                        Description
                                    </p>


                                    <p className="
                                        text-[10px]
                                        text-gray-700
                                    ">
                                        {log.description}
                                    </p>


                                </div>


                            </div>

                        ))
                    }


                </div>


            </div>


        </div>

    )

}