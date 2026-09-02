import { useMemo, useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import SaveFooter from "../common/SaveFooter";
export default function UserAssignment({
    role,
    users,
    setDirty
}) {

    const [initialUsers, setInitialUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    // Checked users
    const [selectedUsers, setSelectedUsers] = useState([]);
    const noAssignedUsers = selectedUsers.length === 0;

    const assignedUserIds = useMemo(() => {
        if (!role) return [];
        return users
            .filter(
                user => user.role === role.role_code
            )
            .map(
                user => user.id
            );
    }, [users, role]);

    useEffect(() => {
        setSelectedUsers(assignedUserIds);
        setInitialUsers(assignedUserIds);
    }, [assignedUserIds]);

    // Search
    const filteredUsers = useMemo(() => {
        return (users || []).filter((user) =>
            (user.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||

            (user.code || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||

            (user.department || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [users, search]);

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentUsers = filteredUsers.slice(
        startIndex,
        startIndex + pageSize
    );
    const startItem = total === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(startIndex + pageSize, total);

    // Checkbox
    const toggleUser = (id) => {

        // tell parent that changes happened
        if (setDirty) {
            setDirty(true);
        }

        if (selectedUsers.includes(id)) {

            setSelectedUsers(
                selectedUsers.filter(
                    (item) => item !== id
                )
            );

        } else {

            setSelectedUsers([
                ...selectedUsers,
                id
            ]);

        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [search, role]);

    const getChanges = () => {

        const addedUsers =
            selectedUsers.filter(
                id => !initialUsers.includes(id)
            );

        const removedUsers =
            initialUsers.filter(
                id => !selectedUsers.includes(id)
            );

        return {
            addedUsers,
            removedUsers
        };
    };
    const handleSave = () => {

    const changes = getChanges();

    console.log("Added Users:", changes.addedUsers);

    console.log("Removed Users:", changes.removedUsers);


    // API call later
    // PUT /roles/{role_code}/users


    // after successful save
    setInitialUsers(selectedUsers);


    if(setDirty){
        setDirty(false);
    }

};

    const handleCancel = () => {
        setSelectedUsers(initialUsers);
        setSearch("");
        setCurrentPage(1);

        if (setDirty) {
            setDirty(false);
        }
    };


    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                <div>
                    <h3 className="text-[11px] font-semibold text-gray-800">
                        User Assignment
                    </h3>
                    <p className="text-[9px] text-gray-500">
                        {role?.role_name || "No Role Selected"}
                    </p>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1">
                    <Users
                        size={12}
                        className="text-blue-600"
                    />
                    <span className="text-[9px] font-medium text-blue-700">
                        {selectedUsers.length} Assigned
                    </span>
                </div>
            </div>

            {/* Search */}

            <div className="border-b border-gray-100 p-3">
                <div className="relative">
                    <Search
                        size={13}
                        className="absolute left-2 top-2 text-gray-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search user..."
                        className="
              h-7
              w-full
              rounded
              border
              border-gray-300
              pl-7
              pr-2
              text-[10px]
              outline-none
              focus:border-blue-500
            "
                    />

                </div>

            </div>

            {/* Table */}

            <div className="flex-1 overflow-auto px-3 py-2">

                <table className="w-full border-collapse">

                    <thead className="sticky top-0 bg-gray-50">

                        <tr className="h-7 border-b">

                            <th className="w-8"></th>

                            <th className="text-left text-[9px] font-semibold text-gray-700">

                                Code

                            </th>

                            <th className="text-left text-[9px] font-semibold text-gray-700">

                                Employee

                            </th>

                            <th className="text-left text-[9px] font-semibold text-gray-700">

                                Department

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            noAssignedUsers && !search ? (

                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center"
                                    >

                                        <p className="text-[10px] text-gray-400">
                                            No users assigned to this role.
                                        </p>

                                        <button
                                            className="
                        mt-2
                        rounded
                        bg-blue-600
                        px-3
                        py-1
                        text-[10px]
                        text-white
                    "
                                        >
                                            Assign Users
                                        </button>

                                    </td>
                                </tr>

                            )

                                :

                                filteredUsers.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="
                    py-8
                    text-center
                    text-[10px]
                    text-gray-400
                "
                                        >
                                            No users found
                                        </td>
                                    </tr>

                                )

                                    :

                                    (

                                        currentUsers.map((user) => (

                                            <tr
                                                key={user.id}
                                                className="
                    h-8
                    border-b
                    hover:bg-gray-50
                "
                                            >

                                                <td className="text-center">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selectedUsers.includes(user.id)
                                                        }
                                                        onChange={() =>
                                                            toggleUser(user.id)
                                                        }
                                                        className="
                            h-3
                            w-3
                            accent-blue-600
                        "
                                                    />

                                                </td>


                                                <td className="text-[10px]">
                                                    {user.code}
                                                </td>


                                                <td className="text-[10px]">
                                                    {user.name}
                                                </td>


                                                <td className="text-[10px] text-gray-600">
                                                    {user.department}
                                                </td>


                                            </tr>

                                        ))

                                    )

                        }

                    </tbody>

                </table>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">

                <p className="text-[9px] text-gray-500">
                    Showing {startItem}-{endItem} of {total} users
                </p>

                <div className="flex items-center gap-1">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        className="rounded border px-2 py-1 text-[9px] disabled:opacity-40"
                    >
                        {"<<"}
                    </button>

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="rounded border px-2 py-1 text-[9px] disabled:opacity-40"
                    >
                        {"<"}
                    </button>

                    <span className="px-2 text-[9px]">
                        {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="rounded border px-2 py-1 text-[9px] disabled:opacity-40"
                    >
                        {">"}
                    </button>

                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(totalPages)}
                        className="rounded border px-2 py-1 text-[9px] disabled:opacity-40"
                    >
                        {">>"}
                    </button>

                </div>

                <SaveFooter
                    onCancel={handleCancel}
                    onSave={handleSave}
                />

            </div>

        </div>

    );

}