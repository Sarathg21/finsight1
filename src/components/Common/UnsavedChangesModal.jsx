export default function UnsavedChangesModal({
    open,
    onStay,
    onDiscard
}) {

    if (!open) return null;


    return (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

            <div className="bg-white rounded p-4">

                <h3 className="text-sm font-semibold">
                    Unsaved Changes
                </h3>

                <p className="text-xs">
                    You have unsaved changes. Continue without saving?
                </p>


                <div className="flex gap-2 mt-3">

                    <button onClick={onStay}>
                        Stay
                    </button>


                    <button onClick={onDiscard}>
                        Discard
                    </button>

                </div>

            </div>

        </div>

    )

}