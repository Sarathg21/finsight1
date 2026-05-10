import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    Search, RefreshCw, Download, Plus, ChevronRight,
    Paperclip, CheckCircle2, RotateCcw,
    XCircle, User, Users, Calendar, Layout,
    ClipboardCheck, Play, Upload, AlertTriangle, Target
} from 'lucide-react';
// date-fns format replaced with native JS helpers
const fmtDate = (d, pattern) => {
    if (!d || isNaN(d.getTime())) return 'N/A';
    if (pattern === 'MMM d, yyyy') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    // 'yy-MM-dd' or 'yyyy-MM-dd'
    const y = pattern.startsWith('yy-') ? String(d.getFullYear()).slice(-2) : String(d.getFullYear());
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
import toast from 'react-hot-toast';
import ReassignTaskModal from '../components/Modals/ReassignTaskModal';
import ReworkCommentModal from '../components/Modals/ReworkCommentModal';
import TaskReviewModal from '../components/Modals/TaskReviewModal';
import TaskDetailModal from '../components/Modals/TaskDetailModal';
import CustomSelect from '../components/UI/CustomSelect';
import StatsCard from '../components/UI/StatsCard';

// --- Components defined outside for performance and clarity ---

const SubtaskRow = ({ task, parentTask, renderStatusBadge, renderSeverityTag, isLast, taskTitles = {}, onViewDetails, onAction, onReassign, onRework, user }) => {
    if (!task) return null;

    const taskId = task?.task_id || task?.id || '???';
    const title = task?.task_title || task?.title || 'Untitled Subtask';
    const assignedTo = task?.assigned_to_name || 'Unassigned';
    const status = task?.status || 'N/A';
    const rawDueDate = task?.due_date || '';
    const dueDateShort = rawDueDate ? fmtDate(new Date(rawDueDate), 'yy-MM-dd') : 'N/A';
    const isOverdue = dueDateShort !== 'N/A' && new Date(rawDueDate) < new Date() && !['APPROVED', 'CANCELLED'].includes(status);
    const severity = task?.severity || 'LOW';
    const taskLevel = task?.task_level ?? 1;
    // indent based on level: level 1 = pl-12, level 2 = pl-20
    const indentClass = taskLevel >= 2 ? 'pl-20' : 'pl-12';
    const rootTitle = task?.root_parent_task_title;
    const parentTitle = task?.parent_task_title || task?.parent_task_name;

    // RULE: Only the person who assigned this task can approve, rework, reassign, or cancel it.
    // EXCEPTION: The owner of the parent task is also authorized to manage its subtasks.
    const taskAssignedByEmpId =
        task?.assigned_by_emp_id ?? task?.assigned_by_id ?? task?.created_by_emp_id ?? task?.created_by;
    const isAssignedByCurrentUser =
        String(taskAssignedByEmpId) === String(user?.emp_id || user?.id);

    const parentTaskAssigneeId = 
        parentTask?.assigned_to_emp_id ?? parentTask?.employee_id ?? parentTask?.assigned_to_id ?? parentTask?.assigned_to;
    const isParentTaskOwner = 
        parentTaskAssigneeId && String(parentTaskAssigneeId) === String(user?.emp_id || user?.id);

    const canManageTask = isAssignedByCurrentUser || isParentTaskOwner;

    return (
        <tr
            className="bg-slate-50/30 group hover:bg-violet-50/10 transition-colors duration-200"
            role={onViewDetails ? 'button' : undefined}
            tabIndex={onViewDetails ? 0 : undefined}
            onClick={onViewDetails ? () => onViewDetails(task) : undefined}
            onKeyDown={(e) => {
                if (!onViewDetails) return;
                if (e.key === 'Enter' || e.key === ' ') onViewDetails(task);
            }}
        >
            <td className={`py-1.5 px-2 ${indentClass} relative text-left`}>
                <div className={`absolute left-${taskLevel >= 2 ? '20' : '14'} top-0 bottom-0 w-[2.5px] bg-slate-100`}></div>
                <div className={`absolute left-${taskLevel >= 2 ? '20' : '14'} ${isLast ? 'h-6' : 'h-full'} w-[12px] border-l-[2.5px] border-b-[2.5px] border-slate-100 rounded-bl-xl`}></div>
                <div className="flex items-center gap-1 ml-4 relative z-10">
                    <span className="text-[14px] font-bold text-slate-400">↳</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/80 px-1 py-0.5 rounded border border-slate-100 shadow-sm">#Sub-{taskId}</span>
                </div>
            </td>
            <td className="py-1.5 px-2 text-left text-slate-400 font-medium text-[10px]">
                {task.parent_task_id && task.parent_task_id !== '-' ? `#${task.parent_task_id}` : '-'}
            </td>
            <td className="py-1.5 px-2 pl-4 text-left">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-violet-600">T-{task.task_id}</span>
                    <span className="text-[14px] font-bold text-slate-700 tracking-tight leading-tight">{title}</span>
                    {/* Task/Subtask badge */}
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-violet-100 text-violet-600 border border-violet-200 shrink-0">Subtask</span>
                </div>
                {/* Breadcrumb: root › parent */}
                {(rootTitle || parentTitle) && (
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {rootTitle && rootTitle !== parentTitle && (
                            <>
                                <span className="text-[9px] font-medium text-slate-400 truncate max-w-[100px]">{rootTitle}</span>
                                <span className="text-slate-300 text-[9px]">›</span>
                            </>
                        )}
                        {parentTitle && (
                            <span className="text-[9px] font-medium text-slate-400 truncate max-w-[120px] uppercase tracking-wider">{parentTitle}</span>
                        )}
                    </div>
                )}
            </td>

            <td className="py-1.5 px-2 text-left">
                <span className="text-slate-400 text-[10px] font-medium italic">-</span>
            </td>
            <td className="py-1.5 px-2 text-left whitespace-nowrap">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {task.assigned_at || task.assigned_date || task.created_at
                        ? fmtDate(new Date(task.assigned_at || task.assigned_date || task.created_at), 'yy-MM-dd')
                        : '-'}
                </span>
            </td>
            <td className="py-1.5 px-2 text-left">
                <span className="text-[11px] font-black text-indigo-600 truncate max-w-[100px] block tracking-tighter">{assignedTo}</span>
            </td>
            <td className="py-1.5 px-2 text-left whitespace-nowrap">
                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <span className="text-[9px] font-black tracking-tighter uppercase">{dueDateShort}</span>
                </div>
            </td>
            <td className="py-1.5 px-2 text-center">
                {renderStatusBadge?.(status)}
            </td>
            <td className="py-1.5 px-2 text-left">
                {renderSeverityTag?.(severity)}
            </td>
            <td className="py-1.5 px-2 text-right pr-3">
                <div className="flex justify-end gap-1.5">
                    {!canManageTask ? (
                        // Only the assigner can approve, reassign, or cancel — show lock for everyone else
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-slate-200 cursor-not-allowed"
                            title="Only the person who assigned this task can approve, reassign, or cancel it"
                        >
                            <ChevronRight size={14} />
                        </button>
                    ) : status === 'SUBMITTED' && String(task?.employee_id || task?.assigned_to_emp_id || task?.assigned_to_id) !== String(user?.id) ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction?.(taskId, 'APPROVE');
                                }}
                                className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                title="Approve"
                            >
                                <CheckCircle2 size={14} strokeWidth={3} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRework?.(task);
                                }}
                                className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                title="Rework"
                            >
                                <RotateCcw size={14} strokeWidth={3} />
                            </button>
                        </>
                    ) : (status === 'NEW' || status === 'IN_PROGRESS' || status === 'REWORK') ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReassign?.(task);
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-violet-600 hover:border-violet-200 transition-all shadow-sm"
                                title="Reassign Task"
                            >
                                <User size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAction?.(taskId, 'CANCEL');
                                }}
                                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                                title="Cancel"
                            >
                                <XCircle size={14} />
                            </button>
                        </div>
                    ) : (
                        <button className="p-2 text-slate-300 hover:text-violet-500 transition-colors scale-110">
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

const TaskRow = ({
    task,
    expanded,
    subtasks = [],
    onToggle,
    renderStatusBadge,
    renderSeverityTag,
    onAction,
    onReassign,
    onRework,
    taskTitles = {},
    user,
    onViewDetails,
    isHighlighted = false,
}) => {
    if (!task) return null;

    const taskId = task?.task_id || task?.id || '???';
    const title = task?.task_title || task?.title || 'Untitled Task';
    const type = task?.task_type || 'TASK';
    const isParent = (
        type === 'PARENT' ||
        (task?.subtask_count || 0) > 0 ||
        (task?.subtasks?.length || 0) > 0 ||
        task?.has_subtasks === true ||
        task?.is_parent === true
    );
    const status = task?.status || 'NEW';
    const severity = task?.severity || 'LOW';
    const dept = task?.department_name || task?.department || 'General';
    const assignedTo = task?.assigned_to_name || 'Unassigned';
    const assignedBy = task?.assigned_by_name || 'System';
    const rawDueDateMain = task?.due_date || '';
    const dueDate = rawDueDateMain ? fmtDate(new Date(rawDueDateMain), 'MMM d, yyyy') : 'N/A';
    const dueDateShort = rawDueDateMain ? fmtDate(new Date(rawDueDateMain), 'yy-MM-dd') : 'N/A';
    const isOverdue = dueDate !== 'N/A' && new Date(rawDueDateMain) < new Date() && !['APPROVED', 'CANCELLED'].includes(status);
    const parentTitle = task.parent_task_title || task.parent_task_name || task.parent_directive_title || (task.parent_task_id && task.parent_task_id !== '-' ? taskTitles[task.parent_task_id] : '');

    // RULE: Only the person who assigned this task can approve, rework, reassign, or cancel it.
    // No role-based override — CFO cannot act on tasks assigned by a Manager (and vice versa).
    const taskAssignedByEmpId =
        task?.assigned_by_emp_id ?? task?.assigned_by_id ?? task?.created_by_emp_id ?? task?.created_by;
    const isAssignedByCurrentUser =
        String(taskAssignedByEmpId) === String(user?.emp_id || user?.id);
    const canManageTask = isAssignedByCurrentUser;

    const handleRowClick = () => {
        if (!onViewDetails) return;
        onViewDetails(task);
    };

    return (
        <>
            <tr
                ref={isHighlighted ? (el => { if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400); }) : null}
                className={`group hover:bg-violet-50/20 transition-all duration-300 ${
                    isHighlighted
                        ? 'bg-indigo-50/70 border-l-4 border-l-indigo-500 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.15)]'
                        : 'border-l-4 border-l-transparent'
                }`}
                role={onViewDetails ? 'button' : undefined}
                tabIndex={onViewDetails ? 0 : undefined}
                onClick={onViewDetails ? handleRowClick : undefined}
                onKeyDown={(e) => {
                    if (!onViewDetails) return;
                    if (e.key === 'Enter' || e.key === ' ') handleRowClick();
                }}
            >
                <td className="py-1 px-2 pl-3 font-black">
                    <div className="flex items-center gap-1">
                        {isParent ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
                                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${expanded ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                            >
                                <ChevronRight size={8} strokeWidth={4} className={`transition-transform duration-300 ${expanded ? 'rotate-90' : 'rotate-0'}`} />
                            </button>
                        ) : (
                            <div className="w-4 h-4" />
                        )}
                        <span className="text-[9px] font-black text-violet-600 tracking-tighter uppercase">#{taskId}</span>
                    </div>
                </td>
                <td className="py-1 px-2 text-left text-slate-400 font-medium text-[9px] hidden sm:table-cell">
                    {task.parent_task_id && task.parent_task_id !== '-' ? `#${task.parent_task_id}` : '-'}
                </td>
                <td className="py-1 px-2 text-left">
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-[#1E1B4B] text-[11px] tracking-tight truncate max-w-[150px]">
                                {title}
                            </h4>
                            {/* Task / Subtask badge based on task_level and task_type */}
                            {(() => {
                                const level = task?.task_level ?? task?.level;
                                const isSubtask = level > 0 || !!task?.parent_task_id;
                                return isSubtask ? (
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-violet-100 text-violet-600 border border-violet-200">Subtask</span>
                                ) : (
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 border border-indigo-200">Task</span>
                                );
                            })()}
                        </div>
                        {task.parent_task_title && (
                            <p className="text-[8px] font-bold text-slate-300 truncate max-w-[150px] uppercase tracking-tighter">
                                {task.parent_task_title}
                            </p>
                        )}
                    </div>
                </td>

                <td className="py-1 px-2 text-left">
                    <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px] block">
                        {assignedBy || 'Sys'}
                    </span>
                </td>
                <td className="py-1 px-2 text-left whitespace-nowrap">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {task.assigned_at || task.assigned_date || task.created_at
                            ? fmtDate(new Date(task.assigned_at || task.assigned_date || task.created_at), 'yy-MM-dd')
                            : '-'}
                    </span>
                </td>
                <td className="py-1 px-2 text-left">
                    <span className="text-[11px] font-black text-indigo-600 truncate max-w-[100px] block tracking-tighter">{assignedTo}</span>
                </td>
                <td className="py-1 px-2 text-left whitespace-nowrap">
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isOverdue ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                        <span className="text-[9px] font-black tracking-tighter uppercase">{dueDateShort}</span>
                    </div>
                </td>
                <td className="py-1 px-2 text-center whitespace-nowrap">
                    {renderStatusBadge?.(status)}
                </td>
                <td className="py-1 px-2 text-left whitespace-nowrap">
                    {renderSeverityTag?.(severity)}
                </td>
                <td className="py-1 px-2 text-right pr-3">
                    <div className="flex justify-end gap-1.5">
                        {!canManageTask ? (
                            // Only the assigner can approve, reassign, or cancel — show lock for everyone else
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-slate-200 cursor-not-allowed"
                                title="Only the person who assigned this task can approve, reassign, or cancel it"
                            >
                                <ChevronRight size={14} />
                            </button>
                        ) : status === 'SUBMITTED' && String(task?.employee_id || task?.assigned_to_emp_id || task?.assigned_to_id) !== String(user?.id) ? (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction?.(taskId, 'APPROVE');
                                    }}
                                    className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                    title="Approve"
                                >
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRework?.(task);
                                    }}
                                    className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                    title="Rework"
                                >
                                    <RotateCcw size={14} strokeWidth={3} />
                                </button>
                            </>
                        ) : (status === 'NEW' || status === 'IN_PROGRESS' || status === 'REWORK') ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReassign?.(task);
                                    }}
                                    className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-violet-600 hover:border-violet-200 transition-all shadow-sm"
                                    title="Reassign"
                                >
                                    <Users size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction?.(taskId, 'CANCEL');
                                    }}
                                    className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
                                    title="Cancel"
                                >
                                    <XCircle size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 text-slate-300 hover:text-violet-500 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {expanded && Array.isArray(subtasks) && subtasks.map((sub, idx) => (
                <SubtaskRow
                    key={sub?.task_id || sub?.id || idx}
                    task={sub}
                    parentTask={task}
                    renderStatusBadge={renderStatusBadge}
                    renderSeverityTag={renderSeverityTag}
                    isLast={idx === subtasks.length - 1}
                    taskTitles={taskTitles}
                    onViewDetails={onViewDetails}
                    onAction={onAction}
                    onReassign={onReassign}
                    onRework={onRework}
                    user={user}
                />
            ))}
        </>
    );
};

const TeamTasksPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [subtasksMap, setSubtasksMap] = useState({});
    const [departments, setDepartments] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        department_id: '',
        status: '',
        severity: '',
        from_date: '',
        to_date: '',
        assigned_to_emp_id: '',
        assigned_by_emp_id: '',
        task_id: ''
    });
    const [tempFrom, setTempFrom] = useState(filters.from_date);
    const [tempTo,   setTempTo]   = useState(filters.to_date);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
    const [metrics, setMetrics] = useState({ activeTasks: 0, inProgress: 0, pendingSubmission: 0, overdue: 0 });
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [highlightedTaskId, setHighlightedTaskId] = useState(null);

    const taskTitles = useMemo(() => {
        const map = {};
        tasks.forEach(t => {
            const id = t.task_id || t.id;
            const title = t.task_title || t.title;
            if (id) map[id] = title;
        });
        Object.values(subtasksMap).flat().forEach(s => {
            const id = s.task_id || s.id;
            const title = s.task_title || s.title;
            if (id) map[id] = title;
        });
        return map;
    }, [tasks, subtasksMap]);

    const fetchTasks = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: pagination.limit };
            Object.entries(filters).forEach(([k, v]) => {
                // 'Overdue' is a computed client-side filter — never send it to the backend
                if (v && !(k === 'status' && v === 'Overdue')) params[k] = v;
            });
            const res = await api.get('/tasks/team', { params });
            const rawData = res.data?.data || res.data || {};
            let items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);

            // ── Manager: comprehensive multi-pass fetch ──────────────────────────
            // /tasks/team only returns direct-team tasks. Subtasks that the manager
            // created under a CFO-assigned parent task are missed. We fix this with
            // three additional fetches that are merged and deduplicated.
            if (user?.role?.toUpperCase() === 'MANAGER') {
                const managerEmpId = user?.emp_id || user?.id;
                const baseDate = {};
                if (filters.from_date) baseDate.from_date = filters.from_date;
                if (filters.to_date)   baseDate.to_date   = filters.to_date;

                const supplementalFetches = await Promise.allSettled([
                    // Pass 1: All department-scoped tasks (wider net, max 100)
                    api.get('/tasks', { params: { ...baseDate, scope: 'department', limit: 100 } }),
                    // Pass 2: All tasks assigned BY this manager (catches subtasks under CFO parents)
                    api.get('/tasks', { params: { ...baseDate, assigned_by_emp_id: managerEmpId, limit: 100 } }),
                    // Pass 3: /tasks/team without date filters (catches tasks outside date window)
                    api.get('/tasks/team', { params: { limit: 100 } }),
                    // Pass 4: The manager's own tasks (catches parent tasks assigned to them by CFO)
                    api.get('/tasks', { params: { ...baseDate, scope: 'mine', limit: 100 } }),
                ]);

                const extraItems = [];
                supplementalFetches.forEach(r => {
                    if (r.status !== 'fulfilled') return;
                    const raw = r.value?.data?.data || r.value?.data || {};
                    const rows = Array.isArray(raw) ? raw : (raw.items || raw.data || []);
                    extraItems.push(...rows);
                });

                // Also fetch subtasks for every parent_task_id seen in current items
                // so we never miss a child task of any visible parent.
                const parentIdsToFetch = new Set(
                    [...items, ...extraItems]
                        .filter(t => t.parent_task_id)
                        .map(t => String(t.parent_task_id))
                );
                const parentSubtaskResults = await Promise.allSettled(
                    Array.from(parentIdsToFetch).map(pid =>
                        api.get(`/tasks/${pid}/subtasks`).then(r => r.data?.data || r.data || [])
                    )
                );
                parentSubtaskResults.forEach(r => {
                    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                        extraItems.push(...r.value);
                    }
                });

                // Crucial: Fetch the actual parent task objects if they are missing from our list.
                // Otherwise, the subtasks become orphaned and the hierarchy breaks.
                const existingTaskIds = new Set([...items, ...extraItems].map(t => String(t.task_id || t.id)));
                const missingParentIds = Array.from(parentIdsToFetch).filter(pid => !existingTaskIds.has(pid));
                
                if (missingParentIds.length > 0) {
                    const missingParentsResults = await Promise.allSettled(
                        missingParentIds.map(pid =>
                            api.get(`/tasks/${pid}`).then(r => r.data?.data || r.data || null)
                        )
                    );
                    missingParentsResults.forEach(r => {
                        if (r.status === 'fulfilled' && r.value) {
                            extraItems.push(r.value);
                        }
                    });
                }

                // Merge and deduplicate everything
                const merged = [...items, ...extraItems];
                const uniqueMap = new Map();
                merged.forEach(t => {
                    const id = t.task_id || t.id;
                    if (id && !uniqueMap.has(String(id))) uniqueMap.set(String(id), t);
                });
                items = Array.from(uniqueMap.values());
            }

            const employeeFilterId = String(filters.assigned_to_emp_id || '').trim();
            const getTaskAssigneeId = (t) =>
                String(
                    t?.assigned_to_emp_id ??
                    t?.employee_id ??
                    t?.assigned_to_id ??
                    t?.assigned_to_empId ??
                    t?.assigned_to ??
                    ''
                ).trim();

            // Exclude CANCELLED tasks and MANAGER's own tasks from the team view
            const now = new Date();

            // Build set of parent IDs AFTER supplemental merge so CFO-assigned parent tasks
            // (which are assigned to the manager) are kept if they have child tasks in the list.
            const parentIdsInResponse = new Set(
                items.filter(t => t.parent_task_id).map(t => String(t.parent_task_id))
            );

            const filteredItems = items.filter(t => {
                const isCancelled = (t.status || '').toUpperCase() === 'CANCELLED';
                // Compare against both emp_id and numeric id to handle mixed API formats
                const assigneeEmpId = t.assigned_to_emp_id || t.employee_id || t.assigned_to_id;
                const isSelf = assigneeEmpId && (
                    String(assigneeEmpId) === String(user?.emp_id) ||
                    String(assigneeEmpId) === String(user?.id)
                );

                // Exclude a manager's own task from Team Tasks ONLY if it is a standalone
                // leaf task (no subtasks). If the task is a parent whose children are
                // assigned to team members it must remain visible so the hierarchy renders.
                if (user?.role?.toUpperCase() === 'MANAGER' && isSelf) {
                    const taskId = String(t.task_id || t.id);
                    const isParentTask =
                        t.task_type === 'PARENT' ||
                        t.has_subtasks === true ||
                        t.is_parent === true ||
                        (t.subtask_count || 0) > 0 ||
                        parentIdsInResponse.has(taskId);
                    // Keep parent tasks so their subtasks (assigned to team) remain visible
                    if (!isParentTask) return false;
                }

                if (isCancelled) return false;

                // Client-side overdue filter — due_date < today and not terminal
                if (filters.status === 'Overdue') {
                    const due = t.due_date ? new Date(t.due_date) : null;
                    const isTerminal = ['APPROVED', 'CANCELLED', 'COMPLETED'].includes((t.status || '').toUpperCase());
                    return due && due < now && !isTerminal;
                }

                // Manager employee dropdown filter (client-side fallback)
                if (employeeFilterId) {
                    if (getTaskAssigneeId(t) !== employeeFilterId) return false;
                }

                // Status filter (client-side fallback)
                if (filters.status && filters.status !== 'Overdue') {
                    const filterStatus = filters.status.toUpperCase();
                    const taskStatus = (t.status || '').toUpperCase();
                    if (filterStatus === 'NEW') {
                        if (taskStatus !== 'NEW' && taskStatus !== 'NOT_STARTED') return false;
                    } else {
                        if (taskStatus !== filterStatus) return false;
                    }
                }

                // Severity filter (client-side fallback)
                if (filters.severity) {
                    if ((t.severity || '').toUpperCase() !== filters.severity.toUpperCase()) return false;
                }

                // assigned_by_emp_id filter — "Pending My Approval" view
                // Only show tasks that were assigned BY the specified manager
                if (filters.assigned_by_emp_id) {
                    const assignerEmpId = String(
                        t?.assigned_by_emp_id ??
                        t?.assigned_by ??
                        t?.assigner_id ??
                        t?.created_by ??
                        ''
                    ).trim();
                    if (assignerEmpId !== String(filters.assigned_by_emp_id).trim()) return false;
                }

                return true;
            });
            const sorted = filteredItems.sort((a, b) => {
                const dateA = new Date(a.updated_at || a.assigned_date || a.created_at || a.assigned_at || 0);
                const dateB = new Date(b.updated_at || b.assigned_date || b.created_at || b.assigned_at || 0);
                return dateB - dateA;
            });

            // ── Separate top-level tasks from inline subtasks ────────────────────────
            // The backend often returns both parent tasks AND their subtasks as flat rows.
            // We partition them here so subtasks only appear when the parent is expanded.
            const allRootIds = new Set(sorted.map(t => String(t.task_id || t.id)));
            const flatSubtasks = sorted.filter(t => !!t.parent_task_id);

            // Subtasks whose parent is NOT in the current response are promoted to root level
            // so they are always visible (manager assigned these to team members).
            const orphanedSubtasks = flatSubtasks.filter(t => !allRootIds.has(String(t.parent_task_id)));
            const inlineSubtasks   = flatSubtasks.filter(t =>  allRootIds.has(String(t.parent_task_id)));

            const rootTasks = [
                ...sorted.filter(t => !t.parent_task_id),
                ...orphanedSubtasks,  // show orphaned subtasks as standalone rows
            ];

            // Build the subtasksMap from inline flat subtasks
            const inlineSubMap = {};
            inlineSubtasks.forEach(s => {
                const pid = String(s.parent_task_id);
                if (!inlineSubMap[pid]) inlineSubMap[pid] = [];
                inlineSubMap[pid].push(s);
            });

            // Mark root tasks as has_subtasks if inline map has children for them
            const childParentIds = new Set(flatSubtasks.map(t => String(t.parent_task_id)));
            const enriched = rootTasks.map(t => ({
                ...t,
                has_subtasks:
                    t.has_subtasks ||
                    t.task_type === 'PARENT' ||
                    childParentIds.has(String(t.task_id || t.id)) ||
                    (t.subtask_count || 0) > 0
            }));

            setTasks(enriched);

            // Seed subtasksMap with inline subtasks (instant expand, no extra API call needed
            // for parents already covered by the flat response).
            const coveredParentIds = new Set(Object.keys(inlineSubMap));
            setSubtasksMap(prev => {
                const next = { ...prev };
                Object.entries(inlineSubMap).forEach(([pid, subs]) => {
                    // Enrich each inline subtask with parent title for breadcrumb display
                    const parentTask = enriched.find(t => String(t.task_id || t.id) === pid);
                    next[pid] = subs.map(s => ({
                        ...s,
                        parent_task_id: s.parent_task_id ?? pid,
                        parent_task_title: s.parent_task_title || parentTask?.task_title || parentTask?.title || ''
                    }));
                });
                return next;
            });

            // For parents that had NO inline subtasks but are flagged as parents,
            // do a background fetch so the expand button works when clicked.
            enriched.forEach(task => {
                const taskId = task.task_id || task.id;
                if (!taskId || coveredParentIds.has(String(taskId))) return;
                if (!task.has_subtasks) return; // skip leaf tasks
                api.get(`/tasks/${taskId}/subtasks`).then(res => {
                    const subs = res.data?.data || res.data || [];
                    const subsArray = Array.isArray(subs) ? subs : [];
                    if (subsArray.length > 0) {
                        setSubtasksMap(p => ({
                            ...p,
                            [taskId]: subsArray.map(s => ({
                                ...s,
                                parent_task_id: s.parent_task_id ?? taskId,
                                parent_task_title: s.parent_task_title || task.task_title || task.title || ''
                            }))
                        }));
                        setTasks(currentTasks => currentTasks.map(t =>
                            String(t.task_id || t.id) === String(taskId) ? { ...t, has_subtasks: true } : t
                        ));
                        // Collapsed by default — user clicks chevron to expand
                    }
                }).catch(() => {});
            });

            // Re-fetch subtasks for any currently-expanded parents so newly added
            // subtasks (e.g. assigned to EMP_AP2, EMP_AP3) are immediately visible.
            setExpandedTasks(currentExpanded => {
                currentExpanded.forEach(parentId => {
                    api.get(`/tasks/${parentId}/subtasks`).then(res => {
                        const subs = res.data?.data || res.data || [];
                        const subsArray = Array.isArray(subs) ? subs : [];
                        const parentTask = enriched.find(t =>
                            String(t.task_id || t.id) === String(parentId)
                        );
                        const enrichedSubs = subsArray.map(s => ({
                            ...s,
                            parent_task_id: s.parent_task_id ?? parentId,
                            parent_task_title:
                                s.parent_task_title ||
                                parentTask?.task_title ||
                                parentTask?.title || ''
                        }));
                        setSubtasksMap(p => ({ ...p, [parentId]: enrichedSubs }));
                    }).catch(() => {});
                });
                return currentExpanded; // no-op
            });
            // Do NOT derive total count from the raw task list page — it reflects only the
            // current page of results and will be wrong when filters apply or when the
            // API paginates. The authoritative total comes from the metrics endpoints below.
            // Set a temporary pagination state (page/limit only) — total will be updated
            // by the Promise.allSettled block below once the metrics arrive.
            setPagination(prev => ({
                ...prev,
                page:  rawData.page  || page,
                limit: rawData.limit || prev.limit,
            }));

            // ── Fetch accurate KPI metrics from role-aware endpoints.
            // Normalize dates: never send empty strings to the API to avoid 422/incorrect defaults.
            const getFirstDayOfMonth = () => {
                const now = new Date();
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
            };
            const getToday = () => new Date().toISOString().slice(0, 10);

            const safeFrom = (filters.from_date && filters.from_date.length === 10) ? filters.from_date : getFirstDayOfMonth();
            const safeTo   = (filters.to_date   && filters.to_date.length   === 10) ? filters.to_date   : getToday();

            const isCFO = (user?.role || '').toUpperCase() === 'CFO';

            // CFO has no department_id — omit it so the API returns org-wide data.
            // Manager scopes to their own department unless a filter overrides it.
            const metricParams = {
                from_date: safeFrom,
                to_date:   safeTo,
                ...(!isCFO && {
                    department_id: (filters.department_id && filters.department_id !== 'all')
                        ? filters.department_id
                        : (user?.department_id || user?.dept_id || user?.department)
                }),
                ...(isCFO && filters.department_id && filters.department_id !== 'all' && {
                    department_id: filters.department_id
                })
            };

            // Role-aware endpoint selection:
            //   CFO  → /dashboard/cfo (top_kpis) + /dashboard/cfo/org-metrics (totals)
            //   Manager → /dashboard/manager/department-metrics + /dashboard/manager
            const [ep1, ep2, ep3] = isCFO
                ? [
                    '/dashboard/cfo/org-metrics',
                    '/dashboard/cfo',
                    '/dashboard/cfo/trends'
                  ]
                : [
                    '/dashboard/manager/department-metrics',
                    '/dashboard/manager',
                    '/dashboard/manager/analytics'
                  ];

            Promise.allSettled([
                api.get(ep1, { params: metricParams }),
                api.get(ep2, { params: metricParams }),
                api.get(ep3, { params: metricParams })
            ]).then(results => {
                const r0 = results[0].status === 'fulfilled' ? (results[0].value.data?.data || results[0].value.data || {}) : {};
                const r1 = results[1].status === 'fulfilled' ? (results[1].value.data?.data || results[1].value.data || {}) : {};
                const r2 = results[2].status === 'fulfilled' ? (results[2].value.data?.data || results[2].value.data || {}) : {};

                console.log("[TeamTasksPage] role:", user?.role, "| metricParams:", metricParams);
                console.log("[TeamTasksPage] r0 (dept/org-metrics):", r0);
                console.log("[TeamTasksPage] r1 (dash/cfo):", r1);

                // For CFO: top_kpis lives inside /dashboard/cfo response
                // For Manager: top_kpis lives inside /dashboard/manager response
                const kpis = r1.top_kpis || {};
                const tco  = isCFO ? (r1.task_completion_overview || r0) : (r2.task_completion_overview || {});

                // ── org-metrics (CFO) or department-metrics (Manager) is primary source of truth.
                // Fallback chain: org-metrics → top_kpis → dashboard totals → page count.
                const totalCountOfficial = Math.max(
                    (r0.total_tasks           != null ? Number(r0.total_tasks)           : 0),
                    (kpis.total_team_tasks     != null ? Number(kpis.total_team_tasks)     : 0),
                    (r1.total_tasks            != null ? Number(r1.total_tasks)            : 0),
                    enriched.length  // always at least as many as we loaded
                );

                const inProgressOfficial =
                    (r0.in_progress_tasks      != null ? r0.in_progress_tasks      : null) ??
                    (kpis.in_progress_tasks     != null ? kpis.in_progress_tasks     : null) ??
                    (tco.in_progress_tasks      != null ? tco.in_progress_tasks      : null) ??
                    enriched.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length;

                const pendingOfficial =
                    (r0.pending_approval        != null ? r0.pending_approval        : null) ??
                    (r0.submitted_tasks         != null ? r0.submitted_tasks         : null) ??
                    (kpis.pending_approval_tasks != null ? kpis.pending_approval_tasks : null) ??
                    (tco.pending_tasks           != null ? tco.pending_tasks           : null) ??
                    enriched.filter(t => (t.status || '').toUpperCase() === 'SUBMITTED').length;

                const overdueOfficial =
                    (r0.overdue_tasks           != null ? r0.overdue_tasks           : null) ??
                    (kpis.overdue_tasks          != null ? kpis.overdue_tasks          : null) ??
                    (tco.overdue_tasks           != null ? tco.overdue_tasks           : null) ??
                    (() => {
                        const now3 = new Date();
                        return enriched.filter(t => {
                            const due = t.due_date ? new Date(t.due_date) : null;
                            return due && due < now3 && !['APPROVED', 'CANCELLED', 'COMPLETED'].includes((t.status || '').toUpperCase());
                        }).length;
                    })();

                setMetrics({
                    activeTasks:      totalCountOfficial,
                    inProgress:       inProgressOfficial,
                    pendingSubmission: pendingOfficial,
                    overdue:          overdueOfficial,
                });

                // Now set the authoritative pagination total
                setPagination(prev => ({ ...prev, total: totalCountOfficial }));
            }).catch(err => {
                console.warn('[TeamTasksPage] Metrics fetch failed:', err);
                // Fallback to page-count computation if dashboard is unreachable
                const now3 = new Date();
                setMetrics({
                    activeTasks:       enriched.length,
                    inProgress:        enriched.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length,
                    pendingSubmission: enriched.filter(t => (t.status || '').toUpperCase() === 'SUBMITTED').length,
                    overdue:           enriched.filter(t => {
                        const due = t.due_date ? new Date(t.due_date) : null;
                        return due && due < now3 && !['APPROVED', 'CANCELLED', 'COMPLETED'].includes((t.status || '').toUpperCase());
                    }).length
                });
            });
        } catch (err) {
            console.error("Fetch tasks error:", err);
            toast.error("Failed to load tasks");
        } finally { setLoading(false); }
    };

    // fetchMetrics is replaced by inline computation in fetchTasks above.
    // Kept as a no-op so existing callers (refresh button, action handlers) don't error.
    const fetchMetrics = () => {};

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [deptRes, empRes] = await Promise.all([
                    api.get('/departments')
                        .catch(() => api.get('/dashboard/cfo/departments'))
                        .catch(() => api.get('/admin/departments'))
                        .catch(() => ({ data: [] })),
                    api.get('/employees').catch(() => ({ data: [] }))
                ]);
                
                const extract = (res) => {
                    const d = res?.data;
                    if (Array.isArray(d)) return d;
                    if (Array.isArray(d?.data)) return d.data;
                    if (Array.isArray(d?.items)) return d.items;
                    if (Array.isArray(d?.departments)) return d.departments;
                    return [];
                };

                const depts = extract(deptRes).map(d => {
                    if (typeof d === 'string') return { id: d, department_id: d, name: d };
                    const id = d.department_id || d.id || d.dept_id;
                    return { ...d, id, department_id: id, name: d.name || d.department_name || id };
                });
                setDepartments(depts);
                
                const emps = extract(empRes).map(e => ({
                    ...e,
                    emp_id: e.emp_id || e.id || e.employee_id,
                    name: e.name || e.full_name || 'Employee'
                }));
                setAllEmployees(emps);
            } catch (err) {
                console.warn("Failed to fetch metadata in TeamTasksPage", err);
            }
        };
        fetchMeta();
    }, []);

    // Sync URL params → filters (e.g. when navigated from Dashboard KPI cards)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam         = params.get('search');
        const taskIdParam         = params.get('task_id');
        const statusParam         = params.get('status');
        const deptParam           = params.get('department_id') || params.get('department');
        const fromDateParam       = params.get('from_date');
        const toDateParam         = params.get('to_date');
        const assignedByParam     = params.get('assigned_by_emp_id');

        // Build a single batched filter update to avoid multiple re-renders
        const filterUpdates = {};

        if (searchParam)          filterUpdates.search             = decodeURIComponent(searchParam);
        if (statusParam !== null) filterUpdates.status             = statusParam;
        if (deptParam)            filterUpdates.department_id      = deptParam;
        if (assignedByParam)      filterUpdates.assigned_by_emp_id = assignedByParam;
        if (fromDateParam) { 
            filterUpdates.from_date  = fromDateParam;
            setTempFrom(fromDateParam);
        }
        if (toDateParam) { 
            filterUpdates.to_date    = toDateParam;
            setTempTo(toDateParam);
        }

        if (Object.keys(filterUpdates).length > 0) {
            setFilters(prev => ({ ...prev, ...filterUpdates }));
        }

        if (taskIdParam) {
            setFilters(prev => ({ ...prev, task_id: taskIdParam }));
            setHighlightedTaskId(taskIdParam);
            const tryOpen = (attempts = 0) => {
                setTasks(currentTasks => {
                    const found = currentTasks.find(t =>
                        String(t.task_id || t.id) === String(taskIdParam)
                    );
                    if (found) {
                        const id = found.id ?? found.task_id;
                        setSelectedTask({ ...found, id });
                        setDetailModalOpen(true);
                    } else if (attempts < 8) {
                        // Retry up to 8 times (4 seconds) while tasks are loading
                        setTimeout(() => tryOpen(attempts + 1), 500);
                    }
                    return currentTasks; // no-op state update, just for access
                });
            };
            // Start trying after brief delay for initial load
            setTimeout(() => tryOpen(), 800);
        }
    }, [location.search]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchTasks(1); }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const toggleExpand = useCallback((parentId) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(parentId)) {
                next.delete(parentId);
            } else {
                next.add(parentId);
                // Always re-fetch on expand so newly added subtasks are visible
                api.get(`/tasks/${parentId}/subtasks`).then(res => {
                    const subs = res.data?.data || res.data || [];
                    const subsArray = Array.isArray(subs) ? subs : [];
                    setTasks(currentTasks => {
                        const parentTask = currentTasks.find(t =>
                            String(t.task_id || t.id) === String(parentId)
                        );
                        const enriched = subsArray.map(s => ({
                            ...s,
                            parent_task_id: s.parent_task_id ?? parentId,
                            parent_task_title:
                                s.parent_task_title ||
                                s.parent_task_name ||
                                parentTask?.task_title ||
                                parentTask?.title || ''
                        }));
                        setSubtasksMap(p => ({ ...p, [parentId]: enriched }));
                        return currentTasks; // no-op
                    });
                }).catch(() => {});
            }
            return next;
        });
    }, []);

    const handleAction = async (taskId, action, extra = {}) => {
        if (!taskId) return;
        const task = tasks.find(t => (t.task_id || t.id) === taskId);
        
        // Only open the review modal if we don't already have feedback (comment) 
        // and we the review modal isn't already open.
        const needsReviewModal = (action === 'APPROVE' || (action === 'REWORK' && !extra.comment));
        
        if (task?.status === 'SUBMITTED' && !isReviewModalOpen && needsReviewModal) {
            setSelectedTask({ ...task, id: task.id ?? task.task_id });
            setIsReviewModalOpen(true);
            return;
        }

        const confirmMsg = action === 'CANCEL' ? "Cancel this task?" : (action === 'APPROVE' && !isReviewModalOpen) ? "Approve completion?" : null;
        if (confirmMsg && !window.confirm(confirmMsg)) return;

        try {
            const payload = { 
                action, 
                comment: extra.comment || "" 
            };
            
            await api.post(`/tasks/${taskId}/transition`, payload, {
                headers: { 'X-EMP-ID': user.id }
            });

            const pastTense = (act) => {
                const label = act.charAt(0).toUpperCase() + act.slice(1).toLowerCase();
                return label.endsWith('e') ? label + 'd' : label + 'ed';
            };
            toast.success(`Task ${pastTense(action)} successfully!`);
            fetchTasks(pagination.page); 
            fetchMetrics();
            window.dispatchEvent(new Event('refresh-notifications'));
            setIsReviewModalOpen(false); 
            setIsReworkModalOpen(false);
        } catch (err) {
            console.error(`[handleAction] ${action} failed:`, err);
            toast.error(err.response?.data?.message || err.response?.data?.detail || "Action failed");
        }
    };

    const renderStatusBadge = useCallback((status) => {
        const s = (status || '').toUpperCase();
        const config = {
            NEW: { color: 'bg-slate-100 text-slate-500', label: 'Not started' },
            NOT_STARTED: { color: 'bg-slate-100 text-slate-500', label: 'Not started' },
            IN_PROGRESS: { color: 'bg-blue-100 text-blue-600', label: 'In Progress' },
            SUBMITTED: { color: 'bg-purple-100 text-purple-600', label: 'Submitted' },
            REWORK: { color: 'bg-orange-100 text-orange-600', label: 'Rework' },
            APPROVED: { color: 'bg-emerald-100 text-emerald-600', label: 'Approved' },
            CANCELLED: { color: 'bg-slate-400 text-white', label: 'Cancelled' },
        };
        const style = config[s] || { color: 'bg-slate-50 text-slate-400', label: s || 'N/A' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize tracking-tight ${style.color}`}>{style.label}</span>;
    }, []);

    const renderSeverityTag = useCallback((sev) => {
        const s = (sev || 'LOW').toUpperCase();
        const colors = { HIGH: 'text-rose-600 bg-rose-50 border-rose-200', MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200', LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        return <span className={`px-2 py-0.5 rounded border text-[9px] font-bold capitalize tracking-tight ${colors[s] || 'text-slate-400'}`}>{s}</span>;
    }, []);

    const openDetailModal = (task) => {
        if (!task) return;
        const id = task.id ?? task.task_id ?? task.id;
        setSelectedTask({ ...task, id });
        setDetailModalOpen(true);
    };

    return (
        <div className="p-3 lg:p-5 w-full space-y-8 animate-in fade-in duration-700 text-left">
            {/* ── OBJECTIVE FILTER BANNER ── */}
            {new URLSearchParams(location.search).get('from_obj') && filters.search && (
                <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Target size={14} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest leading-none mb-0.5">Viewing tasks for objective</p>
                            <p className="text-[14px] font-black text-white leading-tight">{filters.search}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                                setFilters(prev => ({ ...prev, search: '' }));
                                setHighlightedTaskId(null);
                                navigate('/tasks/team', { replace: true });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        <XCircle size={13} strokeWidth={3} /> Clear Filter
                    </button>
                </div>
            )}
            {/* ── PREMIUM HEADER SECTION ── */}
            <div className="relative overflow-hidden bg-[#1E1B4B] rounded-[2.5rem] border border-white/10 shadow-xl shadow-indigo-900/20 p-8 group transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10">
                {/* Decorative Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl -ml-24 -mb-24 group-hover:scale-125 transition-transform duration-1000 delay-150" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 text-left">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">
                            <Layout size={12} strokeWidth={3} />
                            <span>Executive Intelligence</span>
                            <ChevronRight size={10} className="text-white/20" strokeWidth={3} />
                            <span className="text-white/40">Team oversight</span>
                        </div>
                        
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                                Team tasks
                                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                                    <Users size={16} className="text-white" />
                                    <span className="text-[12px] font-black text-white">{metrics.activeTasks || pagination.total} Live</span>
                                </div>
                            </h1>
                            <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mt-1 ml-0.5 whitespace-nowrap">
                                Unified Performance Monitoring & Strategic Workload Management
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/tasks/assign')} 
                            className="group/btn relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-[#1E1B4B] text-white rounded-[1.25rem] font-black text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            <Plus size={18} strokeWidth={3} className="relative z-10" />
                            <span className="relative z-10 uppercase tracking-widest">Assign Task</span>
                        </button>
                        
                        <button 
                            onClick={() => { fetchTasks(pagination.page); fetchMetrics(pagination.total); }} 
                            className="p-4 bg-white border border-slate-100 text-slate-400 rounded-[1.25rem] hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group/refresh"
                        >
                            <RefreshCw size={22} className={`${loading ? 'animate-spin' : 'group-hover/refresh:rotate-180'} transition-transform duration-500`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Team Tasks"       value={metrics.activeTasks}       icon={ClipboardCheck} color="violet"  onClick={() => setFilters(p => ({ ...p, status: '' }))} />
                <StatsCard title="In Progress"       value={metrics.inProgress}        icon={Play}           color="amber"   onClick={() => setFilters(p => ({ ...p, status: 'IN_PROGRESS' }))} />
                <StatsCard title="Pending Approval"  value={metrics.pendingSubmission} icon={Upload}         color="emerald" onClick={() => setFilters(p => ({ ...p, status: 'SUBMITTED' }))} />
                <StatsCard title="Overdue"           value={metrics.overdue}           icon={AlertTriangle}  color="rose"    onClick={() => setFilters(p => ({ ...p, status: 'Overdue' }))} />
            </div>

            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    <div className="lg:col-span-2 relative group">
                        <label className="text-[10px] font-medium text-slate-400 ml-1 mb-1.5 block whitespace-nowrap">Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500" size={16} />
                            <input type="text" placeholder="Search tasks..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-violet-500/10 placeholder:text-slate-400 capitalize" value={filters.search} onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))} />
                        </div>
                    </div>
                    <div className="lg:col-span-7 flex items-end gap-6">
                        {/* Department Filter for CFO/Admin */}
                        {(user?.role?.toUpperCase() === 'CFO' || user?.role?.toUpperCase() === 'ADMIN') && (
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 ml-1 whitespace-nowrap">Department</label>
                                <CustomSelect 
                                    className="min-w-[260px]"
                                    value={filters.department_id} 
                                    onChange={(v) => setFilters(p => ({ ...p, department_id: v }))} 
                                    options={[
                                        { value: '', label: 'All Dept' }, 
                                        ...departments.map(d => {
                                            const val = typeof d === 'string' ? d : (d.department_id || d.id || d.name);
                                            const label = typeof d === 'string' ? d : (d.name || d.department_id || d.id);
                                            return { value: String(val), label: String(label) };
                                        })
                                    ]} 
                                />
                            </div>
                        )}

                        {/* Employee Filter for Manager */}
                        {user?.role?.toUpperCase() === 'MANAGER' && (
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 ml-1">Employee</label>
                                <CustomSelect 
                                    className="min-w-[180px]"
                                    value={filters.assigned_to_emp_id} 
                                    onChange={(v) => setFilters(p => ({ ...p, assigned_to_emp_id: v ? String(v) : '' }))} 
                                    options={[{ value: '', label: 'All Employees' }, ...allEmployees.map(e => ({ value: String(e.emp_id || e.id), label: e.name || 'Unknown' } ))]} 
                                />
                            </div>
                        )}
                        <div className="space-y-1.5 flex flex-col"><label className="text-[10px] font-bold text-slate-400 ml-1 whitespace-nowrap">Status</label>
                            <CustomSelect value={filters.status} onChange={(v) => setFilters(p => ({ ...p, status: v }))} options={[{ value: '', label: 'All Status' }, { value: 'NEW', label: 'Not started' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'SUBMITTED', label: 'Pending Approval' }, { value: 'REWORK', label: 'Rework' }, { value: 'APPROVED', label: 'Approved' }, { value: 'Overdue', label: 'Overdue' }, { value: 'CANCELLED', label: 'Cancelled' }]} />
                        </div>
                        <div className="space-y-1.5 flex flex-col"><label className="text-[10px] font-bold text-slate-400 ml-1 whitespace-nowrap">Severity</label>
                            <CustomSelect value={filters.severity} onChange={(v) => setFilters(p => ({ ...p, severity: v }))} options={[{ value: '', label: 'All Severity' }, { value: 'HIGH', label: 'High' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }]} />
                        </div>
                    </div>
                    <div className="lg:col-span-3 grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 flex flex-col"><label className="text-[10px] font-bold text-slate-400 ml-1 whitespace-nowrap">From Date</label>
                            <input type="date" className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-violet-500/10" value={tempFrom} onChange={(e) => setTempFrom(e.target.value)} />
                        </div>
                        <div className="space-y-1.5 flex flex-col"><label className="text-[10px] font-bold text-slate-400 ml-1 whitespace-nowrap">To Date</label>
                            <input type="date" className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-violet-500/10" value={tempTo} onChange={(e) => setTempTo(e.target.value)} />
                        </div>
                        <button 
                            onClick={() => {
                                setFilters(prev => ({ ...prev, from_date: tempFrom, to_date: tempTo }));
                            }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left capitalize">
                        <thead>
                            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-100 bg-slate-50/30">
                                <th className="py-2 px-2 pl-3">ID</th>
                                <th className="py-2 px-2 font-bold text-[9px] hidden sm:table-cell">PID</th>
                                <th className="py-2 px-2">Task</th>
                                <th className="py-2 px-2">From</th>
                                <th className="py-2 px-2">Date</th>
                                <th className="py-2 px-2 text-indigo-500">To</th>
                                <th className="py-2 px-2">Due</th>
                                <th className="py-2 px-2 text-center">Status</th>
                                <th className="py-2 px-2">Severity</th>
                                <th className="py-2 px-2 text-right pr-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr className="animate-pulse"><td colSpan={10} className="p-20 text-center text-slate-300 font-bold">Syncing Executive Intelligence...</td></tr>
                            ) : tasks.length === 0 ? (
                                <tr><td colSpan={10} className="p-20 text-center opacity-50"><Layout size={48} className="text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold text-[11px]">No matching team tasks found</p></td></tr>
                            ) : tasks.map((task, idx) => (
                                <TaskRow
                                    key={task?.task_id || task?.id || idx}
                                    task={task}
                                    expanded={expandedTasks.has(task?.task_id || task?.id)}
                                    subtasks={subtasksMap[task?.task_id || task?.id] || []}
                                    onToggle={() => toggleExpand(task?.task_id || task?.id)}
                                    renderStatusBadge={renderStatusBadge}
                                    renderSeverityTag={renderSeverityTag}
                                    onAction={handleAction}
                                    onReassign={(t) => {
                                        setSelectedTask({ ...t, id: t?.id ?? t?.task_id });
                                        setIsReassignModalOpen(true);
                                    }}
                                    onRework={(t) => {
                                        setSelectedTask({ ...t, id: t?.id ?? t?.task_id });
                                        setIsReworkModalOpen(true);
                                    }}
                                    taskTitles={taskTitles}
                                    user={user}
                                    onViewDetails={openDetailModal}
                                    isHighlighted={!!highlightedTaskId && String(task?.task_id || task?.id) === String(highlightedTaskId)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 bg-slate-50/50 px-8 border-t border-slate-100 text-left">
                    {/* Use tasks.length as a floor so the count is never 0 while tasks are visible */}
                    {(() => {
                        const effectiveTotal = Math.max(metrics.activeTasks || 0, pagination.total, tasks.length);
                        const effectivePage  = pagination.page || 1;
                        const effectiveLimit = pagination.limit || 20;
                        const totalPages     = Math.max(1, Math.ceil(effectiveTotal / effectiveLimit));
                        const rangeStart     = effectiveTotal === 0 ? 0 : (effectivePage - 1) * effectiveLimit + 1;
                        const rangeEnd       = Math.min(effectivePage * effectiveLimit, effectiveTotal || tasks.length);
                        return (
                            <>
                                <div className="text-[12px] font-bold text-slate-500">
                                    Showing {rangeStart}–{rangeEnd} of {effectiveTotal} tasks
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fetchTasks(effectivePage - 1)}
                                        disabled={effectivePage <= 1}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black text-slate-500 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >Prev</button>
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => fetchTasks(i + 1)}
                                            className={`w-10 h-10 rounded-xl text-[12px] font-black transition-all ${
                                                effectivePage === i + 1
                                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 scale-110'
                                                    : 'bg-white border border-slate-200 text-slate-500 hover:text-violet-600'
                                            }`}
                                        >{i + 1}</button>
                                    ))}
                                    <button
                                        onClick={() => fetchTasks(effectivePage + 1)}
                                        disabled={effectivePage >= totalPages}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black text-slate-500 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                                    >Next</button>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            <ReassignTaskModal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} currentTask={selectedTask} currentUser={user} employees={allEmployees} onReassign={async ({ employeeId, newDueDate, reason }) => {
                try {
                    const payload = {
                        new_assigned_to_emp_id: employeeId,
                        new_due_date: newDueDate,
                        reason: reason || ''
                    };
                    await api.post(`/tasks/${selectedTask?.task_id || selectedTask?.id}/reassign`, payload, {
                        headers: { 'X-EMP-ID': user.id }
                    });
                    toast.success("Task reassigned"); setIsReassignModalOpen(false); fetchTasks(pagination.page); fetchMetrics(); window.dispatchEvent(new Event('refresh-notifications'));
                } catch (err) {
                    console.error('[Reassign] Failed. Full error:', err.response?.data);
                    console.error('[Reassign] Detail:', JSON.stringify(err.response?.data?.detail, null, 2));
                    toast.error("Reassign failed: " + (err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Check fields"));
                }
            }} />
            <ReworkCommentModal isOpen={isReworkModalOpen} onClose={() => setIsReworkModalOpen(false)} onConfirm={(comment) => handleAction(selectedTask?.task_id || selectedTask?.id, 'REWORK', { comment })} taskTitle={selectedTask?.task_title || selectedTask?.title} />
            <TaskReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} task={selectedTask} onApprove={() => handleAction(selectedTask?.task_id || selectedTask?.id, 'APPROVE')} onRework={() => { setIsReviewModalOpen(false); setIsReworkModalOpen(true); }} />
            <TaskDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                task={selectedTask}
                currentUser={user}
            />
        </div>
    );
};

export default TeamTasksPage;