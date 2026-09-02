
import { roleAccessData } from "../../data/rolesData";// dummy data

export default function DataAccessScope({ role }) {
    console.log("CURRENT ROLE:", role);
   const access =
    roleAccessData[role?.role_code] || [];

     function getValues(data,key){
       const values=[
        ...new Set(
            data
            .map(item=>item[key])
            .filter(Boolean)
        )
    ];

    if(values.length===0)
        return "No Data Access Assigned";
    if(values.length<=2)
        return values.join(", ");
    return `Multiple (${values.length})`;
}

    return (

        <div className=" h-full overflow-y-auto p-3 space-y-2">
            <div className=" rounded-lg border bg-white " >
                <div className="border-b bg-gray-50 px-3 py-2 ">
                    <h3 className="text-xs font-semibold">
                        Default Role Access
                    </h3>
                    <p className="text-[10px] text-gray-500">
                        This access applies to all users assigned to this role.
                    </p>
                </div>

                <div className=" grid grid-cols-2 gap-3 p-3 ">
                    <Field
                        label="Legal Groups"
                       value={getValues(access,"legal_group_name")}
                    />
                    <Field
                        label="Legal Entities"
                        value = {getValues(access,"legal_entity_name")}
                    />
                    <Field
                        label="Parent Divisions"
                        value={getValues(access,"parent_division_name")}
                    />
                    <Field
                        label="Sub Divisions"
                        value={getValues(access,"subdivision_name")}
                    />
                    <Field
                        label="Business Units"
                        value={getValues(access,"business_unit_name")}
                    />
                    <Field
                        label="Analysis Codes"
                        value={getValues(access,"analysis_name")}
                    />

                    <p className="text-[10px] text-gray-700">
                        ⚠️This is the default access inherited by users assigned to this role.
                        User-specific exceptions can be managed from User Access Management.
                    </p>
                </div>
            </div>
        </div>
    )
}

function Field({ label, value }) {
    return (
        <div>
            <p className="text-[10px] text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-[11px] font-medium text-gray-800">
                {value || "No Data Access Assigned"}
            </p>
        </div>
    );
}