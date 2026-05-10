import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, Clock, Plus, Trash2, FolderOpen, GitBranch, Info, ChevronRight, User2, Users2 } from 'lucide-react';
import SearchableSelect from '../components/UI/SearchableSelect';

const AssignTaskPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // State for assignees - define this early to avoid reference errors
    const [eligibleAssignees, setEligibleAssignees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingParentTasks, setExistingParentTasks] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignee: '',
        managerId: '',   // CFO: manager assigned for SUBTASK flow
        priority: 'MEDIUM',
        dueDate: '',
        isRecurring: false,
        taskStructure: 'SINGLE',
        recurringFrequency: 'WEEKLY',
        recurringDay: 1, // Monthly Day
        weeklyDay: 1, // Integer 1-7 (Mon-Sun)
        yearlyMonth: 1,
        yearlyDay: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
        parentTaskId: '',
        dueInDays: 0
    });
    const [subtasks, setSubtasks] = useState([]);
    const [normalSubtasks, setNormalSubtasks] = useState([]);
    const [attachment, setAttachment] = useState(null);

    // Component-level helper — used both in useEffect (data filtering) and in JSX (render logic)
    const isParentTask = (t) =>
        (t?.task_type || '').toUpperCase() === 'PARENT' || t?.is_parent === true || (t?.subtask_count > 0);

    useEffect(() => {
        const fetchMetadata = async () => {
            const role = String(user?.role || '').toUpperCase();
            const isAdminRole   = role === 'ADMIN';
            const isCFORole     = role === 'CFO';
            const isManagerRole = role === 'MANAGER';

            try {
                // Admins have no task creation/edit rights — only fetch employees & departments
                const taskEndpoint = isCFORole ? '/tasks' : '/tasks/team';
                const taskParams   = isCFORole
                    ? { scope: 'org', limit: 100, all_departments: true }
                    : { limit: 100 };

                // Manager: also fetch tasks assigned TO them (CFO-assigned Level-1 & Level-0 parents)
                const myTasksPromise = isManagerRole
                    ? api.get('/tasks', { params: { scope: 'mine', limit: 100 } })
                        .catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] });

                const [empRes, deptRes, tasksRes, myTasksRes] = await Promise.all([
                    api.get(isCFORole ? '/employees' : '/employees/assignable')
                        .catch(() => api.get('/employees'))
                        .catch(() => api.get('/employees/assignable'))
                        .catch(() => ({ data: [] })),
                    api.get('/departments')
                        .catch(() => api.get('/dashboard/cfo/departments'))
                        .catch(() => (isAdminRole ? api.get('/admin/departments') : Promise.reject()))
                        .catch(() => ({ data: [] })),
                    // Admin skips task fetch — pass empty result
                    isAdminRole
                        ? Promise.resolve({ data: [] })
                        : api.get(taskEndpoint, { params: taskParams })
                            .catch(() => api.get('/tasks/team', { params: { limit: 100 } }))
                            .catch(() => ({ data: [] })),
                    myTasksPromise
                ]);
                
                
                const extract = (res) => {
                    const raw = res?.data;
                    if (Array.isArray(raw)) return raw;
                    if (Array.isArray(raw?.data)) return raw.data;
                    if (Array.isArray(raw?.items)) return raw.items;
                    if (Array.isArray(raw?.tasks)) return raw.tasks;
                    if (Array.isArray(raw?.data?.items)) return raw.data.items;
                    if (Array.isArray(raw?.results)) return raw.results;
                    if (Array.isArray(raw?.departments)) return raw.departments;
                    if (Array.isArray(raw?.rows)) return raw.rows;
                    return [];
                };

                const normalizeEmps = (list) => list.map(e => ({
                    ...e,
                    emp_id: e.emp_id || e.employee_id || e.id || e.user_id,
                    name: e.name || e.full_name || [e.first_name, e.last_name].filter(Boolean).join(' ') || e.username || e.email || 'Employee'
                }));

                const normalizeDepts = (list) => list.map(d => {
                    if (typeof d === 'string') {
                        return { id: d, department_id: d, name: d };
                    }
                    const deptId = d.department_id || d.dept_id || d.id || d.code || d.department_code;
                    return {
                        ...d,
                        id: deptId,
                        department_id: deptId,
                        name: d.name || d.department_name || d.dept_name || d.department || d.title || d.code
                    };
                }).filter(d => d?.id || d?.department_id || d?.name);

                const savedUser = JSON.parse(localStorage.getItem('pms_user') || '{}');
                const fallbackDeptId =
                    savedUser?.department_id || savedUser?.dept_id || savedUser?.department || savedUser?.department_name || '';
                const fallbackDeptName =
                    savedUser?.department_name || savedUser?.department || (fallbackDeptId ? String(fallbackDeptId) : '');

                const normalizedEmps = normalizeEmps(extract(empRes));
                const normalizedDepts = normalizeDepts(extract(deptRes));
                const teamTasksData = extract(tasksRes);    // tasks manager assigned out / CFO org tasks
                const myTasksData   = extract(myTasksRes);  // tasks assigned TO the manager (CFO→Manager)

                console.log('[AssignTask] teamTasks count:', teamTasksData.length);
                console.log('[AssignTask] myTasks count:', myTasksData.length);

                // Normalize each task so id/title are always accessible
                const normalizeTasks = (list) => list.map(t => ({
                    ...t,
                    id:        t.id        || t.task_id   || null,
                    title:     t.title     || t.task_title || t.task_name || t.name || null,
                    task_type: (t.task_type || '').toUpperCase(),
                }));



                // ── Parent dropdown rules ─────────────────────────────────────────────
                // MANAGER: can create employee subtasks under:
                //   • CFO-assigned Level-1 manager tasks   (from myTasksData)
                //   • Manager-owned Level-0 standalone parent tasks (from teamTasksData where is_parent/PARENT)
                // CFO: parent dropdown = Level-0 standalone parent tasks only (task_type === 'PARENT')
                // ADMIN: no task creation, empty list
                let validParentSource = [];
                if (isManagerRole) {
                    const normalizedTeam = normalizeTasks(teamTasksData);
                    const normalizedMine = normalizeTasks(myTasksData);
                    // Level-1 CFO-assigned tasks assigned to this manager
                    const cfoAssigned = normalizedMine;
                    // Level-0 manager-owned standalone parent tasks
                    const ownedParents = normalizedTeam.filter(isParentTask);
                    // Deduplicate by id
                    const parentMap = new Map();
                    [...cfoAssigned, ...ownedParents].forEach(t => {
                        if (t.id != null) parentMap.set(String(t.id), t);
                    });
                    validParentSource = Array.from(parentMap.values());
                } else if (isCFORole) {
                    const allNorm = normalizeTasks(teamTasksData);
                    // CFO parent dropdown:
                    //   Level-0: PARENT-type tasks (CFO creates manager child under these)
                    //   Level-1: tasks already assigned to managers (CFO creates employee subtask under these)
                    // We include all non-terminal, non-standalone tasks that have an assignee.
                    validParentSource = allNorm.filter(t => {
                        const isParent = isParentTask(t);
                        const hasAssignee = !!(t.assigned_to_emp_id || t.assigned_to_name || t.assigned_to);
                        const level = t.task_level ?? t.level ?? (isParent ? 0 : null);
                        // Include Level-0 PARENT tasks
                        if (isParent) return true;
                        // Include tasks assigned to managers/employees (as long as they aren't explicitly level 2 leaf subtasks)
                        if (hasAssignee && level !== 2) return true;
                        return false;
                    });
                }
                // isAdminRole → validParentSource stays []

                const possibleParents = validParentSource.filter(t => {
                    const statusUpper = String(t.status || '').toUpperCase();
                    const notTerminal = !['COMPLETED', 'CANCELLED', 'APPROVED'].includes(statusUpper);
                    return notTerminal && t.id != null && t.title;
                });
                console.log('[AssignTask] possibleParents:', possibleParents.length, possibleParents.map(t => `#${t.id} ${t.title} [${t.task_type}]`));
                setExistingParentTasks(possibleParents);

                const deptFromEmployees = normalizedEmps.map(e => {
                    const deptId = e.department_id || e.dept_id || e.department || e.department_name;
                    const deptName = e.department_name || e.department || e.department_id || e.dept_id || deptId;
                    if (!deptId && !deptName) return null;
                    return { id: deptId || deptName, department_id: deptId || deptName, name: deptName || deptId };
                }).filter(Boolean);

                const mergedDeptMap = new Map();
                [...normalizedDepts, ...deptFromEmployees].forEach(d => {
                    const key = d.id || d.department_id || d.name;
                    if (!key) return;
                    if (!mergedDeptMap.has(key)) mergedDeptMap.set(key, d);
                });
                const mergedDepts = Array.from(mergedDeptMap.values());

                setEligibleAssignees(normalizedEmps);
                setDepartments(mergedDepts.length > 0
                    ? mergedDepts
                    : (fallbackDeptId ? [{ id: fallbackDeptId, department_id: fallbackDeptId, name: fallbackDeptName }] : []));
            } catch (err) {
                console.error("Failed to fetch metadata", err);
                toast.error('Failed to load metadata');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMetadata();
        }
    }, [user]);

    const addSubtask = () => {
        setSubtasks([...subtasks, {
            title: '',
            description: '',
            department_id: '',
            assigned_to_emp_id: '',
            start_date: '',
            end_date: '',
            priority: 'MEDIUM',
            sequence_no: subtasks.length + 1
        }]);
    };

    const addNormalSubtask = () => {
        setNormalSubtasks([...normalSubtasks, {
            title: '',
            description: '',
            assigned_to_emp_id: '',
            due_date: '',
            priority: 'MEDIUM'
        }]);
    };

    const removeNormalSubtask = (index) => {
        setNormalSubtasks(normalSubtasks.filter((_, i) => i !== index));
    };

    const handleNormalSubtaskChange = (index, field, value) => {
        const newList = [...normalSubtasks];
        newList[index][field] = value;
        setNormalSubtasks(newList);
    };

    const removeSubtask = (index) => {
        const newList = subtasks.filter((_, i) => i !== index);
        // Re-sequence
        const resequenced = newList.map((st, i) => ({ ...st, sequence_no: i + 1 }));
        setSubtasks(resequenced);
    };

    const handleSubtaskChange = (index, field, value) => {
        const newList = [...subtasks];
        newList[index][field] = value;
        setSubtasks(newList);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const typeLabel = formData.isRecurring ? "recurring task" : "task";
        const confirmed = window.confirm(`Are you sure you want to assign this ${typeLabel}?`);
        if (!confirmed) return;
        setSubmitting(true);

        try {
            const selectedAssignee = eligibleAssignees.find(e => String(e.emp_id) === String(formData.assignee));
            const targetedDeptListMatch = departments.find(d => 
                String(d.name) === String(selectedAssignee?.department_id || selectedAssignee?.department) || 
                String(d.id || d.department_id) === String(selectedAssignee?.department_id || selectedAssignee?.department)
            );
            const resolvedDepartmentId = targetedDeptListMatch?.id || targetedDeptListMatch?.department_id 
                || selectedAssignee?.department_id || selectedAssignee?.department 
                || user?.department_id || user?.dept_id;

            if (formData.isRecurring) {
                // Handle Recurring Task Creation
                const WEEKDAY_MAP = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
                const weeklyDayInt = typeof formData.weeklyDay === 'string' 
                    ? (WEEKDAY_MAP[formData.weeklyDay.toUpperCase()] || 1)
                    : (parseInt(formData.weeklyDay, 10) || 1);

                const recurringPayload = {
                    title: formData.title,
                    description: formData.description,
                    department_id: resolvedDepartmentId,
                    assigned_to_emp_id: formData.assignee,
                    assigned_by_emp_id: user?.emp_id || user?.id,
                    priority: formData.priority,
                    frequency: formData.recurringFrequency,
                    interval_days: 1,
                    weekly_day: formData.recurringFrequency === 'WEEKLY' ? weeklyDayInt : null,
                    monthly_day: formData.recurringFrequency === 'MONTHLY' ? parseInt(formData.recurringDay) : null,
                    yearly_month: formData.recurringFrequency === 'YEARLY' ? parseInt(formData.yearlyMonth) : null,
                    yearly_day: formData.recurringFrequency === 'YEARLY' ? parseInt(formData.yearlyDay) : null,
                    start_date: formData.startDate || new Date().toISOString().split('T')[0],
                    end_date: formData.endDate || null,
                    status: formData.status,
                    due_in_days: parseInt(formData.dueInDays, 10) || 0
                };

                const res = await api.post('/recurring-tasks', recurringPayload);
                const recurringId = res.data.id || res.data.recurring_id || res.data.data?.id || res.data.data?.recurring_id;

                // Add subtasks one by one
                if (recurringId && subtasks.length > 0) {
                    for (const st of subtasks) {
                        try {
                            await api.post(`/recurring-tasks/${recurringId}/subtasks`, {
                                title: st.title,
                                description: st.description,
                                department_id: st.department_id,
                                assigned_to_emp_id: st.assigned_to_emp_id,
                                priority: st.priority,
                                sequence_no: st.sequence_no
                            });
                        } catch (stErr) {
                            console.error("Subtask post failed", stErr);
                        }
                    }
                }
                toast.success('Recurring task defined successfully!');
                navigate('/recurring-tasks');
            } else {
                // Handle Normal Task Creation
                if (formData.taskStructure === 'SUBTASK' && !formData.parentTaskId) {
                    toast.error("Please select a parent task.");
                    setSubmitting(false);
                    return;
                }
                // Determine role context for submission
                const submitRole = String(user?.role || '').toUpperCase();
                const isSubmitAdmin   = submitRole === 'ADMIN';
                const isSubmitCFO     = submitRole === 'CFO';
                const isSubmitManager = submitRole === 'MANAGER';

                // Admin cannot create or edit tasks
                if (isSubmitAdmin) {
                    toast.error('Admins do not have task creation permissions.');
                    setSubmitting(false);
                    return;
                }

                // CFO subtask flow requires a manager to be selected
                if (isSubmitCFO && formData.taskStructure === 'SUBTASK' && !formData.managerId) {
                    toast.error('Please select a manager to assign this child task to.');
                    setSubmitting(false);
                    return;
                }

                let newTaskId;

                if (formData.taskStructure === 'SUBTASK') {
                    // MANAGER: create employee subtask under a Level-1 or Level-0 parent
                    //   → POST /tasks/{parentId}/subtasks
                    // CFO: create manager child task under a Level-0 standalone parent
                    //   → POST /tasks with parent_task_id
                    const subtaskAssigneeId = isSubmitCFO ? formData.managerId : formData.assignee;
                    const selectedAssigneeObj = eligibleAssignees.find(e => String(e.emp_id) === String(subtaskAssigneeId));
                    const assigneeDeptId = selectedAssigneeObj?.department_id || selectedAssigneeObj?.department || resolvedDepartmentId;

                    // Determine if CFO is creating under a Level-0 parent or Level-1 manager task
                    const selectedParentTask = existingParentTasks.find(t => String(t.id || t.task_id) === String(formData.parentTaskId));
                    const parentLevel = selectedParentTask?.task_level ?? selectedParentTask?.level;
                    const parentIsLevel0 = parentLevel === 0 || (selectedParentTask?.task_type || '').toUpperCase() === 'PARENT' || (selectedParentTask?.subtask_count > 0);

                    const payload = {
                        title:               formData.title,
                        description:         formData.description,
                        priority:            formData.priority,
                        assigned_to_emp_id:  subtaskAssigneeId,
                        department_id:       assigneeDeptId || resolvedDepartmentId,
                        due_date:            formData.dueDate
                    };

                    let taskRes;
                    if (isSubmitCFO) {
                        if (parentIsLevel0) {
                            // CFO → Level-0 parent: creates a Level-1 manager child task
                            taskRes = await api.post('/tasks', {
                                ...payload,
                                parent_task_id: formData.parentTaskId,
                                task_type: 'TASK'
                            });
                        } else {
                            // CFO → Level-1 manager task: creates an employee-level subtask
                            taskRes = await api.post(`/tasks/${formData.parentTaskId}/subtasks`, payload);
                        }
                    } else {
                        // Manager creates an employee subtask under Level-1 (CFO-assigned) or Level-0 (own parent)
                        taskRes = await api.post(`/tasks/${formData.parentTaskId}/subtasks`, payload);
                    }
                    newTaskId = taskRes.data.id || taskRes.data.subtask_id || taskRes.data.data?.id || taskRes.data.task_id;
                } else {
                    const payload = {
                        title: formData.title,
                        description: formData.description,
                        priority: formData.priority,
                        assigned_to_emp_id: formData.assignee,
                        department_id: resolvedDepartmentId,
                        due_date: formData.dueDate,
                        parent_task_id: null,
                        task_type: formData.taskStructure === 'PARENT' ? 'PARENT' : 'TASK'
                    };

                    const taskRes = await api.post('/tasks', payload);
                    newTaskId = taskRes.data?.id || taskRes.data?.task_id || taskRes.data?.data?.id || taskRes.data?.data?.task_id;
                }

                if (attachment && newTaskId) {
                    const formDataUpload = new FormData();
                    formDataUpload.append('file', attachment);
                    try {
                        await api.post(`/tasks/${newTaskId}/attachments`, formDataUpload, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (uploadErr) {
                        console.warn('Attachment upload failed:', uploadErr);
                    }
                }

                toast.success('Task assigned successfully!');
                navigate('/tasks');
            }
        } catch (err) {
            console.error('Failed to create task', err);
            toast.error('Failed: ' + (err.response?.data?.detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const isCFORole   = String(user?.role || '').toUpperCase() === 'CFO';
    const isAdminRole = String(user?.role || '').toUpperCase() === 'ADMIN';
    const isManager   = String(user?.role || '').toUpperCase() === 'MANAGER';
    // Admin has read-only access — no task creation or editing allowed
    const canCreateTasks = !isAdminRole;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in mt-4">
            <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-white/40 shadow-sm w-fit">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shrink-0 transition shadow-sm hover:shadow-md active:scale-95"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="pr-4">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight">Assign New Task</h1>
                    <p className="text-xs font-bold text-slate-400 mt-0.5 tracking-widest uppercase">Create and assign tasks</p>
                </div>
            </div>

            {/* Admin cannot create or edit tasks */}
            {isAdminRole && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <h2 className="text-[15px] font-black text-rose-700">Access Restricted</h2>
                    <p className="text-[12px] text-rose-500 font-medium mt-1">Admins have read-only access. Task creation and editing is reserved for Managers and CFO.</p>
                    <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2 bg-rose-600 text-white text-[12px] font-bold rounded-xl hover:bg-rose-700 transition">Go Back</button>
                </div>
            )}

            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Task Configuration Block */}
                    {/* Task Configuration Block */}
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-4">
                        
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white shadow-sm text-indigo-600">
                                        <Clock size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="pt-0.5">
                                        <h4 className="text-[14px] font-black text-slate-800 leading-none">Task Type</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Normal or Recurring</p>
                                    </div>
                                </div>
                                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isRecurring: false })}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isRecurring ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                                    >Normal</button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isRecurring: true })}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.isRecurring ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                                    >Recurring</button></div></div>

                        {!formData.isRecurring && (
                            <div className="animate-fade-in space-y-5 pt-4 border-t border-indigo-100">
                                {/* Task Structure Selector */}
                                <div>
                                    <div className="mb-3">
                                        <h4 className="text-[13px] font-black text-slate-800 leading-none">Task Structure</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1">Choose how this task fits into your workflow.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {/* Option 1 */}
                                        <label className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                                            formData.taskStructure === 'SINGLE'
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-indigo-200'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="taskStructure"
                                                value="SINGLE"
                                                checked={formData.taskStructure === 'SINGLE'}
                                                onChange={(e) => setFormData({ ...formData, taskStructure: e.target.value, parentTaskId: '' })}
                                                className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <FolderOpen size={15} className="text-indigo-500" />
                                                    <span className="font-black text-[13px] text-slate-800">
                                                        {isManager ? 'Independent Parent Task' : 'Standalone Parent Task'}
                                                    </span>
                                                </div>
                                                <span className="text-[10.5px] font-medium text-slate-500">
                                                    {isManager ? 'Create a new department-level task.' : 'Create a main task directly. No parent required.'}
                                                </span>
                                            </div>
                                        </label>

                                        {/* Option 2 */}
                                        <label className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                                            formData.taskStructure === 'SUBTASK'
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-indigo-200'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="taskStructure"
                                                value="SUBTASK"
                                                checked={formData.taskStructure === 'SUBTASK'}
                                                onChange={(e) => setFormData({ ...formData, taskStructure: e.target.value })}
                                                className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch size={15} className="text-violet-500" />
                                                    <span className="font-black text-[13px] text-slate-800">
                                                        {isManager ? 'Subtask' : 'Childtask under Existing Parent'}
                                                    </span>
                                                </div>
                                                <span className="text-[10.5px] font-medium text-slate-500">
                                                    {isManager ? 'Create under an existing assigned or self-created task.' : 'Create a childtask under a selected parent and assign it to a department manager.'}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* CFO Workflow Info Banner — shown below options */}
                                <div className="flex items-start gap-3 p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <Info size={14} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-indigo-700 tracking-wide mb-0.5">CFO Workflow</p>
                                        <p className="text-[11px] text-indigo-600/80 font-medium leading-relaxed">
                                            Create parent tasks and assign childtasks to department managers. Managers can later create employee-level subtasks from their assigned tasks.
                                        </p>
                                    </div>
                                </div>

                                {/* Subtask parent + manager selector */}
                                {formData.taskStructure === 'SUBTASK' && (() => {
                                    const isCFORole = String(user?.role || '').toUpperCase() === 'CFO';
                                    const managers = eligibleAssignees.filter(e =>
                                        (e.role || '').toUpperCase() === 'MANAGER'
                                    );
                                    const selectedManager = eligibleAssignees.find(e => String(e.emp_id) === String(formData.managerId));
                                    const managerDept = selectedManager?.department_name || selectedManager?.department || selectedManager?.department_id || '';
                                    const selectedParent = existingParentTasks.find(t => String(t.id || t.task_id) === String(formData.parentTaskId));

                                    return (
                                        <div className="animate-fade-in space-y-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Col 1 Row 1: Select Parent Task */}
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                                        Select Parent Task <span className="text-rose-500">*</span>
                                                    </label>
                                                    <SearchableSelect
                                                        name="parentTaskId"
                                                        required={formData.taskStructure === 'SUBTASK'}
                                                        value={formData.parentTaskId}
                                                        onChange={(val) => handleChange({ target: { name: 'parentTaskId', value: val } })}
                                                        options={existingParentTasks.map(t => {
                                                            const taskId = t.id || t.task_id;
                                                            const rawTitle = t.title || t.task_title || t.task_name || '(Untitled)';
                                                            return { value: taskId, label: `#${taskId} — ${rawTitle}` };
                                                        })}
                                                        placeholder="Select a parent task"
                                                    />
                                                    {isManager && (
                                                        <>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                                                CFO-assigned tasks &amp; your own parent tasks.
                                                            </p>
                                                            <div className="flex gap-1.5 mt-1.5">
                                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600">CFO-assigned Level-1</span>
                                                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold text-emerald-600">Your Level-0 Parents</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {existingParentTasks.length === 0 && !loading && (
                                                        <p className="text-[10px] text-rose-500 font-bold mt-1">No eligible parent tasks found.</p>
                                                    )}
                                                </div>

                                                {/* Col 2 Row 1: Parent Task Owner */}
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Parent Task Owner</label>
                                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white/60 text-[12px] font-semibold text-slate-500 h-[38px]">
                                                        <User2 size={13} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{selectedParent?.assigned_to_name || selectedParent?.assigned_by_name || (isCFORole ? '—' : (user?.name || 'Manager'))}</span>
                                                    </div>
                                                </div>

                                                {/* Col 1 Row 2: Assign Child To (Manager/Employee) */}
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                                        {(() => {
                                                            if (!isCFORole) return 'Assign Subtask To';
                                                            const parentLevel = selectedParent?.task_level ?? selectedParent?.level;
                                                            const parentIsLevel0 = parentLevel === 0 || isParentTask(selectedParent || {});
                                                            return parentIsLevel0 ? 'Assign To (Manager or Employee)' : 'Assign To (Employee only)';
                                                        })()} <span className="text-rose-500">*</span>
                                                    </label>
                                                    <SearchableSelect
                                                        name={isCFORole ? "managerId" : "assignee"}
                                                        required={true}
                                                        value={isCFORole ? formData.managerId : formData.assignee}
                                                        onChange={(val) => handleChange({ target: { name: isCFORole ? 'managerId' : 'assignee', value: val } })}
                                                        options={(() => {
                                                            if (isCFORole) {
                                                                const parentLevel = selectedParent?.task_level ?? selectedParent?.level;
                                                                const parentIsLevel0 = parentLevel === 0 || isParentTask(selectedParent || {});
                                                                const managers  = eligibleAssignees.filter(e => (e.role || '').toUpperCase() === 'MANAGER');
                                                                const employees = eligibleAssignees.filter(e => (e.role || '').toUpperCase() !== 'MANAGER' && (e.role || '').toUpperCase() !== 'CFO' && (e.role || '').toUpperCase() !== 'ADMIN');
                                                                const list = parentIsLevel0 ? [...managers, ...employees] : employees;
                                                                return list.map(m => ({
                                                                    value: m.emp_id,
                                                                    label: `${m.name} (${m.role || 'Employee'})${m.department_name || m.department_id ? ` — ${m.department_name || m.department_id}` : ''}`
                                                                }));
                                                            } else {
                                                                // Manager: only show employees from the same department
                                                                const managerDeptId = String(user?.department_id || user?.dept_id || user?.department || '').toLowerCase();
                                                                const deptFilteredEmployees = eligibleAssignees.filter(e => {
                                                                    const role = (e.role || '').toUpperCase();
                                                                    if (role === 'MANAGER' || role === 'CFO' || role === 'ADMIN') return false;
                                                                    if (!managerDeptId) return true;
                                                                    const empDept = String(e.department_id || e.dept_id || e.department || '').toLowerCase();
                                                                    return empDept === managerDeptId;
                                                                });
                                                                return deptFilteredEmployees.map(e => ({
                                                                    value: e.emp_id,
                                                                    label: `${e.name}${e.department_name ? ` — ${e.department_name}` : ''}`
                                                                }));
                                                            }
                                                        })()}
                                                        placeholder="Select an Assignee"
                                                    />
                                                </div>

                                                {/* Col 2 Row 2: Department — CFO only */}
                                                
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Department</label>
                                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white/60 text-[12px] font-semibold text-slate-500 h-[38px]">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                                            <span className="truncate">{managerDept || <span className="text-slate-300 italic text-[11px]">Auto-filled</span>}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Manager: Root Parent + Direct Parent info cards */}
                                            {isManager && formData.parentTaskId && selectedParent && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                            <Info size={14} className="text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Root Parent</p>
                                                            <p className="text-[12px] font-bold text-slate-700 leading-tight">
                                                                {selectedParent?.root_parent_task_title || selectedParent?.title || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                                            <GitBranch size={14} className="text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Direct Parent</p>
                                                            <p className="text-[12px] font-bold text-slate-700 leading-tight">
                                                                {selectedParent?.title || '—'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hierarchy Preview — always visible in SUBTASK mode */}
                                            <div className="pt-3 border-t border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hierarchy Preview</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {/* Node 1: Parent Task */}
                                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm border transition-all ${
                                                        selectedParent ? 'bg-white border-indigo-200' : 'bg-slate-50 border-slate-100'
                                                    }`}>
                                                        <FolderOpen size={13} className={selectedParent ? 'text-indigo-500' : 'text-slate-300'} />
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Parent</p>
                                                            <span className={`text-[11px] font-bold leading-tight block max-w-[120px] truncate ${selectedParent ? 'text-slate-700' : 'text-slate-300 italic'}`}>
                                                                {selectedParent?.title || 'Select parent task'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300" />
                                                    {/* Node 2: This Subtask (Child) */}
                                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm border transition-all ${
                                                        formData.title ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-100'
                                                    }`}>
                                                        <GitBranch size={13} className={formData.title ? 'text-violet-500' : 'text-slate-300'} />
                                                        <div>
                                                            <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-0.5 ${formData.title ? 'text-violet-400' : 'text-slate-300'}`}>Child</p>
                                                            <span className={`text-[11px] font-bold leading-tight block max-w-[120px] truncate ${formData.title ? 'text-violet-700' : 'text-slate-300 italic'}`}>
                                                                {formData.title || 'Enter task title'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-slate-300" />
                                                    {/* Node 3: Manager (next step) */}
                                                    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-sm border transition-all ${
                                                        selectedManager ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                                                    }`}>
                                                        <Users2 size={13} className={selectedManager ? 'text-emerald-500' : 'text-slate-300'} />
                                                        <div>
                                                            <p className={`text-[8px] font-black uppercase tracking-widest leading-none mb-0.5 ${selectedManager ? 'text-emerald-500' : 'text-slate-300'}`}>Next step by Manager</p>
                                                            <span className={`text-[11px] font-bold leading-tight block max-w-[120px] truncate ${selectedManager ? 'text-emerald-700' : 'text-slate-300 italic'}`}>
                                                                {selectedManager?.name || 'Select a manager'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-medium mt-2">This is how the task hierarchy will appear in the system.</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {formData.isRecurring && (
                            <div className="animate-fade-in space-y-6 pt-4 border-t border-indigo-100">
                                {/* Frequency Selector */}
                                <div className="flex items-center gap-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Frequency:</label>
                                    <div className="flex bg-white p-1 rounded-xl border border-indigo-100 w-full shadow-sm">
                                        {['WEEKLY', 'MONTHLY', 'YEARLY'].map((f) => (
                                            <button
                                                key={f}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, recurringFrequency: f })}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.recurringFrequency === f ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Recurrence Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formData.recurringFrequency === 'WEEKLY' && (
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Day of Week</label>
                                            <select 
                                                className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                                value={formData.weeklyDay}
                                                onChange={(e) => setFormData({ ...formData, weeklyDay: parseInt(e.target.value) })}
                                            >
                                                {[['MON',1],['TUE',2],['WED',3],['THU',4],['FRI',5],['SAT',6],['SUN',7]].map(([label, val]) => (
                                                    <option key={val} value={val}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.recurringFrequency === 'MONTHLY' && (
                                        <div>
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Day of Month</label>
                                            <input 
                                                type="number" min="1" max="31"
                                                className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                                value={formData.recurringDay}
                                                onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {formData.recurringFrequency === 'YEARLY' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Month</label>
                                                <select 
                                                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                                    value={formData.yearlyMonth}
                                                    onChange={(e) => setFormData({ ...formData, yearlyMonth: e.target.value })}
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                        <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('en', { month: 'long' })}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Day</label>
                                                <input 
                                                    type="number" min="1" max="31"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                                    value={formData.yearlyDay}
                                                    onChange={(e) => setFormData({ ...formData, yearlyDay: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">Start Date</label>
                                        <input 
                                            type="date"
                                            className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">End Date (Optional)</label>
                                        <input 
                                            type="date"
                                            className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block ml-1" title="Number of days from task generation until it is due">Due in Days</label>
                                        <input 
                                            type="number" min="0"
                                            className="w-full px-4 py-2.5 rounded-xl border border-indigo-100 bg-white font-bold text-[12px] focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all"
                                            value={formData.dueInDays}
                                            onChange={(e) => setFormData({ ...formData, dueInDays: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Subtask Templates */}
                                <div className="pt-6 border-t border-indigo-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-[14px] font-black text-slate-800 leading-none">Subtask Templates</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predefined subtasks for each recurrence</p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={addSubtask}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <Plus size={14} strokeWidth={3} /> Add Subtask
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {subtasks.length === 0 ? (
                                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-indigo-100">
                                                <p className="text-[11px] font-bold text-slate-400 italic">No subtask templates added yet.</p>
                                            </div>
                                        ) : (
                                            subtasks.map((st, idx) => (
                                                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative group animate-fade-in">
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeSubtask(idx)}
                                                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subtask Title</label>
                                                            <input 
                                                                type="text"
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none text-[13px] font-semibold"
                                                                placeholder="Subtask Title..."
                                                                value={st.title}
                                                                onChange={(e) => handleSubtaskChange(idx, 'title', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Department</label>
                                                            <select 
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none text-[12px] font-semibold"
                                                                value={st.department_id}
                                                                onChange={(e) => {
                                                                    // Reset assignee when department changes
                                                                    const newList = [...subtasks];
                                                                    newList[idx] = { ...newList[idx], department_id: e.target.value, assigned_to_emp_id: '' };
                                                                    setSubtasks(newList);
                                                                }}
                                                            >
                                                                <option value="">Select Dept</option>
                                                                {departments.map(d => (
                                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Assignee</label>
                                                            <select 
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-300 outline-none text-[12px] font-semibold"
                                                                value={st.assigned_to_emp_id}
                                                                onChange={(e) => handleSubtaskChange(idx, 'assigned_to_emp_id', e.target.value)}
                                                            >
                                                                <option value="">Select Assignee</option>
                                                                {eligibleAssignees
                                                                    .filter(p => {
                                                                        if (!st.department_id) return true;
                                                                        const empDeptId = String(p.department_id || p.dept_id || '');
                                                                        return empDeptId === String(st.department_id);
                                                                    })
                                                                    .map(p => (
                                                                        <option key={p.emp_id} value={p.emp_id}>{p.name}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Task Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                            Task Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 font-medium transition-all placeholder:text-slate-400 text-[14px]"
                            placeholder={isCFORole ? 'e.g. Q3 Performance Review' : 'e.g. Prepare Q2 variance analysis'}
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            className="w-full p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 font-medium transition-all placeholder:text-slate-400 resize-y text-[14px]"
                            placeholder="Provide a clear description of the task..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Attachment — styled drag-drop box */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Attachment</label>
                        <label className="flex flex-col items-center justify-center gap-2 w-full px-5 py-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-violet-300 transition-all cursor-pointer group">
                            <div className="flex items-center gap-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500 shrink-0"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                <span className="text-[13px] font-bold text-violet-600 group-hover:text-violet-700">Choose file</span>
                                <span className="text-[13px] text-slate-400 font-medium">or drag and drop here</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">Supports .pdf, .docx, .xlsx, .png or .jpg (Max 10MB)</p>
                            <input
                                type="file"
                                name="attachment"
                                className="hidden"
                                onChange={(e) => setAttachment(e.target.files[0])}
                            />
                        </label>
                        {attachment && (
                            <p className="text-[11px] text-violet-600 font-bold mt-1.5 ml-1">📎 {attachment.name}</p>
                        )}
                    </div>

                    {/* Assignee + Priority (2-col) */}
                    <div className="grid grid-cols-2 gap-4">
                        {formData.taskStructure !== 'SUBTASK' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                                    Assignee <span className="text-rose-500">*</span>
                                </label>
                                <SearchableSelect
                                    name="assignee"
                                    required={formData.taskStructure !== 'SUBTASK'}
                                    value={formData.assignee}
                                    onChange={(val) => handleChange({ target: { name: 'assignee', value: val } })}
                                    options={eligibleAssignees.map(p => ({
                                        value: p.emp_id,
                                        label: `${p.name} (${p.role}) - ${p.department_name || p.department_id || p.department}`
                                    }))}
                                    placeholder={loading ? 'Loading...' : 'Select a team member'}
                                />
                                {!isCFORole && <p className="text-[11px] text-slate-400 font-medium mt-1 ml-1">Assign to a member of your team.</p>}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Priority</label>
                            <select
                                name="priority"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 font-medium transition-all text-[13px]"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                <option key="low" value="LOW">Low</option>
                                <option key="medium" value="MEDIUM">Medium</option>
                                <option key="high" value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date — full width */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                            Due Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="dueDate"
                            required={!formData.isRecurring}
                            disabled={formData.isRecurring}
                            className={`w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-300 font-medium transition-all text-[14px] ${formData.isRecurring ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                        {formData.isRecurring && <p className="text-[11px] text-violet-500 font-bold mt-1 ml-1 uppercase tracking-wide">Dynamic date will be used for recurring tasks</p>}
                    </div>

                    

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/tasks')}
                            className="px-6 py-3 rounded-xl font-bold text-[#4285F4] bg-white border border-[#4285F4]/30 hover:bg-blue-50 transition-colors shadow-sm text-[14px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-[#7B51ED] hover:bg-violet-700 transition flex items-center justify-center gap-2 shadow-sm text-[14px]"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignTaskPage;
