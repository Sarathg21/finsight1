import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Target, Users as UsersIcon, CheckCircle2, Clock, AlertCircle,
    ArrowLeft, TrendingUp, Layers, User as UserIcon, Building2, Loader2,
    Calendar, Filter, ChevronDown, CheckCircle, AlertTriangle, ShieldCheck,
    RefreshCw
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import DepartmentDistributionCard from '../components/Dashboard/DepartmentDistributionCard';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const getRiskLabel = (rating) => {
    const r = (rating || '').toLowerCase();
    if (r.includes('high')) return 'High';
    if (r.includes('medium')) return 'Medium';
    return 'Low';
};

const cleanNum = (v) => {
    if (v === undefined || v === null) return 0;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
};

// Extract array from any possible backend nesting
const extractArr = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    for (const key of ['data', 'items', 'tasks', 'subtasks', 'departments', 'objectives', 'results', 'records', 'rows']) {
        if (Array.isArray(data[key])) return data[key];
    }
    return [];
};

const STATUS_DONE = new Set(['COMPLETED', 'APPROVED', 'DONE', 'FINISHED', 'SUCCESS']);
const STATUS_SUBMITTED = new Set(['SUBMITTED', 'PENDING_APPROVAL', 'REVIEW']);

const normStatus = (s) => (s || '').toString().trim().toUpperCase().replace(/\s+/g, '_');
const isDone = (s) => STATUS_DONE.has(normStatus(s?.status ?? s?.task_status ?? s ?? ''));
const isActive = (s) => STATUS_SUBMITTED.has(normStatus(s?.status ?? s?.task_status ?? s ?? ''));

/* ─── StatusBadge ───────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
    APPROVED: 'bg-emerald-500 text-white',
    COMPLETED: 'bg-emerald-500 text-white',
    DONE: 'bg-emerald-500 text-white',
    IN_PROGRESS: 'bg-blue-600 text-white',
    STARTED: 'bg-blue-600 text-white',
    PENDING: 'bg-amber-400 text-amber-900',
    REVIEW: 'bg-amber-400 text-amber-900',
    SUBMITTED: 'bg-sky-500 text-white',
    NEW: 'bg-indigo-500 text-white',
    REWORK: 'bg-rose-600 text-white',
    OVERDUE: 'bg-rose-600 text-white',
    CANCELLED: 'bg-slate-400 text-white',
};

const StatusBadge = ({ status }) => {
    const key = normStatus(status);
    const cls = STATUS_COLORS[key] || 'bg-slate-100 text-slate-600';
    let label = (status || '').trim().replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    if (key === 'NEW' || key === 'NOT_STARTED') label = 'Not started';
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight shadow-sm min-w-[90px] text-center inline-block ${cls}`}>
            {label || '—'}
        </span>
    );
};

/* ─── KPI card ──────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, sub, gradient, Icon }) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow-lg flex flex-col justify-between transition-all hover:scale-[1.03] group h-full min-h-[120px]`}>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-start justify-between relative z-10 w-full mb-2">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.1em] drop-shadow-sm leading-tight pr-2">{label}</span>
            {Icon && <Icon size={16} className="text-white/40 group-hover:text-white/80 transition-colors shrink-0 ml-1 mt-0.5" />}
        </div>
        <div className="relative z-10 flex flex-col mt-auto">
            <span className="text-2xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{value}</span>
            <div className="h-4 mt-0.5">
                {sub && <span className="text-[11px] font-black text-white/90 drop-shadow-sm block">{sub}</span>}
            </div>
        </div>
    </div>
);

/* ════════════════════════════════════════════════════════════════════════════ */
const OKRSubTaskPage = () => {
    const { okrId: routeOkrId } = useParams();
    const { user } = useAuth();
    const userRole = (user?.role || '').toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const canUseCfoReports = userRole.includes('CFO') || userRole.includes('ADMIN');
    const navigate = useNavigate();

    const today = new Date().toISOString().slice(0, 10);
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    // Validate a YYYY-MM-DD string — reject corrupted values (e.g. year "0003")
    const validDate = (raw, fallback) => {
        if (!raw) return fallback;
        const d = new Date(raw);
        if (isNaN(d.getTime())) return fallback;
        const yr = d.getFullYear();
        if (yr < 2020 || yr > 2100) { localStorage.removeItem('dashboard_to_date'); return fallback; }
        return raw;
    };

    const getStored = () => ({
        from_date:    validDate(localStorage.getItem('dashboard_from_date'), firstOfMonth),
        to_date:      validDate(localStorage.getItem('dashboard_to_date'),   today),
        currentOkrId: routeOkrId || '',
    });

    const [filters, setFilters] = useState(getStored);

    // sync global filter events from Navbar
    useEffect(() => {
        const handle = () => {
            const n = { from_date: localStorage.getItem('dashboard_from_date') || firstOfMonth, to_date: localStorage.getItem('dashboard_to_date') || today };
            setFilters(prev => {
                if (prev.from_date === n.from_date && prev.to_date === n.to_date) return prev;
                setTempFrom(n.from_date);
                setTempTo(n.to_date);
                return { ...prev, ...n };
            });
        };
        window.addEventListener('dashboard-filter-change', handle);
        return () => window.removeEventListener('dashboard-filter-change', handle);
    }, []);

    /* state */
    const [tempFrom, setTempFrom]         = useState(filters.from_date);
    const [tempTo,   setTempTo]           = useState(filters.to_date);
    const [loading, setLoading]           = useState(true);
    const [globalOverview, setGlobalOverview] = useState(null);
    const [objectivesList, setObjectivesList] = useState([]);
    const [selectedOKR, setSelectedOKR]   = useState(null);
    const [subtasks, setSubtasks]         = useState([]);
    const [deptStats, setDeptStats]       = useState([]);

    /* ── fetch objectives list for dropdown ────────────────────────────────── */
    /* ── fetch objectives list for dropdown ────────────────────────────────── */
    const fetchInitialData = useCallback(async () => {
        if (isAdmin) { setLoading(false); return; }
        setLoading(true);
        try {
            // Priority 1: User's exact range
            const params = { from_date: filters.from_date, to_date: filters.to_date };
            // Priority 2: 90-day "Reality Check" (ensures we see data from DB)
            const wideParams = { from_date: '2026-01-01', to_date: today };

            const [overviewRes, listRes, summaryRes, wideListRes, tasksRes] = await Promise.all([
                canUseCfoReports ? api.get('/reports/cfo/okr/overview', { params }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
                canUseCfoReports ? api.get('/reports/cfo/okr/objectives', { params }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                canUseCfoReports
                    ? api.get('/dashboard/cfo', { params }).catch(() => ({ data: {} }))
                    : (userRole === 'MANAGER' ? api.get('/dashboard/manager', { params }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} })),
                // Fallback for the dropdown list – always get at least something if db has it
                canUseCfoReports ? api.get('/reports/cfo/okr/objectives', { params: wideParams }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                api.get('/tasks', { params: { limit: 150, scope: (userRole === 'CFO' || userRole === 'ADMIN') ? 'org' : 'department' } }).catch(() => ({ data: [] }))
            ]);

            const globalData  = overviewRes.data?.data || overviewRes.data || {};
            const summaryData = summaryRes.data?.data  || summaryRes.data  || {};
            
            // Merge lists: prioritize filtered results, fall back to wide results if filtered list is empty
            const rawList = extractArr(listRes.data);
            const wideList = extractArr(wideListRes.data);
            const list = rawList.length > 0 ? rawList : wideList;

            const allTasks = extractArr(tasksRes.data);
            const manualParents = allTasks.filter(t => {
                const isParentByFlag = t.is_parent || t.task_type === 'PARENT' || (t.subtask_count && t.subtask_count > 0);
                const isRecurring = !!(t.recurring_task_id || t.recurring_id || t.automation_id);
                // If it has no parent_task_id, it is a root task (objective candidate)
                const hasNoParent = !t.parent_task_id && !t.parent_id;

                // ── Date Filter (Inclusive) ──
                const cDate = t.assigned_at || t.assigned_date || t.created_at || t.date;
                const dDate = t.due_date || t.end_date;
                const cKey = cDate ? String(cDate).slice(0, 10) : null;
                const dKey = dDate ? String(dDate).slice(0, 10) : null;
                const isWithin = (k) => k && k >= filters.from_date && k <= filters.to_date;
                const dateMatch = isWithin(cKey) || isWithin(dKey);

                return hasNoParent && (isParentByFlag || isRecurring) && dateMatch;
            });

            // Compute reliable subtask stats from allTasks by grouping them by their parent
            const statsFromTasks = {};
            allTasks.forEach(t => {
                const pid = String(t.parent_task_id || t.parent_id || '');
                if (pid && pid !== 'undefined') {
                    if (!statsFromTasks[pid]) statsFromTasks[pid] = { total: 0, completed: 0, submitted: 0 };
                    statsFromTasks[pid].total++;
                    const st = String(t.status || t.task_status || '').toUpperCase();
                    if (['COMPLETED', 'APPROVED', 'DONE', 'SUCCESS'].includes(st)) {
                        statsFromTasks[pid].completed++;
                    }
                    if (['SUBMITTED', 'PENDING_APPROVAL', 'REVIEW'].includes(st)) {
                        statsFromTasks[pid].submitted++;
                    }
                }
            });

            console.log('[OKR-Sub] objectives report count:', list.length, '| manual parents from tasks:', manualParents.length);

            const dropdownList = list
                .map(item => {
                    const pid = String(item.parent_task_id ?? item.id ?? item.task_id ?? '');
                    const st = statsFromTasks[pid] || { total: 0, completed: 0, submitted: 0 };
                    return {
                        parent_task_id:     item.parent_task_id ?? item.id ?? item.task_id,
                        objective_title:    item.objective_title || item.title || item.name || 'Objective',
                        total_subtasks:     Math.max(cleanNum(item.total_subtasks ?? item.sub_total ?? item.subtask_count ?? item.total_tasks), st.total),
                        completed_subtasks: Math.max(cleanNum(item.completed_subtasks ?? item.sub_comp ?? item.completed_count ?? item.completed_tasks), st.completed),
                        submitted_subtasks: Math.max(cleanNum(item.submitted_subtasks ?? item.submitted_count), st.submitted),
                    };
                });

            // Merge manual parents if not already in list
            manualParents.forEach(mp => {
                const mid = mp.id || mp.task_id;
                const smid = String(mid);
                const st = statsFromTasks[smid] || { total: 0, completed: 0, submitted: 0 };
                if (!dropdownList.some(o => String(o.parent_task_id) === smid)) {
                    dropdownList.push({
                        parent_task_id: mid,
                        objective_title: mp.title || mp.task_name || 'Strategic Objective',
                        total_subtasks: Math.max(cleanNum(mp.subtask_count || (Array.isArray(mp.subtasks) ? mp.subtasks.length : 0)), st.total),
                        completed_subtasks: st.completed,
                        submitted_subtasks: st.submitted
                    });
                }
            });

            const finalDropdown = dropdownList.filter(i => i.parent_task_id != null && i.objective_title);
            setObjectivesList(finalDropdown);

            /* global KPI calculation with fallbacks */
            const fallbackGlobalSubmitted = allTasks.filter(t => ['SUBMITTED', 'PENDING_APPROVAL', 'REVIEW'].includes(String(t.status || t.task_status || '').toUpperCase())).length;
            const listTotal     = dropdownList.reduce((a, i) => a + i.total_subtasks, 0);
            const listDone      = dropdownList.reduce((a, i) => a + i.completed_subtasks, 0);
            let listSubmit      = dropdownList.reduce((a, i) => a + i.submitted_subtasks, 0);
            listSubmit = Math.max(listSubmit, fallbackGlobalSubmitted);
            
            // If the global overview for the 2-day filter is 0, use the wide-list totals (according to DB)
            const gTotal = cleanNum(globalData.total_subtasks ?? globalData.sub_total ?? globalData.total_tasks ?? summaryData.total_tasks);
            const finalTotal = gTotal > 0 ? gTotal : listTotal;
            
            const gDone = cleanNum(globalData.completed_tasks ?? globalData.completed_count ?? summaryData.completed_count);
            const finalDone = gDone > 0 || gTotal > 0 ? gDone : listDone;

            const overallPct = finalTotal > 0 ? Math.round((finalDone / finalTotal) * 100) : cleanNum(globalData.overall_progress || summaryData.overall_progress);
            const teamScore  = cleanNum(summaryData.team_score_current || summaryData.score || summaryData.team_performance || summaryData.overall_progress) || overallPct;

            setGlobalOverview({
                ...globalData,
                total_objectives:   Math.max(dropdownList.length, cleanNum(globalData.total_objectives ?? globalData.total_okrs ?? globalData.objective_count)),
                team_score_current: teamScore,
                overall_progress:   overallPct,
                total_subtasks:     finalTotal,
                completed_tasks:    finalDone,
                submitted_tasks:    Math.max(cleanNum(globalData.submitted_tasks || summaryData.pending_approval), listSubmit),
                at_risk:            cleanNum(globalData.at_risk ?? globalData.risk_count),
                avg_health_score:   cleanNum(globalData.avg_health_score ?? globalData.average_progress) || teamScore,
            });

            // auto-select first objective if nothing selected
            const hasCurrent = dropdownList.some(o => String(o.parent_task_id) === String(filters.currentOkrId));
            if ((!filters.currentOkrId || !hasCurrent) && dropdownList.length > 0) {
                setFilters(prev => ({ ...prev, currentOkrId: dropdownList[0].parent_task_id }));
            }
        } catch (e) {
            console.error('[OKR-Sub] fetchInitialData error', e);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, canUseCfoReports, userRole, filters.from_date, filters.to_date, filters.currentOkrId, today]);

    /* ── fetch drilldown (subtasks + summary + depts) ──────────────────────── */
    const fetchDrilldown = useCallback(async (okrId) => {
        if (!okrId) return;
        setLoading(true);
        try {
            // Use the user's actual filter dates — same range as OKR Dashboard
            const params = { from_date: filters.from_date, to_date: filters.to_date };

            const [summaryRes, subtasksRes, deptsRes] = await Promise.all([
                canUseCfoReports ? api.get(`/reports/cfo/okr/objectives/${okrId}/summary`,     { params }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
                canUseCfoReports ? api.get(`/reports/cfo/okr/objectives/${okrId}/subtasks`,    { params }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                canUseCfoReports ? api.get(`/reports/cfo/okr/objectives/${okrId}/departments`, { params }).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
            ]);

            let summaryData = summaryRes.data?.data || summaryRes.data || {};
            let rawSubList  = extractArr(subtasksRes.data);
            let subList     = rawSubList.filter(s => String(s.status || s.task_status || s.status_name || '').toUpperCase() !== 'CANCELLED');
            let depts       = extractArr(deptsRes.data);

            console.log('[OKR-Sub] drilldown okrId:', okrId, '| subtasks from report endpoint:', subList.length, '| depts:', depts.length);

            // ── FALLBACK: if report subtasks empty, use the direct tasks endpoint ──
            if (subList.length === 0) {
                console.log('[OKR-Sub] Report subtasks empty — falling back to /tasks/{id}/subtasks');
                try {
                    const fallbackRes = await api.get(`/tasks/${okrId}/subtasks`);
                    const fallbackList = extractArr(fallbackRes.data).filter(s => String(s.status || s.task_status || s.status_name || '').toUpperCase() !== 'CANCELLED');
                    console.log('[OKR-Sub] Fallback /tasks subtasks:', fallbackList.length);
                    if (fallbackList.length > 0) subList = fallbackList;
                } catch (fe) {
                    console.warn('[OKR-Sub] Fallback /tasks subtasks failed', fe);
                }
            }

            // ── Build sub-task title / assignee from every possible field name ──
            const formattedSubtasks = subList.map((st, idx) => {
                const status    = st.status || st.task_status || st.status_name || 'NEW';
                const dueRaw    = st.due_date || st.dueDate || st.due || st.end_date;
                const dueDate   = dueRaw ? new Date(dueRaw) : null;
                const now       = new Date(); now.setHours(0,0,0,0);

                let daysLeftText;
                if (st.days_left_text) {
                    daysLeftText = st.days_left_text;
                } else if (isDone(st)) {
                    daysLeftText = 'Done';
                } else if (dueDate) {
                    const diff = Math.ceil((dueDate - now) / 86400000);
                    daysLeftText = diff < 0 ? `${Math.abs(diff)}d late` : diff === 0 ? 'Today' : `${diff}d left`;
                } else {
                    daysLeftText = '—';
                }

                // Normalise task_level: 1 = manager, 2 = employee
                const taskLevel = st.task_level ?? (st.task_type === 'EMPLOYEE_TASK' ? 2 : 1);
                const taskType  = st.task_type || (taskLevel === 2 ? 'EMPLOYEE_TASK' : 'MANAGER_TASK');

                const rawDept = st.department_name || st.department || st.dept_name || st.dept;
                let finalDept = (rawDept && rawDept !== '—') ? rawDept : null;

                if (!finalDept) {
                    const title = (st.subtask_title || st.title || '').toLowerCase();
                    if (title.includes('audit')) finalDept = 'MIS Report and Internal Audit';
                    else if (title.includes('closing') || title.includes('month-end')) {
                        finalDept = null; 
                    }
                    else if (title.includes('ap_inv') || title.includes('ap-inv') || title.includes('ap - inv') || title.includes('invoice')) finalDept = 'Accounts Payables - Invoices';
                    else if (title.includes('ap_pay') || title.includes('ap-pay') || title.includes('ap - pay') || title.includes('payment') || title.includes('payables')) finalDept = 'Accounts Payables - Payments';
                    else if (title.includes('receivables')) finalDept = 'Accounts Receivables';
                }

                return {
                    ...st,
                    // normalise display fields
                    task_id:           st.task_id ?? st.id ?? (1000 + idx),
                    parent_task_id:    st.parent_task_id ?? st.parentTaskId ?? st.parent_id ?? st.parentId,
                    subtask_title:     st.subtask_title || st.title || st.task_name || st.name || '(untitled)',
                    department_name:   finalDept || '—',
                    assigned_to_name:  st.assigned_to_name || st.assignee_name || st.employee_name || st.assigned_to || '—',
                    parent_task_title: st.parent_task_title || st.root_parent_task_title || '—',
                    due_date:          dueRaw ? String(dueRaw).slice(0, 10) : '—',
                    status,
                    days_left_text:    daysLeftText,
                    task_level:        taskLevel,
                    task_type:         taskType,
                };
            });

            // ── Summary ──
            const listObj = objectivesList.find(o => String(o.parent_task_id) === String(okrId));
            if (!summaryData.objective_title && !summaryData.parent_task_title) {
                summaryData.objective_title = listObj?.objective_title || 'Strategic Objective';
            }

            const manualTotal     = formattedSubtasks.length;
            const manualDone      = formattedSubtasks.filter(s => isDone(s)).length;
            const manualSubmitted = formattedSubtasks.filter(s => isDone(s) || isActive(s)).length;

            const finalTotal     = Math.max(cleanNum(summaryData.total_subtasks ?? summaryData.sub_total ?? listObj?.total_subtasks), manualTotal);
            const finalDone      = Math.max(cleanNum(summaryData.completed_subtasks ?? summaryData.sub_comp ?? listObj?.completed_subtasks), manualDone);
            const finalSubmitted = Math.max(cleanNum(summaryData.submitted_subtasks ?? summaryData.sub_submitted ?? listObj?.submitted_subtasks), manualSubmitted);
            const progressPct    = finalTotal > 0 ? Math.round((finalDone / finalTotal) * 100) : cleanNum(summaryData.progress_pct);

            // days left from due date
            let daysLeft = summaryData.days_left ?? null;
            if (daysLeft === null || daysLeft === undefined) {
                const primary = summaryData.due_date || summaryData.end_date || summaryData.target_date;
                if (primary) {
                    const due = new Date(primary); due.setHours(0,0,0,0);
                    const now = new Date(); now.setHours(0,0,0,0);
                    daysLeft = Math.max(0, Math.ceil((due - now) / 86400000));
                } else {
                    // use latest due_date from subtasks
                    let latest = null;
                    formattedSubtasks.forEach(s => {
                        if (s.due_date && s.due_date !== '—') {
                            const d = new Date(s.due_date);
                            if (!latest || d > latest) latest = d;
                        }
                    });
                    if (latest) {
                        const now = new Date(); now.setHours(0,0,0,0);
                        daysLeft = Math.max(0, Math.ceil((latest - now) / 86400000));
                    } else {
                        daysLeft = 0;
                    }
                }
            }

            setSelectedOKR({
                ...summaryData,
                total_subtasks:     finalTotal,
                completed_subtasks: finalDone,
                submitted_subtasks: finalSubmitted,
                progress_pct:       progressPct,
                health_score:       progressPct,
                days_left:          daysLeft,
            });
            setSubtasks(formattedSubtasks);

            // ── departments fallback: compute from subtasks if empty ──
            if (depts.length === 0 && formattedSubtasks.length > 0) {
                const deptMap = {};
                formattedSubtasks.forEach(st => {
                    const d = st.department_name;
                    if (d && d !== '—') {
                        if (!deptMap[d]) deptMap[d] = { department_name: d, total_subtasks: 0 };
                        deptMap[d].total_subtasks++;
                    }
                });
                depts = Object.values(deptMap);
            }
            setDeptStats(depts);

        } catch (e) {
            console.error('[OKR-Sub] fetchDrilldown error', e);
        } finally {
            setLoading(false);
        }
    }, [canUseCfoReports, objectivesList, filters.from_date, filters.to_date]);

    /* effects */
    useEffect(() => { fetchInitialData(); }, []); // Only on mount. Updates via handleApply.

    useEffect(() => {
        if (!filters.currentOkrId) return;
        fetchDrilldown(filters.currentOkrId);
        if (filters.currentOkrId !== routeOkrId) {
            navigate(`/okr-subtask/${filters.currentOkrId}`, { replace: true });
        }
    }, [filters.currentOkrId]);

    const handleApply = async () => {
        setFilters(prev => ({ ...prev, from_date: tempFrom, to_date: tempTo }));
        localStorage.setItem('dashboard_from_date', tempFrom);
        localStorage.setItem('dashboard_to_date', tempTo);
        window.dispatchEvent(new Event('dashboard-filter-change'));
        // fetchInitialData and fetchDrilldown will be triggered by useEffect or called directly here
        // But since we want immediate feedback:
        setTimeout(() => {
            fetchInitialData();
            if (filters.currentOkrId) fetchDrilldown(filters.currentOkrId);
        }, 0);
    };

    /* derived display vars */
    const g = globalOverview || {};
    const dTotal = Math.max(cleanNum(g.total_objectives ?? g.total_okrs), objectivesList.length);
    const dProgress = cleanNum(g.overall_progress);
    const dScore    = cleanNum(g.team_score_current) || dProgress;
    const dTotalSub = cleanNum(g.total_subtasks ?? g.sub_total);
    const dDone     = cleanNum(g.completed_tasks ?? g.completed_count);
    const dSubmit   = cleanNum(g.submitted_tasks ?? g.submitted_count);
    const dAtRisk   = cleanNum(g.at_risk ?? g.risk_count);
    const dAvgRate  = cleanNum(g.avg_health_score ?? g.average_progress);
    const dSubPct   = dTotalSub > 0 ? Math.round((dDone   / dTotalSub) * 100) : 0;
    const dSumPct   = dTotalSub > 0 ? Math.round((dSubmit / dTotalSub) * 100) : 0;

    const sortedSubtasks = useMemo(() => {
        const managers = subtasks.filter(st => st.task_level === 1 || st.task_type === 'MANAGER_TASK');
        const employees = subtasks.filter(st => st.task_level === 2 || st.task_type === 'EMPLOYEE_TASK');

        const result = [];
        managers.forEach(mgr => {
            result.push(mgr);
            // Group employees under their specific manager task
            const children = employees.filter(emp => 
                (emp.parent_task_id && String(emp.parent_task_id) === String(mgr.task_id)) ||
                (emp.parent_task_title && emp.parent_task_title === mgr.subtask_title)
            );
            result.push(...children);
        });

        // Collect any tasks that weren't matched in the hierarchy
        const usedIds = new Set(result.map(r => r.task_id));
        const orphans = employees.filter(emp => !usedIds.has(emp.task_id));
        result.push(...orphans);

        return result;
    }, [subtasks]);

    const topMetrics = [
        { label: 'Total Objectives',        value: dTotal,                           gradient: 'from-[#4285F4] to-[#2563EB]',   Icon: Target       },
        { label: 'Team Performance Score',  value: `${dScore}%`,                     gradient: 'from-[#7C3AED] to-[#5B21B6]',   Icon: TrendingUp   },
        { label: 'Total Subtasks Completed',value: `${dDone} `,        sub: `${dSubPct}%`, gradient: 'from-[#10B981] to-[#059669]',   Icon: CheckCircle2 },
        { label: 'Awaiting Approval',       value: dSubmit,                          sub: `${dSumPct}%`, gradient: 'from-[#F59E0B] to-[#D97706]',   Icon: ShieldCheck  },
        { label: 'At Risk',                 value: dAtRisk,                           gradient: 'from-[#F43F5E] to-[#E11D48]',   Icon: AlertTriangle },
        { label: 'Avg Completion Rate',     value: `${dAvgRate}%`,                   gradient: 'from-[#06B6D4] to-[#0891B2]',   Icon: CheckCircle  },
        { label: 'Overall Progress',        value: `${dProgress}%`,                  gradient: 'from-[#4F46E5] to-[#4338CA]',   Icon: TrendingUp   },
    ];

    /* dept chart */
    const CHART_COLORS = ['#1e3a8a', '#10b981', '#7c3aed', '#f59e0b', '#ef4444', '#06b6d4', '#f43f5e'];
    const deptDistribution = useMemo(() =>
        deptStats.map((d, i) => ({
            name:  d.department_name || '—',
            value: d.total_subtasks  || 0,
            fill:  CHART_COLORS[i % CHART_COLORS.length],
        })),
    [deptStats]);

    /* ── Admin guard ─────────────────────────────────────────────────────────── */
    if (isAdmin) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6 bg-[#f8fafc]">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                <ShieldCheck size={36} className="text-amber-400" />
            </div>
            <div className="text-center">
                <h2 className="text-lg font-bold text-slate-700 mb-1">OKR Dashboard — Admin Restricted</h2>
                <p className="text-slate-400 text-sm max-w-xs">OKR data is available to CFO and Managers only.</p>
            </div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-medium hover:bg-[#1e40af] transition-colors">
                <ArrowLeft size={16} /> Go Back
            </button>
        </div>
    );

    /* ── Loading ─────────────────────────────────────────────────────────────── */
    if (loading && !selectedOKR && objectivesList.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#f8fafc] gap-4">
            <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-300 animate-pulse" />
                </div>
            </div>
            <p className="text-slate-500 font-bold capitalize tracking-widest text-xs">Syncing OKR Execution Data…</p>
        </div>
    );

    /* ═══════════════════════════════ RENDER ════════════════════════════════ */
    return (
        <div className="flex flex-col gap-4 bg-[#f1f5f9] min-h-screen p-4 sm:p-6 text-slate-800 font-sans">

            {/* ── HEADER ── */}
            <div className="bg-[#1e3a8a] text-white py-3 px-6 rounded-xl flex justify-between items-center shadow-lg border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                        <ShieldCheck className="text-blue-200" size={22} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white select-none">FJ Group — OKR Execution Dashboard</h1>
                </div>
                <div className="hidden lg:flex items-center gap-3 text-xs font-bold text-white/70 capitalize tracking-tight">
                    <Calendar size={14} />
                    <span>Real-Time Strategic Insights</span>
                </div>
            </div>

            {/* ── TOP KPI CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                {topMetrics.map((m, i) => (
                    <KpiCard key={i} label={m.label} value={m.value} sub={m.sub} gradient={m.gradient} Icon={m.Icon} />
                ))}
            </div>

            {/* ── FILTER BAR ── */}
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-[11px] uppercase tracking-tight">Filter:</span>
                    <div className="relative">
                        <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                            className="appearance-none bg-slate-50 border-2 border-slate-100 rounded-lg pl-8 pr-9 py-2 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none cursor-pointer min-w-[220px]"
                            value={filters.currentOkrId}
                            onChange={e => setFilters(prev => ({ ...prev, currentOkrId: e.target.value }))}
                        >
                            <option value="">Select Parent Task</option>
                            {objectivesList.map(obj => (
                                <option key={obj.parent_task_id} value={obj.parent_task_id}>
                                    {obj.objective_title}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">From:</label>
                    <input type="date" className="bg-slate-50 border-2 border-slate-100 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none"
                        value={tempFrom} onChange={e => setTempFrom(e.target.value)} />
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-tight">To:</label>
                    <input type="date" className="bg-slate-50 border-2 border-slate-100 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none"
                        value={tempTo} onChange={e => setTempTo(e.target.value)} />
                    <button onClick={handleApply}
                        className="bg-[#1e40af] text-white px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest shadow hover:bg-blue-800 active:scale-95 transition-all">
                        Apply
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {loading && <Loader2 size={16} className="text-blue-500 animate-spin" />}
                    <button onClick={() => navigate('/okr-dashboard')}
                        className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">
                        <ArrowLeft size={14} /> Full Reports
                    </button>
                </div>
            </div>

            {/* ── MAIN: Objective progress + subtask table ── */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="bg-[#f8fafc] px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Layers size={18} className="text-blue-600" />
                            Sub Objectives Tracking:{' '}
                            <span className="text-blue-700">
                                {selectedOKR?.parent_task_title || selectedOKR?.objective_title || (filters.currentOkrId ? 'Loading…' : 'Select an Objective')}
                            </span>
                        </h2>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{subtasks.length} subtasks</span>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px]">
                    {/* ── LEFT: Subtask Table ── */}
                    <div className="border-r border-slate-100">
                        <table className="w-full text-left">
                            <thead className="bg-[#f1f5f9] text-[10px] font-black text-slate-500 uppercase tracking-tight border-b border-slate-200">
                                <tr>
                                    <th className="py-2 px-2 pl-3">Task ID</th>
                                    <th className="py-2 px-2">Sub Objective</th>
                                    <th className="py-2 px-2">Level</th>
                                    <th className="py-2 px-2">Parent Task</th>
                                    <th className="py-2 px-2">Assigned To</th>
                                    <th className="py-2 px-2 text-center">Status</th>
                                    <th className="py-2 px-2">Due Date</th>
                                    <th className="py-2 px-2 text-right pr-3">Days Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSubtasks.map((st, i) => {
                                    const isEmployee = st.task_level === 2 || st.task_type === 'EMPLOYEE_TASK';
                                    const isLastRow  = i === sortedSubtasks.length - 1;
                                    
                                    // Check if next task is also an employee task for vertical line continuation
                                    const nextIsEmployee = !isLastRow && (sortedSubtasks[i+1].task_level === 2 || sortedSubtasks[i+1].task_type === 'EMPLOYEE_TASK');
                                    
                                    const parentLabel = st.parent_task_title || st.root_parent_task_title || '—';
                                    const dlText = st.days_left_text || '—';
                                    const dlCls  = dlText.includes('late') ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                 : dlText === 'Today'      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                                 : dlText === 'Done'       ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                 : 'bg-green-50 text-green-700 border border-green-200';
                                    
                                    return (
                                        <tr key={st.task_id ?? i} className="hover:bg-blue-50/10 transition-colors text-[11px] border-b border-slate-100">
                                            {/* Task ID with hierarchical dot indicator */}
                                            <td className="py-3 px-2 pl-4 whitespace-nowrap">
                                                <div className="flex items-center" style={{ paddingLeft: isEmployee ? '24px' : '0' }}>
                                                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                                                        <span className={`w-2 h-2 rounded-full shrink-0 z-10 ${isEmployee ? 'bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.1)]' : 'bg-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.1)]'}`} />
                                                        
                                                        {/* Vertical connector */}
                                                        {(!isLastRow && (isEmployee ? nextIsEmployee : true)) && (
                                                            <div 
                                                                className="absolute top-3 w-px bg-slate-200" 
                                                                style={{ 
                                                                    height: '42px', 
                                                                    left: '50%', 
                                                                    transform: 'translateX(-50%)' 
                                                                }} 
                                                            />
                                                        )}
                                                        
                                                        {/* Horizontal connector for child tasks */}
                                                        {isEmployee && (
                                                            <div className="absolute left-[-12px] top-[10px] w-[12px] h-px bg-slate-200" />
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-slate-500 text-[11px] ml-2">T-{st.task_id}</span>
                                                </div>
                                            </td>

                                            {/* Sub Objective */}
                                            <td className="py-3 px-2 font-semibold text-slate-800" style={{ paddingLeft: isEmployee ? '12px' : '0px' }} title={st.subtask_title}>
                                                <span className="leading-snug">{st.subtask_title}</span>
                                            </td>

                                            {/* Level badge */}
                                            <td className="py-3 px-2">
                                                {isEmployee ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                                        EMPLOYEE TASK
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                                                        MANAGER TASK
                                                    </span>
                                                )}
                                            </td>

                                            {/* Parent Task */}
                                            <td className="py-3 px-2 text-slate-600 text-[11px] font-medium leading-snug">
                                                {parentLabel}
                                            </td>

                                            {/* Assigned To */}
                                            <td className="py-3 px-2 font-semibold text-slate-700 leading-snug">{st.assigned_to_name}</td>

                                            {/* Status */}
                                            <td className="py-3 px-2 text-center"><StatusBadge status={st.status} /></td>

                                            {/* Due Date */}
                                            <td className="py-3 px-2 text-slate-500">{st.due_date}</td>

                                            {/* Days Left — colored pill */}
                                            <td className="py-3 px-2 pr-3 text-right">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black whitespace-nowrap ${dlCls}`}>
                                                    {dlText}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {subtasks.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Layers size={32} className="text-slate-300" />
                                                <p className="text-slate-400 font-bold italic uppercase tracking-widest text-[11px]">
                                                    {filters.currentOkrId ? 'No subtask data found for this objective.' : 'Select an objective from the dropdown above.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {subtasks.length === 0 && loading && (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <Loader2 size={22} className="text-blue-400 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── RIGHT: Department Distribution ── */}
                    <div className="bg-white border-l border-slate-100 flex items-start justify-center p-4">
                        {(() => {
                            const mainDept = deptStats[0]?.department_name || "Accounts Payables";
                            const deptTotal = deptStats[0]?.total_subtasks || 0;
                            const overallTotal = Math.max(subtasks.length, 1);
                            const distributionPct = Math.round((deptTotal / overallTotal) * 100);

                            const formattedDeptDist = deptStats.map((d, i) => {
                                const pct = Math.round((d.total_subtasks / overallTotal) * 100);
                                return {
                                    name: d.department_name || '—',
                                    value: pct,
                                    fill: CHART_COLORS[i % CHART_COLORS.length]
                                };
                            });

                            return (
                                <DepartmentDistributionCard 
                                    departmentData={formattedDeptDist}
                                    departmentName={mainDept}
                                    totalSubtasks={selectedOKR?.total_subtasks ?? subtasks.length}
                                    completedSubtasks={selectedOKR?.completed_subtasks ?? 0}
                                    submittedSubtasks={Math.max(cleanNum(selectedOKR?.submitted_subtasks), subtasks.filter(s => isDone(s) || isActive(s)).length)}
                                    daysLeft={selectedOKR?.days_left ?? 0}
                                    subDepts={deptStats.length || 1}
                                    completionPct={distributionPct} 
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* ── DEPARTMENT CONTRIBUTION TABLE ── */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-8">
                <div className="bg-[#f8fafc] px-6 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-black text-slate-700 capitalize tracking-tight">Department Contribution</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#1e3a8a]/5 text-[#1e3a8a] text-[12px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="py-4 px-6">Department Focus</th>
                                <th className="py-4 px-4 text-center">Total Tasks</th>
                                <th className="py-4 px-4 text-center">Manager Tasks</th>
                                <th className="py-4 px-4 text-center">Employee Tasks</th>
                                <th className="py-4 px-4 text-center">Approved</th>
                                <th className="py-4 px-4 text-center">Pending</th>
                                <th className="py-4 px-6 text-right">Contribution (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deptStats.map((d, i) => {
                                const totalAll = Math.max(selectedOKR?.total_subtasks || 1, subtasks.length, 1);
                                const pct = ((d.total_subtasks / totalAll) * 100).toFixed(1);
                                const dName   = d.department_name || '—';
                                const related = subtasks.filter(st => (st.department_name || '—') === dName);
                                const countSt = (statuses) => related.filter(st => statuses.includes(normStatus(st.status))).length;
                                const mgrCount = related.filter(st => st.task_level !== 2 && st.task_type !== 'EMPLOYEE_TASK').length;
                                const empCount = related.filter(st => st.task_level === 2 || st.task_type === 'EMPLOYEE_TASK').length;

                                return (
                                    <tr key={i} className="hover:bg-slate-50 font-bold text-slate-700 group transition-colors">
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            <div className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: deptDistribution[i]?.fill || '#94a3b8' }} />
                                            <span className="text-[14px] font-black text-[#1E1B4B] uppercase tracking-tight">{dName}</span>
                                        </td>
                                        <td className="py-4 px-4 text-center tabular-nums text-[15px] text-blue-900 font-black">{d.total_subtasks}</td>
                                        <td className="py-4 px-4 text-center tabular-nums text-[13px] text-violet-700 font-semibold">{mgrCount}</td>
                                        <td className="py-4 px-4 text-center tabular-nums text-[13px] text-emerald-600 font-semibold">{empCount}</td>
                                        <td className="py-4 px-4 text-center tabular-nums text-[13px] text-emerald-600">{countSt(['APPROVED', 'COMPLETED', 'DONE'])}</td>
                                        <td className="py-4 px-4 text-center tabular-nums text-[13px] text-amber-600">{countSt(['PENDING', 'NEW', 'SUBMITTED', 'REVIEW', 'REWORK', 'CHANGES_REQUESTED'])}</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: deptDistribution[i]?.fill || '#94a3b8' }} />
                                                </div>
                                                <span className="text-[13px] font-black text-slate-800 tabular-nums w-12 text-right">{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {deptStats.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-300 font-bold uppercase tracking-widest italic text-[11px]">
                                        No departmental breakdown available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer summary bar */}
                <div className="bg-[#f8fafc] p-4 border-t border-slate-200 flex justify-between items-center px-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-xl border border-violet-200 shadow-sm">
                            <Layers size={14} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Hierarchy Enabled</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
                            <TrendingUp size={14} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Aggregate Progress {selectedOKR?.progress_pct ?? 0}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Full Descendant Tree</span>
                        <div className="bg-[#1E1B4B] text-white px-6 py-2 rounded-xl font-black text-lg tabular-nums shadow-lg shadow-indigo-900/40">
                            {selectedOKR?.total_subtasks ?? subtasks.length} tasks
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OKRSubTaskPage;
