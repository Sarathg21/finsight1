

// import { useState, useEffect } from "react";
// import { X, FolderPlus } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   addLegalGroup,
//   updateLegalGroup,
// } from "../../api/masterLegalApi";
// import toast from "react-hot-toast";

// export default function AddLegalGroupModal({
//   open,
//   onClose,
//   onSuccess,
//   editLegalGroup,
// }) {
//   const isEdit = !!editLegalGroup;

//   const [formData, setFormData] = useState({
//     legal_group_code: "",
//     legal_group_name: "",
//     active: true,
//   });

//   const [saving, setSaving] = useState(false);

//   // ------------------------------------------------------------
//   // RESPONSIVE STATE
//   // ------------------------------------------------------------

//   const [screenWidth, setScreenWidth] = useState(
//     typeof window !== "undefined" ? window.innerWidth : 1024
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       setScreenWidth(window.innerWidth);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const isMobile = screenWidth <= 640;
//   const isSmallMobile = screenWidth <= 420;

//   // ------------------------------------------------------------
//   // INPUT FOCUS STATE
//   // ------------------------------------------------------------

//   const [focusedInput, setFocusedInput] = useState(null);

//   // ------------------------------------------------------------
//   // HOVER STATES
//   // ------------------------------------------------------------

//   const [closeHovered, setCloseHovered] = useState(false);
//   const [cancelHovered, setCancelHovered] = useState(false);
//   const [saveHovered, setSaveHovered] = useState(false);

//   // ------------------------------------------------------------
//   // FORM INITIALIZATION
//   // ------------------------------------------------------------

//   useEffect(() => {
//     if (!open) return;

//     console.log("Edit Legal Group:", editLegalGroup);

//     if (editLegalGroup) {
//       setFormData({
//         legal_group_code:
//           editLegalGroup.legal_group_code || "",
//         legal_group_name:
//           editLegalGroup.legal_group_name || "",
//         active: editLegalGroup.active,
//       });
//     } else {
//       setFormData({
//         legal_group_code: "",
//         legal_group_name: "",
//         active: true,
//       });
//     }
//   }, [open, editLegalGroup]);

//   // ------------------------------------------------------------
//   // FORM CHANGE
//   // ------------------------------------------------------------

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ------------------------------------------------------------
//   // VALIDATION
//   // ------------------------------------------------------------

//   const validate = () => {
//     const errors = [];

//     if (!formData.legal_group_code.trim()) {
//       errors.push("Legal Group Code is required");
//     }

//     if (!formData.legal_group_name.trim()) {
//       errors.push("Legal Group Name is required");
//     }

//     if (errors.length > 0) {
//       errors.forEach((err) => toast.error(err));
//       return false;
//     }

//     return true;
//   };

//   const isFormValid = () => {
//     return (
//       formData.legal_group_code.trim() &&
//       formData.legal_group_name.trim()
//     );
//   };

//   // ------------------------------------------------------------
//   // CREATE / UPDATE
//   // ------------------------------------------------------------

//   const handleUpdate = async () => {
//     try {
//       setSaving(true);

//       const payload = {
//         legal_group_code: formData.legal_group_code,
//         legal_group_name: formData.legal_group_name,
//         active: formData.active,
//       };

//       console.log("UPDATE START");
//       console.log("DATA:", payload);

//       if (isEdit) {
//         console.log(
//           "EDIT ID:",
//           editLegalGroup?.legal_group_id
//         );

//         const response = await updateLegalGroup(
//           editLegalGroup.legal_group_id,
//           payload
//         );

//         console.log("API RESPONSE:", response);

//         toast.success(
//           "Legal Group updated successfully"
//         );
//       } else {
//         await addLegalGroup(payload);

//         toast.success(
//           "Legal Group created successfully"
//         );
//       }

//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.log("UPDATE ERROR:", error);

//       toast.error(
//         error?.response?.data?.detail ||
//           error?.response?.data?.message ||
//           "Unable to save Legal Group"
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSave = () => {
//     if (!validate()) return;

//     handleUpdate();
//   };

//   if (!open) return null;

//   // ------------------------------------------------------------
//   // RESPONSIVE VALUES
//   // Same values as original CSS
//   // ------------------------------------------------------------

//   const overlayPadding = isSmallMobile
//     ? "8px"
//     : isMobile
//       ? "12px"
//       : "16px";

//   const modalMaxHeight = isSmallMobile
//     ? "calc(100vh - 16px)"
//     : isMobile
//       ? "calc(100vh - 24px)"
//       : "calc(100vh - 32px)";

//   const modalBorderRadius = isMobile
//     ? "10px"
//     : "12px";

//   const headerPadding = isSmallMobile
//     ? "11px 12px"
//     : isMobile
//       ? "12px 14px"
//       : "14px 18px";

//   const headerMinHeight = isMobile
//     ? "62px"
//     : "68px";

//   const bodyPadding = isSmallMobile
//     ? "15px 12px"
//     : isMobile
//       ? "16px 14px"
//       : "20px 18px";

//   const footerPadding = isSmallMobile
//     ? "10px 12px"
//     : isMobile
//       ? "10px 14px"
//       : "12px 18px";

//   const footerMinHeight = isMobile
//     ? "60px"
//     : "64px";

//   const statusGap = isMobile
//     ? "18px"
//     : "24px";

//   const saveMinWidth = isSmallMobile
//     ? "120px"
//     : isMobile
//       ? "130px"
//       : "140px";

//   const buttonPadding = isSmallMobile
//     ? "0 12px"
//     : "0 16px";

//   const iconSize = isSmallMobile
//     ? "34px"
//     : "36px";

//   const titleFontSize = isSmallMobile
//     ? "15px"
//     : "16px";

//   const subtitleFontSize = isSmallMobile
//     ? "10px"
//     : "11px";

//   const footerGap = isSmallMobile
//     ? "6px"
//     : "8px";

//   // ------------------------------------------------------------
//   // INLINE STYLE OBJECTS
//   // ------------------------------------------------------------

//   const overlayStyle = {
//     position: "fixed",
//     inset: 0,
//     zIndex: 9999,

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",

//     padding: overlayPadding,

//     backgroundColor: "rgba(15, 23, 42, 0.45)",

//     backdropFilter: "blur(4px)",
//     WebkitBackdropFilter: "blur(4px)",

//     overflow: "hidden",

//     boxSizing: "border-box",
//   };

//   const modalStyle = {
//     width: "100%",
//     maxWidth: "600px",

//     height: "auto",
//     maxHeight: modalMaxHeight,

//     backgroundColor: "#ffffff",

//     border: "1px solid #e5e7eb",
//     borderRadius: modalBorderRadius,

//     boxShadow:
//       "0 24px 60px rgba(15, 23, 42, 0.22)",

//     overflow: "hidden",

//     display: "flex",
//     flexDirection: "column",

//     boxSizing: "border-box",

//     position: "relative",
//   };

//   const headerStyle = {
//     width: "100%",

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",

//     padding: headerPadding,

//     backgroundColor: "#f8fafc",

//     borderBottom: "1px solid #e5e7eb",

//     flexShrink: 0,

//     boxSizing: "border-box",

//     minHeight: headerMinHeight,
//   };

//   const headerLeftStyle = {
//     display: "flex",
//     alignItems: "center",

//     gap: "10px",

//     minWidth: 0,

//     flex: 1,
//   };

//   const iconStyle = {
//     width: iconSize,
//     height: iconSize,
//     minWidth: iconSize,

//     borderRadius: "9px",

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",

//     backgroundColor: "#eff6ff",

//     color: "#2563eb",

//     border: "1px solid #dbeafe",

//     boxSizing: "border-box",
//   };

//   const titleWrapperStyle = {
//     minWidth: 0,
//     flex: 1,
//   };

//   const titleStyle = {
//     margin: 0,

//     fontSize: titleFontSize,
//     lineHeight: "21px",

//     fontWeight: 600,

//     color: "#111827",

//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const subtitleStyle = {
//     margin: "2px 0 0",

//     fontSize: subtitleFontSize,
//     lineHeight: "15px",

//     color: "#6b7280",

//     whiteSpace: "nowrap",
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   };

//   const closeButtonStyle = {
//     width: "30px",
//     height: "30px",
//     minWidth: "30px",

//     marginLeft: "10px",

//     border: "none",
//     borderRadius: "7px",

//     backgroundColor:
//       closeHovered && !saving
//         ? "#e5e7eb"
//         : "transparent",

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",

//     color:
//       closeHovered && !saving
//         ? "#111827"
//         : "#6b7280",

//     cursor: saving
//       ? "not-allowed"
//       : "pointer",

//     transition:
//       "background-color 0.15s ease, color 0.15s ease",

//     padding: 0,

//     flexShrink: 0,

//     opacity: saving ? 0.6 : 1,

//     boxSizing: "border-box",
//   };

//   const bodyStyle = {
//     width: "100%",

//     padding: bodyPadding,

//     overflowY: "auto",
//     overflowX: "hidden",

//     flex: "1 1 auto",

//     minHeight: 0,

//     boxSizing: "border-box",
//   };

//   const formStyle = {
//     width: "100%",

//     display: "flex",
//     flexDirection: "column",

//     gap: "16px",

//     boxSizing: "border-box",
//   };

//   const fieldStyle = {
//     width: "100%",
//   };

//   const labelStyle = {
//     display: "block",

//     marginBottom: "6px",

//     fontSize: "12px",
//     lineHeight: "16px",

//     fontWeight: 600,

//     color: "#374151",
//   };

//   const statusLabelStyle = {
//     ...labelStyle,
//     marginBottom: "8px",
//   };

//   const requiredStyle = {
//     marginLeft: "4px",
//     color: "#dc2626",
//   };

//   const getInputStyle = (name) => ({
//     display: "block",

//     width: "100%",
//     height: "40px",

//     boxSizing: "border-box",

//     padding: "0 12px",

//     border:
//       focusedInput === name
//         ? "1px solid #3b82f6"
//         : "1px solid #d1d5db",

//     borderRadius: "7px",

//     backgroundColor: saving
//       ? "#f9fafb"
//       : "#ffffff",

//     color: "#111827",

//     fontFamily: "inherit",

//     fontSize: "13px",
//     lineHeight: "18px",

//     outline: "none",

//     transition:
//       "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",

//     appearance: "none",

//     boxShadow:
//       focusedInput === name
//         ? "0 0 0 3px rgba(59, 130, 246, 0.12)"
//         : "none",

//     opacity: saving ? 0.75 : 1,

//     cursor: saving
//       ? "not-allowed"
//       : "text",
//   });

//   const statusOptionsStyle = {
//     display: "flex",
//     alignItems: "center",

//     gap: statusGap,

//     minHeight: "24px",
//   };

//   const radioLabelStyle = {
//     display: "inline-flex",

//     alignItems: "center",

//     gap: "7px",

//     cursor: saving
//       ? "not-allowed"
//       : "pointer",

//     fontSize: "13px",
//     lineHeight: "18px",

//     color: "#374151",

//     userSelect: "none",

//     opacity: saving ? 0.65 : 1,
//   };

//   const radioStyle = {
//     width: "15px",
//     height: "15px",

//     margin: 0,
//     padding: 0,

//     accentColor: "#2563eb",

//     cursor: saving
//       ? "not-allowed"
//       : "pointer",

//     flexShrink: 0,
//   };

//   const footerStyle = {
//     width: "100%",

//     display: "flex",
//     alignItems: "center",
//     justifyContent: "flex-end",

//     gap: footerGap,

//     padding: footerPadding,

//     backgroundColor: "#f8fafc",

//     borderTop: "1px solid #e5e7eb",

//     flexShrink: 0,

//     boxSizing: "border-box",

//     minHeight: footerMinHeight,
//   };

//   const cancelButtonStyle = {
//     height: "36px",

//     padding: buttonPadding,

//     borderRadius: "7px",

//     border: "1px solid #d1d5db",

//     backgroundColor:
//       cancelHovered && !saving
//         ? "#f3f4f6"
//         : "#ffffff",

//     color: "#374151",

//     fontFamily: "inherit",

//     fontSize: "12px",
//     lineHeight: "16px",

//     fontWeight: 500,

//     cursor: saving
//       ? "not-allowed"
//       : "pointer",

//     opacity: saving ? 0.6 : 1,

//     transition:
//       "background-color 0.15s ease, border-color 0.15s ease",

//     boxSizing: "border-box",

//     whiteSpace: "nowrap",
//   };

//   const saveDisabled =
//     saving || !isFormValid();

//   const saveButtonStyle = {
//     height: "36px",

//     minWidth: saveMinWidth,

//     padding: buttonPadding,

//     borderRadius: "7px",

//     border: "1px solid transparent",

//     backgroundColor: saveDisabled
//       ? "#9ca3af"
//       : saveHovered
//         ? "#1d4ed8"
//         : "#2563eb",

//     color: "#ffffff",

//     fontFamily: "inherit",

//     fontSize: "12px",
//     lineHeight: "16px",

//     fontWeight: 600,

//     cursor: saveDisabled
//       ? "not-allowed"
//       : "pointer",

//     transition:
//       "background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",

//     boxSizing: "border-box",

//     whiteSpace: "nowrap",

//     boxShadow: saveDisabled
//       ? "none"
//       : saveHovered
//         ? "0 2px 4px rgba(37, 99, 235, 0.22)"
//         : "0 1px 2px rgba(37, 99, 235, 0.2)",
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         style={overlayStyle}
//       >
//         <motion.div
//           initial={{
//             opacity: 0,
//             scale: 0.96,
//             y: 20,
//           }}
//           animate={{
//             opacity: 1,
//             scale: 1,
//             y: 0,
//           }}
//           exit={{
//             opacity: 0,
//             scale: 0.96,
//             y: 20,
//           }}
//           transition={{
//             duration: 0.22,
//             ease: "easeOut",
//           }}
//           style={modalStyle}
//         >
//           {/* =====================================================
//               HEADER
//           ====================================================== */}

//           <div style={headerStyle}>
//             <div style={headerLeftStyle}>
//               <div style={iconStyle}>
//                 <FolderPlus
//                   size={18}
//                   strokeWidth={2}
//                 />
//               </div>

//               <div style={titleWrapperStyle}>
//                 <h2 style={titleStyle}>
//                   {isEdit
//                     ? "Edit Legal Group"
//                     : "Add Legal Group"}
//                 </h2>

//                 <p style={subtitleStyle}>
//                   {isEdit
//                     ? "Update legal group information"
//                     : "Create a new legal group"}
//                 </p>
//               </div>
//             </div>

//             {/* CLOSE BUTTON */}

//             <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               aria-label="Close modal"
//               style={closeButtonStyle}
//               onMouseEnter={() => {
//                 if (!saving) {
//                   setCloseHovered(true);
//                 }
//               }}
//               onMouseLeave={() => {
//                 setCloseHovered(false);
//               }}
//             >
//               <X size={18} />
//             </button>
//           </div>

//           {/* =====================================================
//               BODY
//           ====================================================== */}

//           <div style={bodyStyle}>
//             <div style={formStyle}>

//               {/* =================================================
//                   LEGAL GROUP CODE
//               ================================================== */}

//               <div style={fieldStyle}>
//                 <label
//                   htmlFor="legal_group_code"
//                   style={labelStyle}
//                 >
//                   Legal Group Code

//                   <span style={requiredStyle}>
//                     *
//                   </span>
//                 </label>

//                 <input
//                   id="legal_group_code"
//                   type="text"
//                   name="legal_group_code"
//                   value={
//                     formData.legal_group_code
//                   }
//                   onChange={handleChange}
//                   onFocus={() => {
//                     setFocusedInput(
//                       "legal_group_code"
//                     );
//                   }}
//                   onBlur={() => {
//                     setFocusedInput(null);
//                   }}
//                   placeholder="Enter Legal Group Code"
//                   disabled={saving}
//                   style={getInputStyle(
//                     "legal_group_code"
//                   )}
//                 />
//               </div>

//               {/* =================================================
//                   LEGAL GROUP NAME
//               ================================================== */}

//               <div style={fieldStyle}>
//                 <label
//                   htmlFor="legal_group_name"
//                   style={labelStyle}
//                 >
//                   Legal Group Name

//                   <span style={requiredStyle}>
//                     *
//                   </span>
//                 </label>

//                 <input
//                   id="legal_group_name"
//                   type="text"
//                   name="legal_group_name"
//                   value={
//                     formData.legal_group_name
//                   }
//                   onChange={handleChange}
//                   onFocus={() => {
//                     setFocusedInput(
//                       "legal_group_name"
//                     );
//                   }}
//                   onBlur={() => {
//                     setFocusedInput(null);
//                   }}
//                   placeholder="Enter Legal Group Name"
//                   disabled={saving}
//                   style={getInputStyle(
//                     "legal_group_name"
//                   )}
//                 />
//               </div>

//               {/* =================================================
//                   ACTIVE STATUS
//               ================================================== */}

//               <div style={fieldStyle}>
//                 <label style={statusLabelStyle}>
//                   Active Status
//                 </label>

//                 <div style={statusOptionsStyle}>

//                   {/* ACTIVE */}

//                   <label style={radioLabelStyle}>
//                     <input
//                       type="radio"
//                       name="activeStatus"
//                       checked={
//                         formData.active === true
//                       }
//                       onChange={() =>
//                         setFormData({
//                           ...formData,
//                           active: true,
//                         })
//                       }
//                       disabled={saving}
//                       style={radioStyle}
//                     />

//                     <span>Active</span>
//                   </label>

//                   {/* INACTIVE */}

//                   <label style={radioLabelStyle}>
//                     <input
//                       type="radio"
//                       name="activeStatus"
//                       checked={
//                         formData.active === false
//                       }
//                       onChange={() =>
//                         setFormData({
//                           ...formData,
//                           active: false,
//                         })
//                       }
//                       disabled={saving}
//                       style={radioStyle}
//                     />

//                     <span>Inactive</span>
//                   </label>

//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* =====================================================
//               FOOTER
//           ====================================================== */}

//           <div style={footerStyle}>

//             {/* CANCEL */}

//             <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               style={cancelButtonStyle}
//               onMouseEnter={() => {
//                 if (!saving) {
//                   setCancelHovered(true);
//                 }
//               }}
//               onMouseLeave={() => {
//                 setCancelHovered(false);
//               }}
//             >
//               Cancel
//             </button>

//             {/* SAVE / UPDATE */}

//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={saveDisabled}
//               style={saveButtonStyle}
//               onMouseEnter={() => {
//                 if (!saveDisabled) {
//                   setSaveHovered(true);
//                 }
//               }}
//               onMouseLeave={() => {
//                 setSaveHovered(false);
//               }}
//             >
//               {saving
//                 ? isEdit
//                   ? "Updating..."
//                   : "Saving..."
//                 : isEdit
//                   ? "Update Legal Group"
//                   : "Save Legal Group"}
//             </button>

//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }


import { useState, useEffect } from "react";
import { X, FolderPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    addLegalGroup,
    updateLegalGroup,
} from "../../api/masterLegalApi";
import toast from "react-hot-toast";

export default function AddLegalGroupModal({
    open,
    onClose,
    onSuccess,
    editLegalGroup,
}) {
    const isEdit = !!editLegalGroup;

    const [formData, setFormData] = useState({
        legal_group_code: "",
        legal_group_name: "",
        active: true,
    });

    const [saving, setSaving] = useState(false);

    // ------------------------------------------------------------
    // RESPONSIVE STATE
    // ------------------------------------------------------------

    const [screenWidth, setScreenWidth] = useState(
        typeof window !== "undefined"
            ? window.innerWidth
            : 1024
    );

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    const isMobile = screenWidth <= 640;
    const isSmallMobile = screenWidth <= 420;

    // ------------------------------------------------------------
    // INPUT FOCUS STATE
    // ------------------------------------------------------------

    const [focusedInput, setFocusedInput] = useState(null);

    // ------------------------------------------------------------
    // HOVER STATES
    // ------------------------------------------------------------

    const [closeHovered, setCloseHovered] = useState(false);
    const [cancelHovered, setCancelHovered] = useState(false);
    const [saveHovered, setSaveHovered] = useState(false);

    // ------------------------------------------------------------
    // FORM INITIALIZATION
    // ------------------------------------------------------------

    useEffect(() => {
        if (!open) return;

        console.log(
            "Edit Legal Group:",
            editLegalGroup
        );

        if (editLegalGroup) {
            setFormData({
                legal_group_code:
                    editLegalGroup.legal_group_code || "",
                legal_group_name:
                    editLegalGroup.legal_group_name || "",
                active: editLegalGroup.active,
            });
        } else {
            setFormData({
                legal_group_code: "",
                legal_group_name: "",
                active: true,
            });
        }
    }, [open, editLegalGroup]);

    // ------------------------------------------------------------
    // FORM CHANGE
    // ------------------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------

    const validate = () => {
        const errors = [];

        if (!formData.legal_group_code.trim()) {
            errors.push(
                "Legal Group Code is required"
            );
        }

        if (!formData.legal_group_name.trim()) {
            errors.push(
                "Legal Group Name is required"
            );
        }

        if (errors.length > 0) {
            errors.forEach((err) =>
                toast.error(err)
            );

            return false;
        }

        return true;
    };

    const isFormValid = () => {
        return (
            formData.legal_group_code.trim() &&
            formData.legal_group_name.trim()
        );
    };

    // ------------------------------------------------------------
    // CREATE / UPDATE
    // ------------------------------------------------------------

    const handleUpdate = async () => {
        try {
            setSaving(true);

            const payload = {
                legal_group_code:
                    formData.legal_group_code,
                legal_group_name:
                    formData.legal_group_name,
                active: formData.active,
            };

            console.log("UPDATE START");
            console.log("DATA:", payload);

            if (isEdit) {
                console.log(
                    "EDIT ID:",
                    editLegalGroup?.legal_group_id
                );

                const response =
                    await updateLegalGroup(
                        editLegalGroup.legal_group_id,
                        payload
                    );

                console.log(
                    "API RESPONSE:",
                    response
                );

                toast.success(
                    "Legal Group updated successfully"
                );
            } else {
                await addLegalGroup(payload);

                toast.success(
                    "Legal Group created successfully"
                );
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.log(
                "UPDATE ERROR:",
                error
            );

            toast.error(
                error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    "Unable to save Legal Group"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        if (!validate()) return;

        handleUpdate();
    };

    if (!open) return null;

    // ------------------------------------------------------------
    // RESPONSIVE VALUES
    // ------------------------------------------------------------

    const overlayPadding = isSmallMobile
        ? "10px"
        : isMobile
        ? "16px"
        : "24px";

    const modalWidth = isSmallMobile
        ? "100%"
        : isMobile
        ? "100%"
        : "560px";

    const modalMaxHeight = isSmallMobile
        ? "calc(100vh - 20px)"
        : isMobile
        ? "calc(100vh - 32px)"
        : "min(620px, calc(100vh - 48px))";

    const modalBorderRadius = isMobile
        ? "10px"
        : "12px";

    const headerPadding = isSmallMobile
        ? "14px 16px"
        : isMobile
        ? "16px 18px"
        : "17px 20px";

    const bodyPadding = isSmallMobile
        ? "18px 16px"
        : isMobile
        ? "22px 18px"
        : "24px 20px";

    const footerPadding = isSmallMobile
        ? "12px 16px"
        : isMobile
        ? "14px 18px"
        : "14px 20px";

    const statusGap = isMobile
        ? "24px"
        : "30px";

    const saveMinWidth = isSmallMobile
        ? "118px"
        : isMobile
        ? "130px"
        : "142px";

    const buttonPadding = isSmallMobile
        ? "0 14px"
        : "0 18px";

    // ------------------------------------------------------------
    // OVERLAY
    // ------------------------------------------------------------

    const overlayStyle = {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,

        zIndex: 9999,

        width: "100%",
        height: "100%",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: overlayPadding,

        backgroundColor:
            "rgba(15, 23, 42, 0.45)",

        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",

        overflowY: "auto",
        overflowX: "hidden",

        boxSizing: "border-box",
    };

    // ------------------------------------------------------------
    // MODAL
    // ------------------------------------------------------------

    const modalStyle = {
        width: modalWidth,
        maxWidth: "100%",
        maxHeight: modalMaxHeight,

        backgroundColor: "#ffffff",

        border: "1px solid #e5e7eb",
        borderRadius: modalBorderRadius,

        boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.20)",

        display: "flex",
        flexDirection: "column",

        overflow: "hidden",

        boxSizing: "border-box",

        flexShrink: 0,

        margin: "auto",
    };

    // ------------------------------------------------------------
    // HEADER
    // ------------------------------------------------------------

    const headerStyle = {
        width: "100%",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: headerPadding,

        backgroundColor: "#ffffff",

        borderBottom:
            "1px solid #e5e7eb",

        boxSizing: "border-box",

        flexShrink: 0,

        minHeight: "68px",
    };

    const headerLeftStyle = {
        display: "flex",
        alignItems: "center",

        gap: "12px",

        minWidth: 0,

        flex: 1,
    };

    const iconStyle = {
        width: "38px",
        height: "38px",
        minWidth: "38px",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: "9px",

        backgroundColor: "#eff6ff",

        color: "#2563eb",

        border:
            "1px solid #dbeafe",

        boxSizing: "border-box",

        flexShrink: 0,
    };

    const titleWrapperStyle = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",

        minWidth: 0,

        flex: 1,

        overflow: "hidden",
    };

    const titleStyle = {
        margin: 0,

        padding: 0,

        fontSize: isSmallMobile
            ? "15px"
            : "16px",

        lineHeight: "20px",

        fontWeight: 600,

        color: "#111827",

        whiteSpace: "nowrap",

        overflow: "hidden",

        textOverflow: "ellipsis",
    };

    const subtitleStyle = {
        margin: "3px 0 0",

        padding: 0,

        fontSize: isSmallMobile
            ? "10px"
            : "11px",

        lineHeight: "15px",

        color: "#6b7280",

        whiteSpace: "nowrap",

        overflow: "hidden",

        textOverflow: "ellipsis",
    };

    const closeButtonStyle = {
        width: "34px",
        height: "34px",
        minWidth: "34px",

        marginLeft: "12px",

        padding: 0,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        border: "none",

        borderRadius: "7px",

        backgroundColor:
            closeHovered && !saving
                ? "#f3f4f6"
                : "transparent",

        color:
            closeHovered && !saving
                ? "#111827"
                : "#6b7280",

        cursor: saving
            ? "not-allowed"
            : "pointer",

        opacity: saving ? 0.6 : 1,

        flexShrink: 0,

        boxSizing: "border-box",

        transition:
            "background-color 0.15s ease, color 0.15s ease",
    };

    // ------------------------------------------------------------
    // BODY
    // ------------------------------------------------------------

    const bodyStyle = {
        width: "100%",

        padding: bodyPadding,

        boxSizing: "border-box",

        flex: "1 1 auto",

        minHeight: 0,

        overflowY: "auto",
        overflowX: "hidden",
    };

    const formStyle = {
        width: "100%",

        display: "flex",

        flexDirection: "column",

        gap: "22px",

        boxSizing: "border-box",
    };

    const fieldStyle = {
        width: "100%",

        display: "flex",

        flexDirection: "column",

        boxSizing: "border-box",

        minWidth: 0,
    };

    const labelStyle = {
        width: "100%",

        display: "block",

        margin: "0 0 7px",

        padding: 0,

        fontSize: "12px",

        lineHeight: "16px",

        fontWeight: 600,

        color: "#374151",

        boxSizing: "border-box",
    };

    const statusLabelStyle = {
        ...labelStyle,

        marginBottom: "10px",
    };

    const requiredStyle = {
        marginLeft: "4px",

        color: "#dc2626",

        fontWeight: 600,
    };

    const getInputStyle = (name) => ({
        width: "100%",

        height: "40px",

        minHeight: "40px",

        display: "block",

        boxSizing: "border-box",

        padding: "0 12px",

        margin: 0,

        border:
            focusedInput === name
                ? "1px solid #2563eb"
                : "1px solid #d1d5db",

        borderRadius: "7px",

        backgroundColor: saving
            ? "#f9fafb"
            : "#ffffff",

        color: "#111827",

        fontFamily: "inherit",

        fontSize: "13px",

        lineHeight: "18px",

        outline: "none",

        boxShadow:
            focusedInput === name
                ? "0 0 0 3px rgba(37, 99, 235, 0.10)"
                : "none",

        opacity: saving ? 0.75 : 1,

        cursor: saving
            ? "not-allowed"
            : "text",

        transition:
            "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",

        appearance: "none",
    });

    // ------------------------------------------------------------
    // STATUS
    // ------------------------------------------------------------

    const statusOptionsStyle = {
        width: "100%",

        minHeight: "24px",

        display: "flex",

        alignItems: "center",

        gap: statusGap,

        boxSizing: "border-box",
    };

    const radioLabelStyle = {
        display: "inline-flex",

        alignItems: "center",

        justifyContent: "flex-start",

        gap: "8px",

        margin: 0,

        padding: 0,

        fontSize: "13px",

        lineHeight: "18px",

        color: "#374151",

        fontWeight: 400,

        cursor: saving
            ? "not-allowed"
            : "pointer",

        userSelect: "none",

        whiteSpace: "nowrap",

        opacity: saving ? 0.65 : 1,
    };

    const radioStyle = {
        width: "15px",

        height: "15px",

        minWidth: "15px",

        margin: 0,

        padding: 0,

        accentColor: "#2563eb",

        cursor: saving
            ? "not-allowed"
            : "pointer",

        flexShrink: 0,
    };

    // ------------------------------------------------------------
    // FOOTER
    // ------------------------------------------------------------

    const footerStyle = {
        width: "100%",

        display: "flex",

        alignItems: "center",

        justifyContent: "flex-end",

        gap: "10px",

        padding: footerPadding,

        backgroundColor: "#ffffff",

        borderTop:
            "1px solid #e5e7eb",

        boxSizing: "border-box",

        flexShrink: 0,

        minHeight: "64px",
    };

    const cancelButtonStyle = {
        height: "36px",

        minHeight: "36px",

        padding: buttonPadding,

        margin: 0,

        border:
            "1px solid #d1d5db",

        borderRadius: "7px",

        backgroundColor:
            cancelHovered && !saving
                ? "#f9fafb"
                : "#ffffff",

        color: "#374151",

        fontFamily: "inherit",

        fontSize: "12px",

        lineHeight: "16px",

        fontWeight: 500,

        cursor: saving
            ? "not-allowed"
            : "pointer",

        opacity: saving ? 0.6 : 1,

        boxSizing: "border-box",

        whiteSpace: "nowrap",

        transition:
            "background-color 0.15s ease, border-color 0.15s ease",
    };

    const saveDisabled =
        saving || !isFormValid();

    const saveButtonStyle = {
        height: "36px",

        minHeight: "36px",

        minWidth: saveMinWidth,

        padding: buttonPadding,

        margin: 0,

        border:
            "1px solid transparent",

        borderRadius: "7px",

        backgroundColor: saveDisabled
            ? "#9ca3af"
            : saveHovered
            ? "#1d4ed8"
            : "#2563eb",

        color: "#ffffff",

        fontFamily: "inherit",

        fontSize: "12px",

        lineHeight: "16px",

        fontWeight: 600,

        cursor: saveDisabled
            ? "not-allowed"
            : "pointer",

        boxSizing: "border-box",

        whiteSpace: "nowrap",

        opacity: saveDisabled ? 0.75 : 1,

        transition:
            "background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",

        boxShadow: saveDisabled
            ? "none"
            : saveHovered
            ? "0 2px 5px rgba(37, 99, 235, 0.20)"
            : "0 1px 2px rgba(37, 99, 235, 0.15)",
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={overlayStyle}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    transition={{
                        duration: 0.22,
                        ease: "easeOut",
                    }}
                    style={modalStyle}
                >
                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div style={headerStyle}>
                        <div
                            style={
                                headerLeftStyle
                            }
                        >
                            <div
                                style={iconStyle}
                            >
                                <FolderPlus
                                    size={18}
                                    strokeWidth={2}
                                />
                            </div>

                            <div
                                style={
                                    titleWrapperStyle
                                }
                            >
                                <h2
                                    style={
                                        titleStyle
                                    }
                                >
                                    {isEdit
                                        ? "Edit Legal Group"
                                        : "Add Legal Group"}
                                </h2>

                                <p
                                    style={
                                        subtitleStyle
                                    }
                                >
                                    {isEdit
                                        ? "Update legal group information"
                                        : "Create a new legal group"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            aria-label="Close modal"
                            style={
                                closeButtonStyle
                            }
                            onMouseEnter={() => {
                                if (!saving) {
                                    setCloseHovered(
                                        true
                                    );
                                }
                            }}
                            onMouseLeave={() => {
                                setCloseHovered(
                                    false
                                );
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* =====================================================
                        BODY
                    ====================================================== */}

                    <div style={bodyStyle}>
                        <div style={formStyle}>
                            {/* LEGAL GROUP CODE */}

                            <div
                                style={
                                    fieldStyle
                                }
                            >
                                <label
                                    htmlFor="legal_group_code"
                                    style={
                                        labelStyle
                                    }
                                >
                                    Legal Group Code

                                    <span
                                        style={
                                            requiredStyle
                                        }
                                    >
                                        *
                                    </span>
                                </label>

                                <input
                                    id="legal_group_code"
                                    type="text"
                                    name="legal_group_code"
                                    value={
                                        formData.legal_group_code
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onFocus={() => {
                                        setFocusedInput(
                                            "legal_group_code"
                                        );
                                    }}
                                    onBlur={() => {
                                        setFocusedInput(
                                            null
                                        );
                                    }}
                                    placeholder="Enter Legal Group Code"
                                    disabled={saving}
                                    style={getInputStyle(
                                        "legal_group_code"
                                    )}
                                />
                            </div>

                            {/* LEGAL GROUP NAME */}

                            <div
                                style={
                                    fieldStyle
                                }
                            >
                                <label
                                    htmlFor="legal_group_name"
                                    style={
                                        labelStyle
                                    }
                                >
                                    Legal Group Name

                                    <span
                                        style={
                                            requiredStyle
                                        }
                                    >
                                        *
                                    </span>
                                </label>

                                <input
                                    id="legal_group_name"
                                    type="text"
                                    name="legal_group_name"
                                    value={
                                        formData.legal_group_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    onFocus={() => {
                                        setFocusedInput(
                                            "legal_group_name"
                                        );
                                    }}
                                    onBlur={() => {
                                        setFocusedInput(
                                            null
                                        );
                                    }}
                                    placeholder="Enter Legal Group Name"
                                    disabled={saving}
                                    style={getInputStyle(
                                        "legal_group_name"
                                    )}
                                />
                            </div>

                            {/* ACTIVE STATUS */}

                            <div
                                style={
                                    fieldStyle
                                }
                            >
                                <label
                                    style={
                                        statusLabelStyle
                                    }
                                >
                                    Active Status
                                </label>

                                <div
                                    style={
                                        statusOptionsStyle
                                    }
                                >
                                    {/* ACTIVE */}

                                    <label
                                        style={
                                            radioLabelStyle
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="activeStatus"
                                            checked={
                                                formData.active ===
                                                true
                                            }
                                            onChange={() =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        active: true,
                                                    }
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            style={
                                                radioStyle
                                            }
                                        />

                                        <span>
                                            Active
                                        </span>
                                    </label>

                                    {/* INACTIVE */}

                                    <label
                                        style={
                                            radioLabelStyle
                                        }
                                    >
                                        <input
                                            type="radio"
                                            name="activeStatus"
                                            checked={
                                                formData.active ===
                                                false
                                            }
                                            onChange={() =>
                                                setFormData(
                                                    {
                                                        ...formData,
                                                        active: false,
                                                    }
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            style={
                                                radioStyle
                                            }
                                        />

                                        <span>
                                            Inactive
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        FOOTER
                    ====================================================== */}

                    <div
                        style={footerStyle}
                    >
                        {/* CANCEL */}

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            style={
                                cancelButtonStyle
                            }
                            onMouseEnter={() => {
                                if (!saving) {
                                    setCancelHovered(
                                        true
                                    );
                                }
                            }}
                            onMouseLeave={() => {
                                setCancelHovered(
                                    false
                                );
                            }}
                        >
                            Cancel
                        </button>

                        {/* SAVE / UPDATE */}

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saveDisabled
                            }
                            style={
                                saveButtonStyle
                            }
                            onMouseEnter={() => {
                                if (
                                    !saveDisabled
                                ) {
                                    setSaveHovered(
                                        true
                                    );
                                }
                            }}
                            onMouseLeave={() => {
                                setSaveHovered(
                                    false
                                );
                            }}
                        >
                            {saving
                                ? isEdit
                                    ? "Updating..."
                                    : "Saving..."
                                : isEdit
                                ? "Update Legal Group"
                                : "Save Legal Group"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}