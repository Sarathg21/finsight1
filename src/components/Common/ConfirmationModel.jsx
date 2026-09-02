

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
        className="fixed inset-0 z-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          boxSizing: "border-box",
        }}
      >
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.18)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* CONTENT */}
          <div
            style={{
              width: "100%",
              padding: "24px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {/* WARNING ICON */}
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                backgroundColor: "#fef3c7",
                boxSizing: "border-box",
              }}
            >
              <AlertTriangle
                size={28}
                style={{
                  color: "#d97706",
                  flexShrink: 0,
                }}
              />
            </div>

            {/* TITLE */}
            <h2
              style={{
                margin: "16px 0 0",
                padding: 0,
                fontSize: "17px",
                lineHeight: "24px",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {title}
            </h2>

            {/* MESSAGE */}
            <p
              style={{
                margin: "8px 0 0",
                padding: 0,
                fontSize: "13px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#6b7280",
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
            >
              {message}
            </p>

            {/* ACTION BUTTONS */}
            <div
              style={{
                width: "100%",
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxSizing: "border-box",
              }}
            >
              {/* CANCEL */}
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                style={{
                  minWidth: "90px",
                  height: "36px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "7px",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 500,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading ? 0.6 : 1,
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                }}
              >
                {cancelText}
              </button>

              {/* CONFIRM */}
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                style={{
                  minWidth: "90px",
                  height: "36px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 16px",
                  border: "1px solid #2563eb",
                  borderRadius: "7px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 500,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxSizing: "border-box",
                  whiteSpace: "nowrap",
                }}
              >
                {loading
                  ? "Please wait..."
                  : confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

