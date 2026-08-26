import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        >
          <div className="p-6 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle
                className="text-yellow-600"
                size={28}
              />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {message}
            </p>

            <div className="mt-6 flex justify-center gap-3">

              <button
                onClick={onCancel}
                className="rounded-lg border border-gray-300 px-5 py-2 hover:bg-gray-100"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                {loading ? "Please wait..." : confirmText}
              </button>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}