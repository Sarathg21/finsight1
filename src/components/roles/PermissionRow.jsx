import {
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";

import Checkbox from "../common/Checkbox";


export default function PermissionRow({
  module,
  permissionColumns,
  onToggleExpand,
  onUpdatePermission,
  onUpdateChildPermission,
}) {

  return (
    <>

      {/* Parent Row */}
      <tr
        className="
          h-11
          border-t
          hover:bg-gray-50
          transition
        "
      >

        <td className="px-5">

          <div className="flex items-center gap-2">


            <button
              type="button"
              onClick={() => onToggleExpand(module.id)}
              className="
                rounded
                hover:bg-gray-100
                p-1
              "
            >

              {module.children?.length > 0 ? (

                module.expanded ? (

                  <ChevronDown
                    size={16}
                    className="text-gray-500"
                  />

                ) : (

                  <ChevronRight
                    size={16}
                    className="text-gray-500"
                  />

                )

              ) : (

                <span className="w-4" />

              )}

            </button>


            <Folder
              size={17}
              className="text-blue-600"
            />


            <span className="
              text-sm
              font-medium
              text-gray-700
            ">
              {module.name}
            </span>


          </div>

        </td>



        {permissionColumns.map((column)=>(

          <td
            key={column.key}
            className="text-center"
          >

            <Checkbox

             checked={
             module.permissions?.[column.key] ?? false
             }
              color={
                column.color
              }

              onChange={(value)=>
                onUpdatePermission(
                  module.id,
                  column.key,
                  value
                )
              }

            />

          </td>

        ))}


      </tr>



      {/* Child Rows */}

      {
        module.expanded &&
        module.children?.map((child)=>(

          <tr
            key={child.id}
            className="
              h-11
              border-t
              bg-gray-50/50
              hover:bg-gray-50
            "
          >

            <td
              className="
                px-5
                pl-14
              "
            >

              <span
                className="
                  text-sm
                  text-gray-600
                "
              >
                {child.name}
              </span>

            </td>



            {
              permissionColumns.map((column)=>(

                <td
                  key={column.key}
                  className="text-center"
                >

                  <Checkbox

                    checked={
                    child.permissions?.[column.key] ?? false
                   }


                    color={
                      column.color
                    }


                    onChange={(value)=>
                      onUpdateChildPermission(
                        module.id,
                        child.id,
                        column.key,
                        value
                      )
                    }

                  />


                </td>

              ))
            }


          </tr>


        ))
      }


    </>
  );
}