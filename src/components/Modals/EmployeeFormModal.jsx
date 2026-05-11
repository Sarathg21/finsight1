import { useState, useRef } from "react";
import {
  User, Briefcase, Building2, Users, Hash, UserPlus,
  ArrowLeft, CheckCircle, Loader2, Phone, Mail, AlertCircle
} from "lucide-react";
import CustomSelect from "../UI/CustomSelect";

/* ─── Reusable styled field label ─── */
const FieldLabel = ({ icon: Icon, color = "text-indigo-600", textColor = "text-indigo-700", children }) => (
  <label className={`flex items-center gap-1.5 text-xs font-bold ${textColor} capitalize tracking-wider mb-2`}>
    <Icon size={12} className={color} />
    {children}
  </label>
);

/* ─── Section card with colored left accent ─── */
const Section = ({ icon: Icon, headerBg, iconBg, iconColor, titleColor, title, children }) => (
  <div className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-visible animate-fade-in-up`}>
    <div className={`flex items-center gap-4 px-10 py-6 border-b border-slate-100 ${headerBg}/30 backdrop-blur-sm rounded-t-[2rem]`}>
      <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg shadow-indigo-100`}>
        <Icon size={20} className={iconColor} />
      </div>
      <span className={`text-base font-black ${titleColor} capitalize tracking-[0.2em]`}>{title}</span>
    </div>
    <div className="px-10 py-8 bg-white/50">{children}</div>
  </div>
);

/* ─── Main Component ─── */
const EmployeeFormModal = ({ onClose, onAdd, onEdit, managers, departments, initialData = null }) => {
  const isEdit = !!initialData;

  // Store the ORIGINAL emp_id at mount time — never changes, used for the PATCH URL
  const originalEmpId = useRef(initialData?.emp_id || initialData?.id || "");

  // Normalize department: find best matching option value
  const normalizeDeptId = () => {
    const empDeptId   = String(initialData?.department_id || initialData?.department || "");
    const empDeptName = (initialData?.department_name || "").toLowerCase();

    if (!Array.isArray(departments) || departments.length === 0) return empDeptId;

    // Try to find a department whose ID or name matches the employee's dept
    const match = departments.find(d => {
      const dId   = String(d.department_id || d.id || d.dept_id || "");
      const dName = (d.name || d.dept_name || "").toLowerCase();
      return dId === empDeptId || dName === empDeptName ||
             dId === empDeptName || dName === empDeptId.toLowerCase();
    });

    if (match) {
      return String(match.department_id || match.id || match.dept_id || empDeptId);
    }
    return empDeptId;
  };

  // Normalize phone: backend may use different field names
  const rawPhone = initialData?.phone || initialData?.phone_number || initialData?.phone_no
                || initialData?.contact_no || initialData?.contact
                || initialData?.mobile || initialData?.mobile_no || "";

  const [formData, setFormData] = useState({
    name:           initialData?.name || "",
    email:          initialData?.email || "",
    role:           initialData?.role || "EMPLOYEE",
    department_id:  normalizeDeptId(),
    manager_emp_id: initialData?.manager_emp_id || "",
    emp_id:         initialData?.emp_id || initialData?.id || "",
    phone:          rawPhone,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [apiError,   setApiError]   = useState("");

  const set = (key) => (e) => {
    setApiError(""); // clear error on any field change
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const inputCls = `w-full px-4 py-3.5 text-sm rounded-xl border-2 border-slate-200
    bg-white text-slate-800 font-medium placeholder-slate-400 focus:outline-none
    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    transition-all duration-200 hover:border-slate-400`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!formData.name.trim()) { setApiError("Full name is required."); return; }
    if (!formData.emp_id.trim()) { setApiError("Employee ID is required."); return; }
    if (!formData.email.trim()) { setApiError("Email address is required."); return; }

    setSubmitting(true);
    try {
      const payload = {
        name:           formData.name.trim(),
        email:          formData.email.trim(),
        role:           formData.role,
        department_id:  formData.department_id,
        manager_emp_id: formData.manager_emp_id || null,
        // Send phone under every possible field name the backend might accept
        phone:        formData.phone,
        phone_no:     formData.phone,
        contact_no:   formData.phone,
        mobile:       formData.phone,
        phone_number: formData.phone,   // backend confirmed field name from PATCH response
      };

      if (isEdit) {
        // Include new emp_id in payload (backend may support renaming);
        // originalEmpId is used for the PATCH URL regardless
        payload.emp_id = formData.emp_id.trim();
        await onEdit(payload, originalEmpId.current);
      } else {
        payload.emp_id = formData.emp_id.trim();
        await onAdd(payload);
      }

      // Only reach here if API succeeded (no throw)
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);

    } catch (err) {
      // Show the real API error message in the form
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Save failed — please check the details and try again.";
      setApiError(msg);
      console.error(`[EmployeeFormModal] ${isEdit ? "update" : "add"} failed:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <p className="text-lg font-bold text-slate-800">Employee {isEdit ? "Updated" : "Added"}!</p>
        <p className="text-sm text-slate-500">Syncing directory…</p>
      </div>
    );
  }

  // Build department options
  const deptOptions = (Array.isArray(departments) ? departments : []).map((d, idx) => {
    const val   = String(d.department_id || d.id || d.dept_id || `dept-${idx}`);
    const label = String(d.name || d.dept_name || d.department || val);
    return { value: val, label };
  });

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div
        className="relative rounded-[2rem] overflow-hidden px-12 py-12 flex items-center justify-between shadow-2xl"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 75%, #6366f1 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #818cf8, transparent)" }} />
          <div className="absolute bottom-0 left-40 w-36 h-36 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #38bdf8, transparent)" }} />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <UserPlus size={26} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-indigo-300 text-[11px] font-bold capitalize tracking-widest mb-0.5">Admin Console</p>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isEdit ? "Edit Employee Data" : "Add New Employee"}
            </h1>
            <p className="text-indigo-200 text-xs mt-0.5">
              {isEdit ? `Modifying profile for ${formData.name}` : "Fill in the details to register a new team member"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 relative z-10">
          {[["Departments", departments.length], ["Managers", managers.length]].map(([label, val]) => (
            <div key={label} className="px-4 py-2.5 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <div className="text-xl font-black text-white leading-none">{val}</div>
              <div className="text-indigo-300 text-[10px] font-semibold capitalize tracking-widest mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── API Error Banner ── */}
      {apiError && (
        <div className="flex items-start gap-3 px-6 py-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{apiError}</p>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Personal Info */}
        <Section
          icon={User}
          headerBg="bg-indigo-50" iconBg="bg-indigo-500" iconColor="text-white"
          titleColor="text-indigo-700"
          title="Personal Information"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full Name */}
            <div>
              <FieldLabel icon={User} color="text-indigo-500" textColor="text-indigo-700">Full Name</FieldLabel>
              <input type="text" className={inputCls} placeholder="e.g. Jane Doe"
                value={formData.name} onChange={set("name")} required />
            </div>

            {/* Employee ID — editable in both modes; PATCH uses original ID for URL */}
            <div>
              <FieldLabel icon={Hash} color="text-indigo-500" textColor="text-indigo-700">
                Employee ID{isEdit && <span className="ml-1 text-[10px] text-amber-500 font-bold">(changing updates the ID)</span>}
              </FieldLabel>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. EMP001"
                value={formData.emp_id}
                onChange={set("emp_id")}
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <FieldLabel icon={Phone} color="text-indigo-500" textColor="text-indigo-700">Contact Number</FieldLabel>
              <input
                type="tel"
                className={inputCls}
                placeholder="e.g. +1 234 567 890"
                value={formData.phone}
                onChange={set("phone")}
              />
            </div>

            {/* Email */}
            <div>
              <FieldLabel icon={Mail} color="text-indigo-500" textColor="text-indigo-700">Email Address</FieldLabel>
              <input type="email" className={inputCls} placeholder="e.g. jane@company.com"
                value={formData.email} onChange={set("email")} required />
            </div>

          </div>
        </Section>

        {/* Role & Department */}
        <div className="relative z-30">
          <Section
            icon={Briefcase}
            headerBg="bg-violet-50" iconBg="bg-violet-500" iconColor="text-white"
            titleColor="text-violet-700"
            title="Role & Department"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FieldLabel icon={Briefcase} color="text-violet-500" textColor="text-violet-700">Role</FieldLabel>
                <CustomSelect
                  options={[
                    { value: "EMPLOYEE", label: "Employee" },
                    { value: "MANAGER",  label: "Manager" },
                    { value: "CFO",      label: "CFO" },
                    { value: "ADMIN",    label: "Admin" },
                  ]}
                  value={formData.role}
                  onChange={(val) => { setApiError(""); setFormData(p => ({ ...p, role: val })); }}
                  className="w-full"
                />
              </div>
              <div>
                <FieldLabel icon={Building2} color="text-violet-500" textColor="text-violet-700">Department</FieldLabel>
                {deptOptions.length > 0 ? (
                  <CustomSelect
                    options={deptOptions}
                    value={formData.department_id}
                    onChange={(val) => { setApiError(""); setFormData(p => ({ ...p, department_id: val })); }}
                    className="w-full"
                  />
                ) : (
                  <input type="text" className={inputCls} placeholder="Department ID"
                    value={formData.department_id}
                    onChange={set("department_id")} />
                )}
                {/* Debug helper: show current value */}
                <p className="text-[10px] text-slate-400 mt-1">
                  Selected: <span className="font-mono text-violet-500">{formData.department_id || "—"}</span>
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Reporting Structure */}
        <div className="relative z-20">
          <Section
            icon={Users}
            headerBg="bg-sky-50" iconBg="bg-sky-500" iconColor="text-white"
            titleColor="text-sky-700"
            title="Reporting Structure"
          >
            <div>
              <FieldLabel icon={Users} color="text-sky-500" textColor="text-sky-700">Reporting Manager</FieldLabel>
              <CustomSelect
                options={[
                  { value: "", label: "— No Manager Assigned —" },
                  ...managers.filter(m => m.emp_id !== originalEmpId.current).map((m, idx) => ({
                    value: m.emp_id || m.id || `mgr-${idx}`,
                    label: `${m.name || "Unknown"} · ${m.department_name || m.department_id || m.department || "N/A"}`
                  }))
                ]}
                value={formData.manager_emp_id}
                onChange={(val) => { setApiError(""); setFormData(p => ({ ...p, manager_emp_id: val })); }}
                className="w-full"
              />
            </div>
          </Section>
        </div>

        {/* Action Footer */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl px-10 py-8 flex items-center justify-between gap-4">
          <p className="text-[10px] text-slate-400 font-black capitalize tracking-widest hidden sm:block">
            {isEdit
              ? "Changes are saved immediately to the database"
              : <><span className="font-normal">Default password: </span><span className="font-mono font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-lg border border-violet-100 ml-2">Tascade@123</span></>
            }
          </p>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600
                bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50
                rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <ArrowLeft size={15} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white rounded-xl
                transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: "0 4px 16px rgba(79,70,229,0.4)"
              }}
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> {isEdit ? "Saving..." : "Adding..."}</>
                : <><CheckCircle size={15} /> {isEdit ? "Save Changes" : "Add Employee"}</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeFormModal;
