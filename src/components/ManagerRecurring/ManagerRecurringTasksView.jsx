import React from 'react';
import { Plus, Edit2, Trash2, Loader2, Eye, X, Info } from 'lucide-react';
import ConfirmationModal from '../UI/ConfirmationModal';

const PriorityBadge = ({ priority, styles }) => {
    const level = String(priority || 'MEDIUM').toUpperCase();
    return (
        <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${styles[level] || styles.MEDIUM}`}>
            {level}
        </span>
    );
};

const StatusBadge = ({ active }) => (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase ${active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
        {active !== false ? 'ACTIVE' : 'INACTIVE'}
    </span>
);

const formatDate = (value) => {
    if (!value) return '—';
    const raw = String(value).trim();
    const iso = raw.length >= 10 ? raw.slice(0, 10) : raw;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PRIORITY_STYLES = {
    HIGH: 'bg-rose-50 text-rose-600 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const EmployeeActionFormPanel = ({
    formMode,
    selectedBranch,
    formData,
    setFormData,
    departmentLabel,
    employees,
    employeeLoading,
    actionLoading,
    onCloseForm,
    onSave,
    onCancelEdit,
}) => (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800">
                {formMode === 'edit' ? 'Edit Recurring Employee Action' : 'Add Recurring Employee Action'}
            </h3>
            {formMode === 'edit' && onCloseForm && (
                <button type="button" onClick={onCloseForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
                    <X size={18} />
                </button>
            )}
        </div>

        {!selectedBranch ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
                Select a recurring branch above, then use <strong className="text-slate-700">Add New</strong> or fill this form to create employee actions.
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    <p className="text-xs text-slate-500 rounded-md bg-slate-50 px-3 py-2 border border-slate-100">
                        <span className="font-semibold text-slate-600">Branch:</span>{' '}
                        {selectedBranch.parent_title} &gt; {selectedBranch.child_title}
                    </p>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Title <span className="text-rose-500">*</span></label>
                        <input
                            value={formData.title}
                            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                            placeholder="Enter task title"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            placeholder="Enter description"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Employee <span className="text-rose-500">*</span></label>
                        <select
                            value={formData.assigned_to_emp_id}
                            onChange={e => setFormData(p => ({ ...p, assigned_to_emp_id: e.target.value }))}
                            disabled={employeeLoading}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">{employeeLoading ? 'Loading...' : 'Select employee'}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Department <span className="text-rose-500">*</span></label>
                        <input value={departmentLabel} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Priority <span className="text-rose-500">*</span></label>
                        <select
                            value={formData.priority}
                            onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select priority</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Sequence No. <span className="text-rose-500">*</span></label>
                        <input
                            type="number"
                            min={1}
                            value={formData.sequence_no}
                            onChange={e => setFormData(p => ({ ...p, sequence_no: Number(e.target.value) }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Due In Days <span className="text-rose-500">*</span></label>
                        <input
                            type="number"
                            min={0}
                            max={Number(selectedBranch?.due_in_days) || 0}
                            value={formData.due_in_days}
                            onChange={e => setFormData(p => ({ ...p, due_in_days: Number(e.target.value) }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder={`Max ${Number(selectedBranch?.due_in_days) || 0} days`}
                        />
                        <p className="mt-1 text-xs text-slate-400">Must be within child due timeline</p>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-sm font-medium text-slate-700">Status</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">{formData.is_active ? 'Active' : 'Inactive'}</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={formData.is_active}
                                onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                                className={`relative h-6 w-11 rounded-full transition ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${formData.is_active ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                    {formMode === 'edit' ? (
                        <button type="button" onClick={onCancelEdit} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                    ) : (
                        <button type="button" onClick={onCancelEdit} className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                            Clear
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={actionLoading}
                        className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
                    >
                        {actionLoading ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Save'}
                    </button>
                </div>
            </>
        )}
    </div>
);

const ManagerRecurringTasksView = ({
    branches,
    branchLoading,
    selectedBranch,
    selectedBranchId,
    onSelectBranch,
    onViewBranch,
    viewBranch,
    templates,
    paginatedTemplates,
    templateLoading,
    templatePage,
    templatePageCount,
    templateRangeStart,
    templateRangeEnd,
    onTemplatePageChange,
    onOpenCreate,
    onOpenEdit,
    onDeleteRequest,
    formMode,
    formData,
    setFormData,
    departmentLabel,
    employees,
    employeeLoading,
    actionLoading,
    onCloseForm,
    onSave,
    onCancelEdit,
    deleteCandidate,
    onCloseDelete,
    onConfirmDelete,
}) => (
    <div className="pb-8">
        {/* Main layout: tables left, add/edit form sidebar right (matches mockup) */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
            <div className="min-w-0 space-y-5">
                {/* Section 1 — Branches */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Your Assigned Recurring Branches</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Select a branch to manage employee action templates under that subtask.</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Active</span>
                            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> Inactive</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm text-left">
                            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                                <tr>
                                    <th className="w-10 px-3 py-3" />
                                    <th className="px-3 py-3">Recurring ID</th>
                                    <th className="px-3 py-3">Parent Task (CFO)</th>
                                    <th className="px-3 py-3">Child / Sub Task (Assigned to You)</th>
                                    <th className="px-3 py-3">Frequency</th>
                                    <th className="px-3 py-3">Due In (Days)</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3">Start Date</th>
                                    <th className="px-3 py-3">End Date</th>
                                    <th className="px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {branchLoading ? (
                                    <tr><td colSpan={10} className="py-14 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" size={22} /></td></tr>
                                ) : branches.length === 0 ? (
                                    <tr><td colSpan={10} className="py-14 text-center text-xs font-bold uppercase tracking-widest text-slate-400">No assigned branches available</td></tr>
                                ) : branches.map(branch => {
                                    const isSelected = String(selectedBranchId) === String(branch.id);
                                    return (
                                        <tr
                                            key={branch.id}
                                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                            onClick={() => onSelectBranch(branch)}
                                        >
                                            <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                                                <input type="radio" name="branch" checked={isSelected} onChange={() => onSelectBranch(branch)} className="h-4 w-4 text-blue-600" />
                                            </td>
                                            <td className="px-3 py-3 font-semibold text-blue-600">{branch.recurring_id}</td>
                                            <td className="px-3 py-3 font-medium text-slate-800">{branch.parent_title}</td>
                                            <td className="px-3 py-3 text-slate-600">{branch.child_title}</td>
                                            <td className="px-3 py-3 text-slate-600 uppercase text-xs">{branch.frequency || '—'}</td>
                                            <td className="px-3 py-3 text-slate-600">{branch.due_in_days ?? 0}</td>
                                            <td className="px-3 py-3"><StatusBadge active={branch.is_active} /></td>
                                            <td className="px-3 py-3 text-slate-600">{formatDate(branch.start_date)}</td>
                                            <td className="px-3 py-3 text-slate-600">{formatDate(branch.end_date)}</td>
                                            <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                                                <button type="button" onClick={() => onViewBranch(branch)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600" title="View branch">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2 — Employee action templates table */}
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800">Recurring Employee Action Templates</h2>
                            {selectedBranch ? (
                                <p className="mt-1 text-xs text-slate-600">
                                    <span className="font-semibold text-slate-500">Branch:</span>{' '}
                                    {selectedBranch.parent_title} &gt; {selectedBranch.child_title}
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-slate-500">Select a branch above to load templates.</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onOpenCreate}
                            disabled={!selectedBranch}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 shrink-0"
                        >
                            <Plus size={16} /> Add New
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-sm text-left">
                            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                                <tr>
                                    <th className="w-10 px-3 py-3">#</th>
                                    <th className="px-3 py-3">Title</th>
                                    <th className="px-3 py-3">Employee</th>
                                    <th className="px-3 py-3">Department</th>
                                    <th className="px-3 py-3">Priority</th>
                                    <th className="px-3 py-3">Sequence</th>
                                    <th className="px-3 py-3">Due In Days</th>
                                    <th className="px-3 py-3">Status</th>
                                    <th className="px-3 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {templateLoading ? (
                                    <tr><td colSpan={9} className="py-14 text-center"><Loader2 className="mx-auto animate-spin text-slate-400" size={22} /></td></tr>
                                ) : !selectedBranch ? (
                                    <tr><td colSpan={9} className="py-14 text-center text-slate-500 text-sm">Select a recurring branch to load employee action templates.</td></tr>
                                ) : templates.length === 0 ? (
                                    <tr><td colSpan={9} className="py-14 text-center text-slate-500 text-sm">No employee templates yet. Use the sidebar or &quot;Add New&quot; to create one.</td></tr>
                                ) : paginatedTemplates.map((template, idx) => (
                                    <tr key={template.action_template_id || template.id} className="hover:bg-slate-50">
                                        <td className="px-3 py-3 text-slate-500">{templateRangeStart + idx}</td>
                                        <td className="px-3 py-3 font-medium text-slate-800">{template.title}</td>
                                        <td className="px-3 py-3 text-slate-600">{template.assigned_to_name || template.assigned_to_emp_id}</td>
                                        <td className="px-3 py-3 text-slate-600">{template.department_id}</td>
                                        <td className="px-3 py-3"><PriorityBadge priority={template.priority} styles={PRIORITY_STYLES} /></td>
                                        <td className="px-3 py-3 text-slate-600">{template.sequence_no}</td>
                                        <td className="px-3 py-3 text-slate-600">{template.due_in_days ?? 0}</td>
                                        <td className="px-3 py-3"><StatusBadge active={template.is_active} /></td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                <button type="button" onClick={() => onOpenEdit(template)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50" title="Edit"><Edit2 size={15} /></button>
                                                <button type="button" onClick={() => onDeleteRequest(template)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50" title="Delete"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {selectedBranch && templates.length > 0 && (
                        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                            <span>Showing {templateRangeStart} to {templateRangeEnd} of {templates.length} entries</span>
                            <div className="flex items-center gap-2">
                                <button type="button" disabled={templatePage <= 1} onClick={() => onTemplatePageChange(templatePage - 1)} className="rounded border border-slate-200 px-3 py-1 text-xs font-medium disabled:opacity-40 hover:bg-slate-50">Prev</button>
                                {Array.from({ length: templatePageCount }, (_, i) => i + 1).map(page => (
                                    <button key={page} type="button" onClick={() => onTemplatePageChange(page)} className={`min-w-[32px] rounded px-2 py-1 text-xs font-semibold ${page === templatePage ? 'bg-blue-600 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>{page}</button>
                                ))}
                                <button type="button" disabled={templatePage >= templatePageCount} onClick={() => onTemplatePageChange(templatePage + 1)} className="rounded border border-slate-200 px-3 py-1 text-xs font-medium disabled:opacity-40 hover:bg-slate-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right sidebar — Add / Edit form (always visible on desktop, like mockup) */}
            <div className="xl:sticky xl:top-4">
                <EmployeeActionFormPanel
                    formMode={formMode}
                    selectedBranch={selectedBranch}
                    formData={formData}
                    setFormData={setFormData}
                    departmentLabel={departmentLabel}
                    employees={employees}
                    employeeLoading={employeeLoading}
                    actionLoading={actionLoading}
                    onCloseForm={onCloseForm}
                    onSave={onSave}
                    onCancelEdit={onCancelEdit}
                />
            </div>
        </div>

        <div className="mt-6 flex gap-3 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <ul className="list-disc space-y-1 pl-4 text-sky-900/90 text-xs sm:text-sm">
                <li>You can create recurring employee tasks only under the branches assigned to you.</li>
                <li>The assigned employee must belong to your department ({departmentLabel}).</li>
                <li>Tasks are generated when the CFO/Admin runs recurring task generation.</li>
            </ul>
        </div>

        {viewBranch && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => onViewBranch(null)}>
                <div className="max-w-md w-full rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Branch Details</h3>
                        <button type="button" onClick={() => onViewBranch(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <dl className="space-y-2 text-sm">
                        <div><dt className="text-slate-500">Recurring ID</dt><dd className="font-semibold text-blue-600">{viewBranch.recurring_id}</dd></div>
                        <div><dt className="text-slate-500">Parent</dt><dd className="font-medium">{viewBranch.parent_title}</dd></div>
                        <div><dt className="text-slate-500">Child branch</dt><dd>{viewBranch.child_title}</dd></div>
                        <div><dt className="text-slate-500">Frequency</dt><dd>{viewBranch.frequency || '—'}</dd></div>
                        <div><dt className="text-slate-500">Due in (days)</dt><dd>{viewBranch.due_in_days ?? '—'}</dd></div>
                        {viewBranch.active_action_count != null && (
                            <div><dt className="text-slate-500">Active employee actions</dt><dd>{viewBranch.active_action_count}</dd></div>
                        )}
                    </dl>
                    <button type="button" onClick={() => { onSelectBranch(viewBranch); onViewBranch(null); }} className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Use this branch</button>
                </div>
            </div>
        )}

        <ConfirmationModal
            isOpen={!!deleteCandidate}
            onClose={onCloseDelete}
            onConfirm={onConfirmDelete}
            title="Delete recurring employee task?"
            message={`This will permanently remove "${deleteCandidate?.title || 'this template'}" from the selected branch.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
        />
    </div>
);

export default ManagerRecurringTasksView;
