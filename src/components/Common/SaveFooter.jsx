export default function SaveFooter({
    onCancel,
    onSave,
    loading = false,
}) {

    return (
        <div className="
            flex
            items-center
            justify-end
            gap-2
            border-t
            border-gray-200
            px-2
            py-2
        ">

            <button
                onClick={onCancel}
                className="
                    rounded
                    border
                    border-gray-300
                    px-2
                    py-1
                    text-[10px]
                "
            >
                Cancel
            </button>


            <button
                onClick={onSave}
                disabled={loading}
                className="
                    rounded
                    bg-blue-600
                    px-2
                    py-1
                    text-[9px]
                    text-white
                    disabled:opacity-50
                "
            >
                {loading ? "Saving..." : "Save Changes"}
            </button>

        </div>
    );
}