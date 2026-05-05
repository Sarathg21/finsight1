import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { calculateManagerScore } from '../../utils/performanceEngine';
import Badge from '../UI/Badge';
import {
    BarChart2, CheckSquare, AlertTriangle, Clock,
    Calendar, Users, TrendingUp, Medal, CalendarCheck, CheckCircle, Loader2,
    ChevronRight, User, Target, AlertCircle, Briefcase, Activity,
    ListChecks, Eye, XCircle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

const TERMINAL_STATUSES = new Set(['APPROVED', 'CANCELLED']);

const toDateKey = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

const fetchManagerTasksFallback = async (params = {}) => {
    const baseURL = api.defaults.baseURL || '';
    const token = localStorage.getItem('pms_token');
    
    // Convert params to query string
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';

    // If scope is already in params, we might need to handle it differently, 
    // but typically we can just append our params to these candidates.
    const candidates = [
        `tasks?scope=org${query ? `&${query}` : ''}`,
        `tasks${queryString}`,
        `tasks?scope=department${query ? `&${query}` : ''}`,
        `tasks?scope=mine${query ? `&${query}` : ''}`
    ];
    for (const path of candidates) {
        try {
            const url = baseURL.endsWith('/') ? `${baseURL}${path}` : `${baseURL}/${path}`;
            const res = await fetch(url, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            if (res.status === 422 || res.status === 404 || res.status === 405) continue;
            if (!res.ok) continue;
            const data = await res.json();
            const rows = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
            if (rows.length > 0) return rows;
        } catch (_) {
            // try next
        }
    }
    return [];
};

const STATUS_LABEL = {
    NEW: 'Not started',
    IN_PROGRESS: 'In Progress',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REWORK: 'Rework',
    CANCELLED: 'Cancelled',
};


/* Small stat tile — CFO-style large gradient card */
const Stat = ({ label, value, sub, icon: Icon, color = 'violet' }) => {
    const c = {
        violet: { 
            bg: 'bg-gradient-to-br from-[#7B51ED] via-[#8B64F1] to-[#6D43E0]', 
            shadow: 'shadow-[0_8px_30px_rgb(123,81,237,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-violet-400/30' 
        },
        green: { 
            bg: 'bg-gradient-to-br from-[#10B981] via-[#34D399] to-[#059669]', 
            shadow: 'shadow-[0_8px_30px_rgb(16,185,129,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-emerald-400/30' 
        },
        blue: { 
            bg: 'bg-gradient-to-br from-[#4285F4] via-[#60A5FA] to-[#2563EB]', 
            shadow: 'shadow-[0_8px_30px_rgb(66,133,244,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-blue-400/30' 
        },
        amber: { 
            bg: 'bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#D97706]', 
            shadow: 'shadow-[0_8px_30px_rgb(245,158,11,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-amber-400/30' 
        },
        orange: { 
            bg: 'bg-gradient-to-br from-[#F97316] via-[#FB923C] to-[#EA580C]', 
            shadow: 'shadow-[0_8px_30px_rgb(249,115,22,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-orange-400/30' 
        },
        rose: { 
            bg: 'bg-gradient-to-br from-[#F43F5E] via-[#FB7185] to-[#E11D48]', 
            shadow: 'shadow-[0_8px_30px_rgb(244,63,94,0.3)]', 
            icon: 'bg-white/20', 
            accent: 'bg-rose-400/30' 
        },
    }[color] || { 
        bg: 'bg-gradient-to-br from-violet-500 to-indigo-600', 
        shadow: 'shadow-[0_8px_30px_rgb(124,58,237,0.3)]', 
        icon: 'bg-white/20', 
        accent: 'bg-violet-400/30' 
    };

    return (
        <div className={`group animate-fade-in-up relative overflow-hidden rounded-[1.75rem] ${c.bg} ${c.shadow} p-6 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border border-white/10 h-full`}>
            {/* Background Ornaments */}
            <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full ${c.accent} blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700`} />
            <div className={`absolute -bottom-10 -left-10 w-28 h-28 rounded-full ${c.accent} blur-2xl opacity-30 group-hover:scale-125 transition-transform duration-700 delay-100`} />
            
            {/* Glass Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-white/70 capitalize tracking-[0.1em] drop-shadow-sm">
                            {label}
                        </span>
                    </div>
                    <div className="text-4xl font-extrabold text-white tabular-nums tracking-tighter leading-none drop-shadow-md mb-2">
                        {value ?? '0'}
                    </div>
                    {sub && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-bold backdrop-blur-md border border-white/10">
                             {sub}
                        </div>
                    )}
                </div>
                
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${c.icon} backdrop-blur-md flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-white/25 shadow-lg`}>
                    <Icon size={26} className="text-white drop-shadow-md" strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
};

/* ── InfoTooltip — fixed-position to escape any overflow container ──
   align="center" (default) — tooltip centred on badge
   align="left"             — tooltip opens leftward (right edge anchors to badge)
──────────────────────────────────────────────────────── */
const InfoTooltip = ({ content, align = 'center' }) => {
    const [show, setShow] = useState(false);
    const [pos, setPos]   = useState({ top: 0, left: 0 });
    return (
        <>
            <span
                onMouseEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    // For left-opening tooltip anchor to the right edge of badge,
                    // for center anchor to badge midpoint
                    setPos({
                        top:  r.top,
                        left: align === 'left' ? r.right : r.left + r.width / 2,
                    });
                    setShow(true);
                }}
                onMouseLeave={() => setShow(false)}
                className="w-3.5 h-3.5 rounded-full bg-slate-400 hover:bg-violet-500 transition-colors text-white text-[8px] font-black inline-flex items-center justify-center leading-none cursor-help ml-1 shrink-0"
            >?</span>
            {show && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top:  pos.top,
                        left: pos.left,
                        transform: align === 'left'
                            ? 'translate(-100%, calc(-100% - 10px))'
                            : 'translate(-50%, calc(-100% - 10px))',
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
};

const ManagerDashboard = ({ overriddenDept = null }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Determine current user state
    const isActuallyCFO = user?.role?.toUpperCase() === 'CFO';
    // Determine current department for context (locked to manager's own department)
    const currentDeptId = overriddenDept?.department_id || overriddenDept?.id || overriddenDept?.dept_id || user?.department || user?.department_id || user?.dept_id;
    const currentDeptName = overriddenDept?.department_name || overriddenDept?.name || user?.department_name || user?.department || 'Department';

    const getFirstDayOfMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    };

    const getToday = () => {
        return new Date().toISOString().slice(0, 10);
    };

    /* ── Date range filter state ─── */
    const [fromDate, setFromDate] = useState(() => {
        const saved = localStorage.getItem('dashboard_from_date');
        return (saved && saved.length === 10) ? saved : getFirstDayOfMonth();
    });
    const [toDate, setToDate] = useState(() => {
        const saved = localStorage.getItem('dashboard_to_date');
        return (saved && saved.length === 10) ? saved : getToday();
    });

    // Persist initial dates to localStorage so TaskPage reads the same range on first load
    useEffect(() => {
        if (!localStorage.getItem('dashboard_from_date')) {
            localStorage.setItem('dashboard_from_date', fromDate);
        }
        if (!localStorage.getItem('dashboard_to_date')) {
            localStorage.setItem('dashboard_to_date', toDate);
        }
    }, []);

    useEffect(() => {
        const handleFilterChange = () => {
            setFromDate(localStorage.getItem('dashboard_from_date') || getFirstDayOfMonth());
            setToDate(localStorage.getItem('dashboard_to_date') || getToday());
        };
        window.addEventListener('dashboard-filter-change', handleFilterChange);
        return () => window.removeEventListener('dashboard-filter-change', handleFilterChange);
    }, []);

    const [dashboardData, setDashboardData] = useState(null);
    const [todayTeamTasks, setTodayTeamTasks] = useState([]);
    const [reportTeam, setReportTeam] = useState([]);
    const [trends, setTrends] = useState([]);
    const [employeeRisk, setEmployeeRisk] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Independent date filters for sub-sections ────────────────────────────
    const [teamPerfFrom, setTeamPerfFrom] = useState(getFirstDayOfMonth());
    const [teamPerfTo, setTeamPerfTo] = useState(getToday());
    const [teamPerfLoading, setTeamPerfLoading] = useState(false);

    const [riskFrom, setRiskFrom] = useState(getFirstDayOfMonth());
    const [riskTo, setRiskTo] = useState(getToday());
    const [riskLoading, setRiskLoading] = useState(false);
    const [liveTasks, setLiveTasks] = useState([]);
    const [bifurcationTasks, setBifurcationTasks] = useState([]);
    const [riskShowAll, setRiskShowAll] = useState(false);

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            if (diffInSeconds < 60) return `${Math.max(0, diffInSeconds)}s ago`;
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours}h ago`;
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        } catch (e) { return 'Recent'; }
    };

    const fetchDashboardData = async () => {
        // ── Safe Parameter Normalization ────────────────────────────────────────
        // Prevents 422 Unprocessable Entity by ensuring dates are valid ISO strings (YYYY-MM-DD)
        const safeFrom = fromDate && fromDate.length === 10 ? fromDate : getFirstDayOfMonth();
        const safeTo   = toDate && toDate.length === 10 ? toDate : getToday();

        setLoading(true);
        const params = {
            from_date:  safeFrom,
            to_date:    safeTo,
            start_date: safeFrom,
            end_date:   safeTo
        };
        
        // Apply department override if provided
        if (currentDeptId && currentDeptId !== 'all') {
            params.department_id = currentDeptId;
        }

        try {
            console.log("ManagerDashboard - Fetching stats for dept:", currentDeptId);
            
            const results = await Promise.allSettled([
                api.get('/dashboard/manager', { params }),
                api.get('/dashboard/manager/trends', { params: { ...params, days: 30 } }),
                api.get('/dashboard/manager/employee-risk', { params }),
                api.get('/dashboard/manager/team-performance', { params }),
                api.get('/dashboard/manager/analytics', { params }),
                api.get('/tasks/team', { params: { limit: 100, page: 1 } })
            ]);

            const [
                dashRes, 
                trendsRes, 
                riskRes, 
                teamPerfRes,
                analyticsRes,
                tasksRes
            ] = results;

            let finalPayload = {};

            if (dashRes.status === 'fulfilled') {
                finalPayload = { ...finalPayload, ...(dashRes.value.data?.data || dashRes.value.data || {}) };
            }

            if (analyticsRes?.status === 'fulfilled') {
                const analyticsPayload = analyticsRes.value.data?.data || analyticsRes.value.data || {};
                finalPayload = { ...finalPayload, ...analyticsPayload };
            }

            setDashboardData(finalPayload);

            if (trendsRes.status === 'fulfilled') {
                setTrends(trendsRes.value.data?.data || trendsRes.value.data || []);
            }

            if (riskRes.status === 'fulfilled') {
                setEmployeeRisk(riskRes.value.data?.data || riskRes.value.data || []);
            }

            if (teamPerfRes.status === 'fulfilled') {
                const perfData = teamPerfRes.value.data?.data || teamPerfRes.value.data || [];
                if (perfData.length > 0) setReportTeam(perfData);
            }

            if (tasksRes.status === 'fulfilled') {
                // Read the raw envelope BEFORE narrowing to the data array,
                // so we can still read `total` for pagination.
                const envelope = tasksRes.value.data || {};
                // Support: { data:[...], total:N } OR flat array response
                const firstPage = Array.isArray(envelope)
                    ? envelope
                    : Array.isArray(envelope.data)
                        ? envelope.data
                        : (envelope.items || []);
                // Pull total from envelope (works for both nested and flat shapes)
                const totalCount = (!Array.isArray(envelope) && envelope.total)
                    ? envelope.total
                    : firstPage.length;

                if (totalCount > firstPage.length) {
                    // Paginate to collect ALL team tasks — mirrors TeamTasksPage behaviour
                    const allItems = [...firstPage];
                    const totalPages = Math.ceil(totalCount / 100);
                    const pagePromises = [];
                    for (let p = 2; p <= Math.min(totalPages, 20); p++) {
                        pagePromises.push(
                            api.get('/tasks/team', { params: { limit: 100, page: p } })
                               .then(r => {
                                   const env = r.data || {};
                                   return Array.isArray(env)
                                       ? env
                                       : Array.isArray(env.data)
                                           ? env.data
                                           : (env.items || []);
                               })
                               .catch(() => [])
                        );
                    }
                    const extra = await Promise.all(pagePromises);
                    extra.forEach(batch => allItems.push(...batch));
                    setLiveTasks(allItems);
                } else {
                    setLiveTasks(firstPage);
                }
            }

        } catch (err) {
            console.error("Critical fail in manager dashboard:", err);
            setDashboardData({});
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch only Team Performance data with its own date range ────────────
    const fetchTeamPerformance = async (from, to) => {
        if (from && to && to < from) {
            console.warn('[ManagerDashboard] teamPerfTo is before teamPerfFrom — skipping fetch');
            return;
        }
        setTeamPerfLoading(true);
        try {
            const params = {};
            if (from) { params.from_date = from; params.start_date = from; }
            if (to)   { params.to_date   = to;   params.end_date   = to;   }
            if (currentDeptId && currentDeptId !== 'all') params.department_id = currentDeptId;

            const res = await api.get('/dashboard/manager/team-performance', { params });
            const data = res.data?.data || res.data || [];
            if (Array.isArray(data) && data.length > 0) setReportTeam(data);
        } catch (err) {
            console.warn('team-performance fetch failed:', err);
        } finally {
            setTeamPerfLoading(false);
        }
    };

    // ── Fetch only Employee Risk data with its own date range ─────────────────
    const fetchEmployeeRisk = async (from, to) => {
        if (from && to && to < from) {
            console.warn('[ManagerDashboard] riskTo is before riskFrom — skipping fetch');
            return;
        }
        setRiskLoading(true);
        try {
            const params = {};
            if (from) { params.from_date = from; params.start_date = from; }
            if (to)   { params.to_date   = to;   params.end_date   = to;   }
            if (currentDeptId && currentDeptId !== 'all') params.department_id = currentDeptId;

            const res = await api.get('/dashboard/manager/employee-risk', { params });
            const data = res.data?.data || res.data || [];
            if (Array.isArray(data)) setEmployeeRisk(data);
        } catch (err) {
            console.warn('employee-risk fetch failed:', err);
        } finally {
            setRiskLoading(false);
        }
    };


    // ── Fetch ALL team tasks using the same sequential-page pattern as TeamTasksPage
    //    This is the source of truth for the Bifurcation chart, guaranteeing the
    //    total matches the "X Live" count on the Team Tasks page.
    const fetchBifurcationTasks = async () => {
        try {
            let allItems = [];
            let currentPage = 1;
            const PAGE_LIMIT = 100;
            const SAFETY_CAP = 2000;

            while (allItems.length < SAFETY_CAP) {
                const res = await api.get('/tasks/team', {
                    params: { limit: PAGE_LIMIT, page: currentPage }
                });
                const raw = res.data?.data || res.data || {};
                const batch = Array.isArray(raw) ? raw : (raw.items || raw.data || []);
                if (batch.length === 0) break;
                allItems = [...allItems, ...batch];
                if (batch.length < PAGE_LIMIT) break; // last page reached
                currentPage++;
            }

            // Mirror TeamTasksPage: also fetch department-scoped tasks to catch
            // CFO-assigned tasks that /tasks/team may not return for this manager.
            try {
                const deptRes = await api.get('/tasks', {
                    params: { scope: 'department', limit: 200 }
                });
                const deptRaw = deptRes.data?.data || deptRes.data || {};
                const deptItems = Array.isArray(deptRaw) ? deptRaw : (deptRaw.items || deptRaw.data || []);

                // Deduplicate by task ID
                const merged = [...allItems, ...deptItems];
                const uniqueMap = new Map();
                merged.forEach(t => {
                    const id = t.task_id || t.id;
                    if (id && !uniqueMap.has(id)) uniqueMap.set(id, t);
                });
                allItems = Array.from(uniqueMap.values());
            } catch (e) {
                console.warn('[ManagerDashboard] Department fallback fetch failed:', e);
            }

            // Mirror TeamTasksPage exactly: exclude manager's own standalone tasks
            const metricParentIds = new Set(
                allItems.filter(t => t.parent_task_id).map(t => String(t.parent_task_id))
            );
            
            const filteredItems = allItems.filter(t => {
                const assigneeEmpId = t.assigned_to_emp_id || t.employee_id || t.assigned_to_id;
                const isSelf = assigneeEmpId && String(assigneeEmpId) === String(user?.id);
                
                if (user?.role?.toUpperCase() === 'MANAGER' && isSelf) {
                    const taskId = String(t.task_id || t.id);
                    const isParentTask =
                        t.task_type === 'PARENT' ||
                        t.has_subtasks === true ||
                        t.is_parent === true ||
                        (t.subtask_count || 0) > 0 ||
                        metricParentIds.has(taskId);
                    
                    if (!isParentTask) return false; // Exclude standalone self-tasks
                }
                return true;
            });

            setBifurcationTasks(filteredItems);
        } catch (err) {
            console.warn('[ManagerDashboard] bifurcation fetch failed:', err);
        }
    };


    useEffect(() => {
        if (user?.id) {
            fetchBifurcationTasks();
        }
    }, [user?.id, currentDeptId]);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id, fromDate, toDate, currentDeptId]);

    // Re-fetch team performance whenever its own dates change (after initial load)
    useEffect(() => {
        if (user?.id) fetchTeamPerformance(teamPerfFrom, teamPerfTo);
    }, [teamPerfFrom, teamPerfTo, currentDeptId]);

    // Re-fetch employee risk whenever its own dates change (after initial load)
    useEffect(() => {
        if (user?.id) fetchEmployeeRisk(riskFrom, riskTo);
    }, [riskFrom, riskTo, currentDeptId]);




    const metrics = useMemo(() => {
        if (!dashboardData) return null;
        
        // 1. Initial values from dashboardData
        let total = dashboardData.total_tasks || dashboardData.team_tasks || dashboardData.total || 0;
        let approved = dashboardData.approved_tasks || dashboardData.completed_tasks || dashboardData.approved || 0;
        let pending = dashboardData.pending_approval || dashboardData.submitted_tasks || dashboardData.pending_review || dashboardData.pending_submission || 0;
        let in_progress = dashboardData.in_progress_tasks || dashboardData.in_progress || 0;
        let not_started = dashboardData.new_tasks || dashboardData.not_started || 0;
        let reworks = dashboardData.rework_tasks || dashboardData.reworks || 0;
        let overdue = dashboardData.overdue_tasks || dashboardData.overdue || 0;

        // 2. Sync with liveTasks if available (Source of Truth)
        if (Array.isArray(liveTasks) && liveTasks.length > 0) {
            const today = new Date();
            
            // liveTasks contains ALL team tasks (no date filter).
            // Apply date range client-side so the KPI cards respect the dashboard date picker.
            const filteredTasks = liveTasks.filter(t => {
                const ds = t.date || t.created_at || t.assigned_date || t.assigned_at;
                if (!ds) return true; // no date info → include
                const d = toDateKey(ds);
                if (fromDate && d < fromDate) return false;
                if (toDate   && d > toDate)   return false;
                return true;
            });

            total = filteredTasks.length;
            approved = filteredTasks.filter(t => ['APPROVED', 'COMPLETED'].includes((t.status || '').toUpperCase())).length;
            pending = filteredTasks.filter(t => ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'].includes((t.status || '').toUpperCase())).length;
            in_progress = filteredTasks.filter(t => ['IN_PROGRESS'].includes((t.status || '').toUpperCase())).length;
            not_started = filteredTasks.filter(t => ['NEW', 'NOT_STARTED', 'CREATED'].includes((t.status || '').toUpperCase())).length;
            reworks = filteredTasks.filter(t => ['REWORK'].includes((t.status || '').toUpperCase())).length;
            overdue = filteredTasks.filter(t => {
                const s = (t.status || '').toUpperCase();
                const due = t.due_date ? new Date(t.due_date) : null;
                return due && due < today && !['APPROVED', 'COMPLETED', 'CANCELLED'].includes(s);
            }).length;
        }

        const activeCount = total - approved;

        return {
            total,
            approved,
            pending,
            inProgress: in_progress,
            notStarted: not_started,
            reworks,
            overdue,
            totalActive: activeCount,
            completionRate: total > 0 ? Math.round((approved / total) * 100) : 0,
            score: dashboardData.team_performance_index || dashboardData.performance_score || dashboardData.performanceScore || 0,
            
            // Backend-driven performance KPIs
            managerScore: dashboardData.manager_score_current ?? null,
            teamScore: dashboardData.team_score_current ?? null,
            managerPersonalScore: dashboardData.manager_personal_score_current ?? null,
            managerScoreDelta: dashboardData.manager_score_delta_percent ?? null,
        };
    }, [dashboardData, liveTasks, fromDate, toDate]);

    // Priority: use reportTeam (locally filtered) if available, otherwise fallback to global ranking
    const rankingSource = (() => {
        if (Array.isArray(reportTeam) && reportTeam.length > 0) return reportTeam;
        return dashboardData?.employee_ranking || [];
    })();

    const finalRankingData = useMemo(() => {
        const source = rankingSource;
        const riskMap = {};
        if (Array.isArray(employeeRisk)) {
            employeeRisk.forEach(r => {
                const id = String(r.emp_id || r.id || r.employee_id || '');
                if (id) riskMap[id] = r;
            });
        }

        return source.map((m, idx) => {
            const id = String(m.emp_id || m.id || m.employee_id || '');
            const riskItem = riskMap[id] || {};
            
            // Standardized name lookup - prioritize risk monitor's known good names
            const name = m.name || m.employee_name || m.emp_name || m.full_name || 
                        riskItem.name || riskItem.employee_name || 
                        (id ? `Emp #${id}` : 'Unknown');

            return {
                ...m,
                id,
                name,
                role: m.role || m.designation || riskItem.role || 'Team Member',
                // Standardized metric aliases with risk monitor fallbacks
                assigned: m.tasks_assigned || m.total_tasks || m.assigned || m.total || riskItem.total_tasks || 0,
                active:   m.active_tasks   || m.in_progress_tasks || m.active || m.in_progress || riskItem.active_tasks || riskItem.active || 0,
                pending:  m.pending_review || m.submitted_tasks || m.pending_tasks || m.pending || 0,
                overdue:  m.overdue_tasks  || m.overdue_count  || m.overdue || riskItem.overdue_tasks || riskItem.overdue || 0,
                completed:m.approved_tasks || m.completed_tasks || m.completed || ( (m.assigned || m.total_tasks || 0) - (m.active || m.active_tasks || 0) ) || 0,
                performance_score: m.score ?? m.performance_score ?? riskItem.performance_score ?? riskItem.execution_score ?? null,
                rank: m.rank ?? idx + 1
            };
        // Sort ascending by employee ID (numeric if possible)
        }).sort((a, b) => {
            const idA = isNaN(Number(a.id)) ? a.id : Number(a.id);
            const idB = isNaN(Number(b.id)) ? b.id : Number(b.id);
            if (idA < idB) return -1;
            if (idA > idB) return 1;
            return 0;
        });
    }, [rankingSource, employeeRisk]);

    // graphs.task_activity_trends — primary source for the trends bar chart
    const trendsGraphSource = dashboardData?.graphs?.task_activity_trends;

    // ── Task Trends Data Normalization ─────────────────────────────────────────
    const finalTrendsData = useMemo(() => {
        const source = (Array.isArray(trendsGraphSource) && trendsGraphSource.length > 0) ? trendsGraphSource : (Array.isArray(trends) ? trends : []);
        
        // 1. Build full month skeleton from fromDate → toDate
        const generateMonthRange = (from, to) => {
            const startStr = toDateKey(from);
            const endStr   = toDateKey(to);
            if (!startStr || !endStr) return [];

            const months = [];
            const start = new Date(startStr + 'T00:00:00'); start.setDate(1);
            const end   = new Date(endStr   + 'T00:00:00'); end.setDate(1);
            const cur = new Date(start);
            while (cur <= end) {
                const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
                months.push({ key, label: cur.toLocaleString('en-US', { month: 'short' }) });
                cur.setMonth(cur.getMonth() + 1);
            }
            return months;
        };

        const mRange = generateMonthRange(fromDate, toDate);

        // 2. Normalize any key → YYYY-MM
        const MONTH_SHORTS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const MONTH_FULLS  = ['january','february','march','april','may','june','july','august','september','october','november','december'];
        
        const toYMKey = (raw) => {
            if (!raw) return null;
            const s = String(raw).trim();
            
            // 1. Flexible Date Match: YYYY-MM-DD, YY-MM-DD, DD-MM-YYYY, etc.
            const dateMatch = s.match(/^(\d{2,4})[-/](\d{1,2})[-/](\d{1,2})/);
            if (dateMatch) {
                let y = dateMatch[1], m = dateMatch[2];
                // If the first part is 2 digits and appears to be a year (e.g. 25, 26)
                if (y.length === 2 && parseInt(y) >= 20) y = '20' + y;
                // If the first part is clearly a day (e.g. 01-12-2026), look at the last part
                if (y.length === 2 && parseInt(y) <= 31 && s.length >= 8) {
                    const lastPart = s.match(/(\d{4})$/);
                    if (lastPart) { y = lastPart[1]; m = dateMatch[2]; }
                }
                if (y.length === 4) return `${y}-${m.padStart(2, '0')}`;
            }

            if (/^\d{4}-\d{2}$/.test(s)) return s;
            
            const sLower = s.toLowerCase();
            let mIdx = -1;
            for (let i = 0; i < MONTH_FULLS.length; i++) {
                if (sLower.includes(MONTH_FULLS[i]) || sLower.startsWith(MONTH_SHORTS[i].toLowerCase())) { mIdx = i; break; }
            }
            const yrMatch = s.match(/\b(20\d{2})\b/);
            const yr = yrMatch ? yrMatch[1] : null;
            if (mIdx >= 0 && yr) return `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
            if (mIdx >= 0) { const f = mRange.find(m => m.label === MONTH_SHORTS[mIdx]); if (f) return f.key; }
            
            try { 
                const p = new Date(s); 
                if (!isNaN(p.getTime())) {
                    let y = p.getFullYear();
                    // Fix for 2-digit years interpreted as 19XX or XX
                    if (y < 100) y += 2000;
                    return `${y}-${String(p.getMonth()+1).padStart(2,'0')}`; 
                }
            } catch (_) {}
            return null;
        };

        const backendMap = {};
        source.forEach(t => {
            const k = toYMKey(t.period || t.name || t.week || t.month || '');
            if (!k) return;
            if (!backendMap[k]) backendMap[k] = { new: 0, pending: 0, overdue: 0, completed: 0 };
            backendMap[k].new       += t.new_tasks ?? t.new ?? t.not_started ?? 0;
            backendMap[k].pending   += t.pending_approval ?? t.pending ?? t.submitted ?? t.submitted_tasks ?? t.pending_tasks ?? 0;
            backendMap[k].overdue   += t.overdue_tasks ?? t.overdue ?? 0;
            backendMap[k].completed += t.completed_tasks ?? t.completed ?? t.approved ?? t.approved_tasks ?? t.completed_count ?? 0;
        });

        // 3. Supplemental Sync from liveTasks (The Ultimate Source of Truth)
        if (Array.isArray(liveTasks) && liveTasks.length > 0) {
            liveTasks.forEach(t => {
                const dateStr = t.date || t.created_at || t.assigned_date || t.assigned_at;
                const k = toYMKey(dateStr);
                if (!k || !backendMap[k]) return;
                const s = String(t.status || '').toUpperCase();
                if (['APPROVED', 'COMPLETED'].includes(s)) {
                    // We only "add" if it's missing or lower than reality
                    // But to avoid double counting from trends API, we use a simple set/max strategy per month 
                    // if the trends API was reporting 0
                }
            });
            
            // Refined strategy: If any month in backendMap has 0 completed but liveTasks has many, fix it
            Object.keys(backendMap).forEach(k => {
                const liveMonthCount = liveTasks.filter(t => {
                    const ds = t.date || t.created_at || t.assigned_date || t.assigned_at;
                    if (!ds) return false;
                    const ym = toYMKey(ds);
                    if (ym !== k) return false;
                    
                    // Also ensure it's within the global fromDate/toDate range for accuracy
                    const d = toDateKey(ds);
                    if (fromDate && d < fromDate) return false;
                    if (toDate && d > toDate) return false;
                    
                    return ['APPROVED', 'COMPLETED'].includes(String(t.status || '').toUpperCase());
                }).length;
                backendMap[k].completed = Math.max(backendMap[k].completed, liveMonthCount);
            });
        }

        if (mRange.length > 0) {
            return mRange.map(({ key, label }) => {
                const b = backendMap[key] || { new: 0, pending: 0, overdue: 0, completed: 0 };
                
                // If the user has selected exactly this month range, synchronize with summary metrics
                // This acts as a 'Source of Truth' fallback if the trends API is incomplete.
                let finalNew = b.new;
                let finalPending = b.pending;
                let finalOverdue = b.overdue;
                let finalCompleted = b.completed;

                if (mRange.length === 1 && metrics) {
                    // Use correct field names from the new metrics object
                    finalNew       = Math.max(0, finalNew,       (metrics.totalActive || 0) - (metrics.pending || 0)); 
                    finalPending   = Math.max(0, finalPending,   metrics.pending || 0);
                    finalCompleted = Math.max(0, finalCompleted, metrics.approved || 0);
                    finalOverdue   = Math.max(0, finalOverdue,   metrics.overdue || 0);
                }

                return {
                    name:      label,
                    new:       finalNew,
                    pending:   finalPending,
                    overdue:   finalOverdue,
                    completed: finalCompleted,
                };
            });
        }

        return Object.keys(backendMap).sort().map(k => ({
            name:      k,
            ...backendMap[k]
        }));
    }, [trendsGraphSource, trends, fromDate, toDate, metrics, dashboardData, liveTasks]);


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium text-lg">Loading {currentDeptName} dashboard...</p>
            </div>
        );
    }

    const stats = metrics || { score: 0, completionRate: 0, totalReworks: 0, pendingSubmission: 0, totalActive: 0, managerScore: null, teamScore: null, managerPersonalScore: null, managerScoreDelta: null };

    const rawStatusData = dashboardData ? [
        { name: 'Not started', value: dashboardData.new_tasks || 0, fill: '#3b82f6' },
        { name: 'In Progress', value: dashboardData.in_progress_tasks || 0, fill: '#8b5cf6' },
        { name: 'Submitted', value: dashboardData.submitted_tasks || 0, fill: '#f59e0b' },
        { name: 'Approved', value: dashboardData.approved_tasks || 0, fill: '#10b981' },
        { name: 'Rework', value: dashboardData.rework_tasks || 0, fill: '#ef4444' },
    ] : [];



    // graphs.workload_distribution_employee_wise — open_tasks per employee
    const workloadGraphSource = dashboardData?.graphs?.workload_distribution_employee_wise;
    // graphs.performance_index_employee_wise — score per employee
    const perfIndexSource = dashboardData?.graphs?.performance_index_employee_wise;
    const perfIndexMap = Array.isArray(perfIndexSource)
        ? Object.fromEntries(perfIndexSource.map(p => [String(p.emp_id || p.id || ''), p.score ?? null]))
        : {};

    const finalMemberData = Array.isArray(workloadGraphSource) && workloadGraphSource.length > 0
        ? workloadGraphSource.map(m => ({
            name: (m.name || m.employee_name || m.emp_name || String(m.emp_id || '')).split(' ')[0],
            // open_tasks is the correct backend field per handoff spec
            Assigned: m.open_tasks ?? m.tasks_assigned ?? m.assigned ?? m.total_tasks ?? 0,
            Completed: m.tasks_completed ?? m.completed ?? m.approved_tasks ?? 0,
            PerfScore: perfIndexMap[String(m.emp_id || m.id || '')] ?? null,
          }))
        : rankingSource.map(m => ({
            name: (m.name || m.employee_name || '').split(' ')[0] || String(m.emp_id),
            Assigned: m.tasks_assigned ?? m.assigned ?? m.total_tasks ?? 0,
            Completed: m.tasks_completed ?? m.completed ?? m.approved_tasks ?? 0,
            PerfScore: perfIndexMap[String(m.emp_id || m.id || '')] ?? null,
          }));

    // Helper: extract real error detail from a blob error response body
    const readBlobError = async (err) => {
        const errData = err?.response?.data;
        if (errData instanceof Blob && errData.size > 0) {
            try {
                const text = await errData.text();
                const j = JSON.parse(text);
                return Array.isArray(j.detail)
                    ? j.detail.map(d => d.msg).join(', ')
                    : (j.detail || j.message || text.slice(0, 200));
            } catch { /* not JSON */ }
        }
        return err?.message || 'Unknown error';
    };

    const handleExport = async (format) => {
        const tid = toast.loading(`Preparing ${format.toUpperCase()} export...`);
        try {
            const safeFrom = (fromDate && fromDate.length === 10) ? fromDate : getFirstDayOfMonth();
            const safeTo   = (toDate   && toDate.length   === 10) ? toDate   : getToday();
            const depId    = (!currentDeptId || currentDeptId === 'all' || currentDeptId === '' || currentDeptId === 'undefined') ? undefined : currentDeptId;

            let baseRole = 'manager';
            const r = (user?.role || '').toUpperCase();
            if (r.includes('CFO')) baseRole = 'cfo';
            else if (r.includes('ADMIN')) baseRole = 'admin';
            else if (r.includes('MANAGER')) baseRole = 'manager';
            else if (r.includes('EMPLOYEE')) baseRole = 'employee';

            const rolePath = baseRole;
            const depName = currentDeptName !== 'All Departments' ? currentDeptName : undefined;

            const candidates = [];
            
            // ALWAYS try the explicit manager endpoint first
            candidates.push({
                ep: format === 'pdf' ? '/reports/manager/export-pdf' : '/reports/manager/export-excel',
                params: { 
                    from_date: safeFrom, to_date: safeTo, 
                    start_date: safeFrom, end_date: safeTo,
                    ...(depId ? { 
                        department_id: depId, dept_id: depId, dep_id: depId,
                        scope: 'department', department: depName, dept_name: depName
                    } : { scope: 'org' })
                }
            });

            // Fallback: Use the user's standardized role path
            candidates.push({
                ep: format === 'pdf' ? `/reports/${rolePath}/export-pdf` : `/reports/${rolePath}/export-excel`,
                params: { 
                    from_date: safeFrom, to_date: safeTo,
                    start_date: safeFrom, end_date: safeTo,
                    ...(depId ? { 
                        department_id: depId, dept_id: depId, dep_id: depId, 
                        scope: 'department', department: depName, dept_name: depName 
                    } : { scope: 'org' })
                }
            });

            // Ensure unique endpoints
            const seen = new Set();
            const unique = candidates.filter(c => seen.has(c.ep) ? false : (seen.add(c.ep), true));

            let lastErrMsg = 'Export failed';
            let primaryStatus = null;

            for (const { ep, params } of unique) {
                try {
                    const res = await api.get(ep, { params, responseType: 'blob' });
                    const ext = format === 'excel' ? 'xlsx' : 'pdf';

                    // check if the response is actually JSON (masquerading as a blob)
                    if (res.data.type === 'application/json' || res.data.size < 600) {
                        const text = await res.data.text();
                        try {
                            const json = JSON.parse(text);
                            if (json.detail || json.message) {
                                const msg = Array.isArray(json.detail) ? json.detail.map(d => d.msg).join(', ') : (json.detail || json.message);
                                throw new Error(msg);
                            }
                            const downloadUrl = json.download_url || json.data?.download_url;
                            if (downloadUrl) {
                                const a = document.createElement('a');
                                a.href = downloadUrl;
                                a.download = `manager_report_${safeFrom}_${safeTo}.${ext}`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                toast.success('Download started', { id: tid });
                                return;
                            }
                        } catch (parseErr) {
                            if (!(parseErr instanceof SyntaxError)) throw parseErr;
                        }
                    }

                    const contentType = res.headers['content-type'] ||
                        (format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    const blob = new Blob([res.data], { type: contentType });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `manager_report_${safeFrom}_${safeTo}.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success('Downloaded successfully', { id: tid });
                    return;
                } catch (epErr) {
                    lastErrMsg = await readBlobError(epErr);
                    primaryStatus = epErr?.response?.status;
                    console.warn(`[Export] ${ep} failed (${primaryStatus ?? 'network'}):`, lastErrMsg);
                }
            }

            toast.error(lastErrMsg.slice(0, 150), { id: tid });
        } catch (err) {
            toast.error(err.message || 'Export failed', { id: tid });
        }
    };

    return (
        <div className="space-y-5 pb-10">

            {/* ── PAGE HEADER ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[26px] font-black text-slate-800 leading-none tracking-tight">Manager Hub</h1>
                    <p className="text-[10px] font-bold text-slate-400 capitalize tracking-[0.18em] mt-1">Team Oversight & Performance Tracking</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Global date range */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <input 
                            type="date" 
                            value={fromDate} 
                            onChange={e => {
                                const val = e.target.value;
                                setFromDate(val);
                                localStorage.setItem('dashboard_from_date', val);
                                window.dispatchEvent(new Event('dashboard-filter-change'));
                            }}
                            className="text-[11px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-[100px]" 
                        />
                        <span className="text-slate-300 font-bold">-</span>
                        <input 
                            type="date" 
                            value={toDate} 
                            onChange={e => {
                                const val = e.target.value;
                                setToDate(val);
                                localStorage.setItem('dashboard_to_date', val);
                                window.dispatchEvent(new Event('dashboard-filter-change'));
                            }}
                            className="text-[11px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-[100px]" 
                        />
                    </div>
                    <button onClick={() => handleExport('pdf')} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                        <span>📄</span> PDF
                    </button>
                    <button onClick={() => handleExport('excel')} className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                        <span>📊</span> Excel
                    </button>
                    {loading && <Loader2 size={16} className="text-violet-400 animate-spin" />}
                </div>
            </div>


            {/* ── KPI ROW ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
                {/* 1. Team Tasks */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-4 shadow-lg shadow-cyan-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-pointer ring-2 ring-white/0 hover:ring-white/30"
                    onClick={() => navigate(`/tasks/team?status=&from_date=${fromDate}&to_date=${toDate}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/tasks/team?status=&from_date=${fromDate}&to_date=${toDate}`); }}
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Briefcase size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.totalActive ?? dashboardData?.total_tasks ?? 0}</div>
                        <div className="text-[9px] font-bold capitalize tracking-widest opacity-80 mt-1">Team Tasks</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Active (non-completed)</div>
                    </div>
                </div>

                {/* 2. In Progress */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 shadow-lg shadow-blue-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-pointer ring-2 ring-white/0 hover:ring-white/30"
                    onClick={() => navigate(`/tasks/team?status=IN_PROGRESS&from_date=${fromDate}&to_date=${toDate}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/tasks/team?status=IN_PROGRESS&from_date=${fromDate}&to_date=${toDate}`); }}
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Activity size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.inProgress ?? 0}</div>
                        <div className="text-[9px] font-bold capitalize  tracking-widest opacity-80 mt-1">In Progress</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Tasks in progress</div>
                    </div>
                </div>

                {/* 3. Pending Approval */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white p-4 shadow-lg shadow-amber-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-pointer ring-2 ring-white/0 hover:ring-white/30"
                    onClick={() => navigate(`/tasks/team?status=SUBMITTED&from_date=${fromDate}&to_date=${toDate}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/tasks/team?status=SUBMITTED&from_date=${fromDate}&to_date=${toDate}`); }}
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Clock size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.pending ?? 0}</div>
                        <div className="text-[9px] font-bold capitalize  tracking-widest opacity-80 mt-1">Pending Approval</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Awaiting approval</div>
                    </div>
                </div>

                {/* 4. Overdue Tasks */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white p-4 shadow-lg shadow-rose-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-pointer ring-2 ring-white/0 hover:ring-white/30"
                    onClick={() => navigate(`/tasks/team?status=Overdue&from_date=${fromDate}&to_date=${toDate}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/tasks/team?status=Overdue&from_date=${fromDate}&to_date=${toDate}`); }}
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <AlertCircle size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.overdue ?? 0}</div>
                        <div className="text-[9px] font-bold capitalize  tracking-widest opacity-80 mt-1">Overdue Tasks</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Past due tasks</div>
                    </div>
                </div>

                {/* 5. Manager Score */}
                <div
                    title="Performance Score: Net earned score / ideal score for all due tasks in the selected period * 100"
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 shadow-lg shadow-emerald-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-help"
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Target size={15} className="text-white" />
                        </div>
                        {(() => { const d = stats.managerScoreDelta; return d != null ? <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full ml-auto">{d >= 0 ? '▲' : '▼'} {Math.abs(d)}%</span> : null; })()}
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.managerScore != null ? `${stats.managerScore}%` : '-'}</div>
                        <div className="text-[9px] font-bold capitalize  tracking-widest opacity-80 mt-1">Manager Score</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Calculation: 70% Team + 30% Personal</div>
                    </div>
                </div>

                {/* 6. Team Score */}
                <div
                    title="Team Performance Score: Net earned score / ideal score for all team due tasks in the selected period * 100"
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white p-4 shadow-lg shadow-violet-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-help"
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Users size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.teamScore != null ? `${Number(stats.teamScore).toFixed(2)}%` : '-'}</div>
                        <div className="text-[9px] font-bold capitalize  tracking-widest opacity-80 mt-1">Team Score</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Team performance</div>
                    </div>
                </div>

                {/* 7. Manager Personal Score */}
                <div
                    title="Personal Performance Score: Net earned score / ideal score for manager's own due tasks in the selected period * 100"
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white p-4 shadow-lg shadow-fuchsia-200/40 hover:scale-[1.03] transition-all border border-white/10 flex flex-col justify-between min-h-[110px] cursor-help"
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <TrendingUp size={15} className="text-white" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-2">
                        <div className="text-[28px] font-black leading-none tabular-nums">{stats.managerPersonalScore != null ? `${stats.managerPersonalScore}%` : '-'}</div>
                        <div className="text-[9px] font-bold capitalize tracking-widest opacity-80 mt-1">Personal Score</div>
                        <div className="text-[8px] opacity-60 font-medium mt-0.5">Manager's own tasks</div>
                    </div>
                </div>
            </div>

            {/* Row 2: Task Activity Trends & Completion Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
                {/* Left: Task Activity Trends */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center shadow-sm border border-violet-100/50">
                                <TrendingUp size={20} className="text-violet-600" />
                            </div>
                            <div>
                                <h3 className="text-[20px] font-black text-slate-800 tracking-tight">Task Activity Trends</h3>
                                <p className="text-[10px] font-bold text-slate-400 capitalize  tracking-[0.2em] mt-0.5">Dynamic Workload Trajectory</p>
                            </div>
                        </div>
                        <div className="bg-slate-50/80 border border-slate-100 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-sm overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                                <span className="text-[10px] font-black text-slate-500 capitalize tracking-wider">Approved</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                                <span className="text-[10px] font-black text-slate-500 capitalize tracking-wider">Not started</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                                <span className="text-[10px] font-black text-slate-500 capitalize tracking-wider">Pending</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                                <span className="text-[10px] font-black text-slate-500 capitalize tracking-wider">Overdue</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart data={finalTrendsData.length ? finalTrendsData : [{ name: 'No Data', new: 0, pending: 0, overdue: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 800 }} 
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F8FAFC', opacity: 0.4 }}
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                    formatter={(value, name) => {
                                        if (name === 'completed') return [value, 'Approved'];
                                        if (name === 'new') return [value, 'Not started'];
                                        if (name === 'pending') return [value, 'Pending'];
                                        if (name === 'overdue') return [value, 'Overdue'];
                                        return [value, name];
                                    }}
                                />
                                <Bar dataKey="overdue"   name="Overdue"     stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} barSize={32} />
                                <Bar dataKey="pending"   name="Pending"     stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} barSize={32} />
                                <Bar dataKey="new"       name="Not started" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} barSize={32} />
                                <Bar dataKey="completed" name="Approved"    stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 flex flex-col">
                    <h3 className="text-[20px] font-black text-slate-800 mb-1 flex items-center gap-2">
                        <CheckCircle size={20} className="text-emerald-500" /> Task Completion Overview
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 capitalize  tracking-[0.2em] mt-0.5">Department task health - Approved vs Pending vs Overdue</p>
                    {(() => {
                        const dd = dashboardData || {};
                        const total = stats.total ?? 0;
                        const approved = stats.approved ?? 0;
                        const overdue = stats.overdue ?? 0;
                        const inProg = stats.inProgress ?? 0;
                        const pending = stats.pending ?? 0;
                        const notStarted = stats.notStarted ?? 0;
                        const rate = stats.completionRate ?? 0;

                        // Donut: only include slices with real values (no 0.1 fakes)
                        const donutData = [
                            { name: 'Approved',    value: approved,  fill: '#10B981' },
                            { name: 'Pending',     value: pending,   fill: '#F59E0B' },
                            { name: 'In Progress', value: inProg,    fill: '#6366F1' },
                            { name: 'Overdue',     value: overdue,   fill: '#F43F5E' },
                            { name: 'Not Started', value: notStarted, fill: '#3B82F6' },
                        ].filter(d => d.value > 0);
                        const donutDisplay = donutData.length > 0 ? donutData : [{ name: 'Empty', value: 1, fill: '#F1F5F9' }];

                        return (
                            <div className="flex-1 flex flex-col items-center gap-8 mt-6">
                                <div className="relative w-72 h-72 shrink-0">
                                    <div className="absolute inset-0 rounded-full bg-slate-50 border-[20px] border-slate-100/50 shadow-inner" />
                                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie
                                                data={donutDisplay}
                                                innerRadius={108}
                                                outerRadius={126}
                                                startAngle={90}
                                                endAngle={-270}
                                                paddingAngle={donutData.length > 1 ? 4 : 0}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={6}
                                            >
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
                                        <span className="text-[34px] font-black text-[#1e293b] leading-none tracking-tight">{rate}%</span>
                                        <span className="text-[11px] font-bold text-slate-400 capitalize  tracking-[0.15em] mt-2">Completion Rate</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1 px-2">
                                    {[
                                        { label: 'TOTAL',       value: total,      color: 'text-slate-800',   bg: 'bg-slate-50',    labelColor: 'text-slate-400' },
                                        { label: 'APPROVED',    value: approved,   color: 'text-emerald-500', bg: 'bg-emerald-50',  labelColor: 'text-emerald-500/70' },
                                        { label: 'PENDING',     value: pending,    color: 'text-amber-500',   bg: 'bg-amber-50',    labelColor: 'text-amber-500/70' },
                                        { label: 'OVERDUE',     value: overdue,    color: 'text-rose-500',    bg: 'bg-rose-50',     labelColor: 'text-rose-500/70' },
                                        { label: 'IN PROGRESS', value: inProg,     color: 'text-blue-500',    bg: 'bg-blue-50',     labelColor: 'text-blue-500/70' },
                                        { label: 'NOT STARTED', value: notStarted, color: 'text-indigo-500',  bg: 'bg-indigo-50',   labelColor: 'text-indigo-500/70' },
                                    ].map(chip => (
                                        <div key={chip.label} className={`${chip.bg} rounded-full px-5 py-2.5 flex items-center justify-between shadow-sm border border-white/60`}>
                                            <span className={`text-[18px] font-black ${chip.color} tabular-nums leading-none`}>{chip.value}</span>
                                            <span className={`text-[8px] font-black ${chip.labelColor} capitalize  tracking-wider`}>{chip.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Row 3: Bifurcation + Snapshot */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
                {/* Left: Bifurcation */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <ListChecks size={18} className="text-violet-500" />
                        Team Task Status Bifurcation
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 capitalize  tracking-widest mb-4">Breakdown of department tasks by current status</p>
                    {(() => {
                        const dd = dashboardData || {};

                        // ── bifurcationTasks is fetched fresh from /tasks/team with full
                        //    sequential pagination — same approach as TeamTasksPage metrics.
                        //    CANCELLED tasks are already excluded in fetchBifurcationTasks.
                        let rows;
                        if (bifurcationTasks.length > 0) {
                            const countBy = (s) =>
                                bifurcationTasks.filter(t => (t.status || '').toUpperCase() === s).length;
                            rows = [
                                { label: 'Not Started', value: countBy('NEW') + countBy('NOT_STARTED'), fill: '#3b82f6', pct: 0 },
                                { label: 'In Progress', value: countBy('IN_PROGRESS'),                  fill: '#8b5cf6', pct: 0 },
                                { label: 'Submitted',   value: countBy('SUBMITTED'),                    fill: '#f59e0b', pct: 0 },
                                { label: 'Approved',    value: countBy('APPROVED'),                     fill: '#10b981', pct: 0 },
                                { label: 'Rework',      value: countBy('REWORK'),                       fill: '#ef4444', pct: 0 },
                                { label: 'Cancelled',   value: countBy('CANCELLED'),                    fill: '#9ca3af', pct: 0 },
                            ];
                        } else {
                            // Fallback: backend aggregate while bifurcationTasks is loading
                            const tsb = dd.team_status_bifurcation || {};
                            const st  = tsb.statuses || {};
                            const getCount = (key, flatFallback) =>
                                st[key]?.count ?? st[key] ?? flatFallback ?? 0;
                            rows = [
                                { label: 'Not Started', value: getCount('NEW',         dd.new_tasks),         fill: '#3b82f6', pct: 0 },
                                { label: 'In Progress', value: getCount('IN_PROGRESS', dd.in_progress_tasks), fill: '#8b5cf6', pct: 0 },
                                { label: 'Submitted',   value: getCount('SUBMITTED',   dd.submitted_tasks),   fill: '#f59e0b', pct: 0 },
                                { label: 'Approved',    value: getCount('APPROVED',    dd.approved_tasks),    fill: '#10b981', pct: 0 },
                                { label: 'Rework',      value: getCount('REWORK',      dd.rework_tasks),      fill: '#ef4444', pct: 0 },
                                { label: 'Cancelled',   value: getCount('CANCELLED',   dd.cancelled_tasks),   fill: '#9ca3af', pct: 0 },
                            ];
                        }

                        const total = rows.reduce((s, r) => s + r.value, 0) || 1;
                        rows.forEach(r => { r.pct = Math.round((r.value / total) * 100); });
                        const donutD = rows.filter(r => r.value > 0).map(r => ({ name: r.label, value: r.value, fill: r.fill }));
                        return (
                            <div className="flex items-center gap-6">
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-slate-400 capitalize  tracking-widest border-b border-slate-100">
                                                <th className="pb-2 text-left">Status</th>
                                                <th className="pb-2 text-center">Tasks</th>
                                                <th className="pb-2 text-center">% of Total</th>
                                                <th className="pb-2 pl-4 w-24"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {rows.map(r => (
                                                <tr key={r.label}>
                                                    <td className="py-2 flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.fill }} />
                                                        <span className="text-[12px] font-semibold text-slate-700">{r.label}</span>
                                                    </td>
                                                    <td className="py-2 text-center text-[13px] font-bold text-slate-700">{r.value}</td>
                                                    <td className="py-2 text-center text-[12px] font-semibold text-slate-400">{r.pct}%</td>
                                                    <td className="py-2 pl-4">
                                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.fill }} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="border-t border-slate-200">
                                                <td className="py-2 text-[12px] font-black text-slate-700">Total</td>
                                                <td className="py-2 text-center text-[13px] font-black text-slate-800">{total}</td>
                                                <td className="py-2 text-center text-[12px] font-bold text-slate-500">100%</td>
                                                <td />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="relative w-[140px] h-[140px] shrink-0">
                                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={donutD.length ? donutD : [{ name: 'Empty', value: 1, fill: '#e2e8f0' }]} cx="50%" cy="50%" innerRadius={45} outerRadius={62} dataKey="value" strokeWidth={0}>
                                                {donutD.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-black text-slate-800">{total}</span>
                                        <span className="text-[9px] text-slate-400 font-bold capitalize ">Total</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Right: Snapshot */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6">
                    <h3 className="text-[17px] font-bold text-slate-800 mb-1 flex items-center gap-2">
                        <Activity size={18} className="text-rose-500" />
                        Team Action Snapshot
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 capitalize  tracking-widest mb-4">Focus areas requiring managerial attention</p>
                    {(() => {
                        const dd = dashboardData || {};
                        const tas = dd.team_action_snapshot || {};
                        const snap = [
                            { label: 'Active Tasks',     sub: 'Not approved or cancelled',  value: tas.active_tasks          ?? dd.in_progress_tasks ?? 0,                           icon: Activity,      bg: 'bg-blue-50',    iconC: 'text-blue-500',    border: 'border-blue-100'    },
                            { label: 'Pending Approval', sub: 'Awaiting review',             value: tas.pending_approval_tasks ?? dd.submitted_tasks ?? stats.pendingSubmission ?? 0, icon: Clock,         bg: 'bg-amber-50',   iconC: 'text-amber-500',   border: 'border-amber-100'   },
                            { label: 'Overdue Tasks',    sub: 'Past due, not closed',        value: tas.overdue_tasks          ?? dd.overdue_tasks ?? 0,                              icon: AlertTriangle, bg: 'bg-rose-50',    iconC: 'text-rose-500',    border: 'border-rose-100'    },
                            { label: 'Due Today',        sub: 'Due today, pending action',   value: tas.due_today_tasks        ?? dd.due_today ?? 0,                                  icon: Calendar,      bg: 'bg-orange-50',  iconC: 'text-orange-500',  border: 'border-orange-100'  },
                            { label: 'Completed Tasks',  sub: 'Approved tasks',              value: tas.completed_tasks        ?? dd.approved_tasks ?? 0,                             icon: CheckCircle,   bg: 'bg-emerald-50', iconC: 'text-emerald-500', border: 'border-emerald-100' },
                            { label: 'Cancelled Tasks',  sub: 'Cancelled tasks',             value: tas.cancelled_tasks        ?? dd.cancelled_tasks ?? 0,                            icon: XCircle,       bg: 'bg-slate-50',   iconC: 'text-slate-400',   border: 'border-slate-100'   },
                        ];
                        return (
                            <div className="grid grid-cols-3 gap-3">
                                {snap.map(s => (
                                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3.5 flex flex-col gap-2 hover:shadow-md transition-all`}>
                                        <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                                            <s.icon size={16} className={s.iconC} />
                                        </div>
                                        <div>
                                            <div className="text-[22px] font-black text-slate-800 leading-none">{s.value}</div>
                                            <div className="text-[11px] font-bold text-slate-700 mt-0.5">{s.label}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{s.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>


            {/* ── BOTTOM SPLIT: Execution Monitor + Risk Monitor side-by-side ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 items-start">

            {/* Team Execution Monitor */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/10 flex-wrap">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-bold text-slate-800">Team Execution Monitor</h3>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize  tracking-widest">Workload &amp; Completion Status</span>
                        {teamPerfLoading && <Loader2 size={15} className="text-violet-400 animate-spin" />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
                            <Calendar size={12} className="text-violet-400 shrink-0" />
                            <input type="date" value={teamPerfFrom} max={teamPerfTo} onChange={e => setTeamPerfFrom(e.target.value)} className="text-[11px] font-semibold text-violet-700 bg-transparent border-none outline-none cursor-pointer w-[110px]" />
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold">→</span>
                        <div className="flex items-center gap-1 bg-violet-50 border border-violet-100 rounded-lg px-2.5 py-1.5">
                            <Calendar size={12} className="text-violet-400 shrink-0" />
                            <input type="date" value={teamPerfTo} min={teamPerfFrom} onChange={e => setTeamPerfTo(e.target.value)} className="text-[11px] font-semibold text-violet-700 bg-transparent border-none outline-none cursor-pointer w-[110px]" />
                        </div>
                        <button onClick={() => navigate('/tasks/team')} className="ml-2 px-4 py-1.5 border border-violet-200 text-violet-600 text-[11px] font-bold rounded-lg hover:bg-violet-50 transition-all flex items-center gap-1.5">
                            <Eye size={13} /> View Details
                        </button>
                    </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FF] text-slate-500 text-[10px] font-bold capitalize  tracking-tight border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-3 px-2.5 pl-6">Employee</th>
                                <th className="py-3 px-2.5 text-center">Tasks</th>
                                <th className="py-3 px-2.5 text-center">Active</th>
                                <th className="py-3 px-2.5 text-center">Pending</th>
                                <th className="py-3 px-2.5 text-center">Overdue</th>
                                <th className="py-3 px-2.5 text-center">
                                    <span className="inline-flex items-center justify-center gap-0.5">
                                        Comp %
                                        <InfoTooltip content={
                                            <div className="bg-slate-900 text-white text-[10px] font-semibold rounded-xl px-3 py-2 shadow-2xl leading-relaxed whitespace-nowrap text-center border border-white/10">
                                                <div className="font-black text-violet-300 mb-1">Completion Rate</div>
                                                <div>(Approved Tasks ÷ Total Tasks) × 100</div>
                                                <div className="mt-1 text-slate-400 text-[9px]">Based on the selected date period</div>
                                            </div>
                                        } />
                                    </span>
                                </th>
                                <th className="py-3 px-2.5 text-center">Score %</th>
                                <th className="py-3 px-2.5 text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {finalRankingData.length === 0 ? (
                                <tr><td colSpan="9" className="py-12 text-center text-slate-400 font-bold text-xs">No team data available for selected period</td></tr>
                            ) : (
                                finalRankingData.map((member) => {
                                    // Section 7 exact backend fields
                                    const isManager  = member.is_manager ?? false;
                                    const totalTasks = member.assigned;
                                    const inProgress = member.active;
                                    const pendingRev = member.pending;
                                    const overdue    = member.overdue;
                                    const completed  = member.completed;
                                    // completion_rate from backend takes precedence; fallback = formula
                                    const compRate   = member.completion_rate != null
                                        ? Math.round(member.completion_rate)
                                        : (totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0);
                                    // performance_score from backend (net earned ÷ ideal × 100)
                                    const perfScore  = member.performance_score != null
                                        ? Math.round(member.performance_score)
                                        : compRate;
                                    const dept = member.department_name ?? member.department ?? currentDeptName;
                                    return (
                                        <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${isManager ? 'bg-violet-50/30' : ''}`}>
                                            <td className="py-3 px-2.5 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${isManager ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-violet-400 to-indigo-500'}`}>
                                                        {(member.name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-[12px] font-semibold text-slate-800 truncate">{member.name}</div>
                                                        <div className="text-[9px] font-medium text-slate-400 truncate">
                                                            {isManager ? 'Manager' : (member.role || 'Employee')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2.5 text-center text-[12px] font-bold text-slate-700">{totalTasks}</td>
                                            <td className="py-3 px-2.5 text-center text-[12px] font-semibold text-blue-600">{inProgress}</td>
                                            <td className="py-3 px-2.5 text-center text-[12px] font-semibold text-amber-600">{pendingRev}</td>
                                            <td className="py-3 px-2.5 text-center text-[12px] font-semibold text-rose-600">{overdue}</td>
                                            <td className="py-3 px-2.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${compRate >= 80 ? 'bg-emerald-400' : compRate >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${Math.min(compRate, 100)}%` }} />
                                                    </div>
                                                    <span className={`text-[11px] font-bold ${compRate >= 80 ? 'text-emerald-600' : compRate >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{compRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2.5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${perfScore >= 80 ? 'bg-emerald-400' : perfScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${Math.min(perfScore, 100)}%` }} />
                                                    </div>
                                                    <span className={`text-[11px] font-bold ${perfScore >= 80 ? 'text-emerald-600' : perfScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{perfScore}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2.5 text-right pr-6">
                                                <button onClick={() => navigate(`/tasks?employeeId=${member.id}`)} className="px-3 py-1 bg-[#7B51ED] text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-all active:scale-95 shadow-sm inline-flex items-center gap-1">
                                                    <Eye size={11} /> View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Employee Risk Monitor */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/10 flex-wrap">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle size={17} className="text-rose-500" /> Employee Risk Monitor
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize  tracking-widest">Delivery Health &amp; Risk Assessment</span>
                        {riskLoading && <Loader2 size={14} className="text-rose-400 animate-spin" />}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5">
                            <Calendar size={11} className="text-rose-400 shrink-0" />
                            <input type="date" value={riskFrom} max={riskTo} onChange={e => setRiskFrom(e.target.value)} className="text-[11px] font-semibold text-rose-700 bg-transparent border-none outline-none cursor-pointer w-[105px]" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">→</span>
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5">
                            <Calendar size={11} className="text-rose-400 shrink-0" />
                            <input type="date" value={riskTo} min={riskFrom} onChange={e => setRiskTo(e.target.value)} className="text-[11px] font-semibold text-rose-700 bg-transparent border-none outline-none cursor-pointer w-[105px]" />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-white">
                    <div className="flex items-center gap-1.5 flex-nowrap mb-4">
                        {[
                            { label: 'On Track', desc: 'No overdue',   dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                            { label: 'Watch',    desc: '1 overdue',     dot: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700' },
                            { label: 'At Risk',   desc: '2 overdue',    dot: 'bg-orange-500',  bg: 'bg-amber-50',   text: 'text-orange-700' },
                            { label: 'Off Track', desc: '3+ overdue',   dot: 'bg-rose-500',    bg: 'bg-rose-50',    text: 'text-rose-700' },
                        ].map(s => (
                            <div key={s.label} className={`${s.bg} rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/60 shadow-sm shrink-0`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${s.dot} shadow-sm`} />
                                <div className="flex flex-col leading-[1]">
                                    <span className={`text-[9px] font-black ${s.text} whitespace-nowrap`}>{s.label}</span>
                                    <span className="text-[7.5px] font-bold text-slate-400/80 whitespace-nowrap">{s.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead className="bg-[#F8F9FF] text-slate-500 text-[10px] font-bold capitalize  tracking-tight border-b border-slate-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-3 px-2 pl-6">Employee</th>
                                <th className="py-3 px-1 text-center">Active</th>
                                <th className="py-3 px-1 text-center">Overdue</th>
                                <th className="py-3 px-1 text-center">Score %</th>
                                <th className="py-3 px-2 text-center pr-6">
                                    <span className="inline-flex items-center justify-center gap-0.5">
                                        Status
                                        <InfoTooltip align="left" content={
                                            <div className="bg-slate-900 text-white text-[10px] rounded-xl px-3 py-2.5 shadow-2xl leading-relaxed border border-white/10 w-64">
                                                <div className="font-black text-violet-300 mb-2 text-center">Risk Status Criteria</div>
                                                <div className="flex items-start gap-2 mb-1.5">
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                                    <span><span className="font-bold text-emerald-300">On Track</span><span className="text-slate-400"> — No overdue tasks and score ≥ 80%</span></span>
                                                </div>
                                                <div className="flex items-start gap-2 mb-1.5">
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                                                    <span><span className="font-bold text-blue-300">Watch</span><span className="text-slate-400"> — No overdue, score 60%–79%</span></span>
                                                </div>
                                                <div className="flex items-start gap-2 mb-1.5">
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                                    <span><span className="font-bold text-orange-300">At Risk</span><span className="text-slate-400"> — Overdue tasks exist or score &lt; 60%, but not Off Track</span></span>
                                                </div>
                                                <div className="flex items-start gap-2 mb-1.5">
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                                    <span><span className="font-bold text-rose-300">Off Track</span><span className="text-slate-400"> — Overdue tasks exist and score ≤ 35%</span></span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <span className="mt-0.5 w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                                    <span><span className="font-bold text-slate-300">No Data</span><span className="text-slate-400"> — No tasks in selected period</span></span>
                                                </div>
                                            </div>
                                        } />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employeeRisk.length === 0 ? (
                                <tr><td colSpan="5" className="py-12 text-center text-rose-400 font-bold text-xs">No risk data for selected period</td></tr>
                            ) : (
                ((() => {
                                // Sort a copy of employeeRisk ascending by emp_id
                                const sorted = [...employeeRisk].sort((a, b) => {
                                    const idA = isNaN(Number(a.emp_id || a.id)) ? String(a.emp_id || a.id || '') : Number(a.emp_id || a.id);
                                    const idB = isNaN(Number(b.emp_id || b.id)) ? String(b.emp_id || b.id || '') : Number(b.emp_id || b.id);
                                    if (idA < idB) return -1;
                                    if (idA > idB) return 1;
                                    return 0;
                                });
                                const displayList = riskShowAll ? sorted : sorted.slice(0, 5);
                                return displayList;
                            })()).map((risk, i) => {
                                    const rawStatus = risk.risk_status || risk.risk_level || 'NO_DATA';
                                    // Normalise to display label
                                    const statusLabel = {
                                        ON_TRACK:  'On Track',
                                        WATCH:     'Watch',
                                        AT_RISK:   'At Risk',
                                        OFF_TRACK: 'Off Track',
                                        NO_DATA:   'No Data',
                                    }[rawStatus.toUpperCase()] ?? rawStatus;
                                    const riskStyle = {
                                        'On Track': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                                        'Watch':    'bg-amber-100  text-amber-700  border-amber-200',
                                        'At Risk':  'bg-orange-100 text-orange-700 border-orange-200',
                                        'Off Track':'bg-rose-100   text-rose-700   border-rose-200',
                                        'No Data':  'bg-slate-100  text-slate-500  border-slate-200',
                                    }[statusLabel] ?? 'bg-slate-100 text-slate-500 border-slate-200';
                                    // Section 8 exact backend fields
                                    const activeTasks = risk.active_tasks ?? risk.in_progress_tasks ?? risk.active ?? risk.in_progress ?? 0;
                                    const totalTasks  = risk.total_tasks ?? risk.tasks_assigned ?? risk.total ?? 0;
                                    const overdue     = risk.overdue_tasks ?? risk.overdue_count ?? risk.overdue ?? 0;
                                    const execScore   = risk.performance_score ?? risk.execution_score ?? 0;
                                    return (
                                        <tr key={risk.emp_id ?? i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 px-2 pl-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                                                        {(risk.name || risk.employee_name || risk.emp_name || risk.full_name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 max-w-[100px]">
                                                        <div className="text-[11px] font-semibold text-slate-800 truncate">
                                                            {risk.name || risk.employee_name || risk.emp_name || risk.full_name || (risk.emp_id ? `Emp #${risk.emp_id}` : 'Unknown')}
                                                        </div>
                                                        <div className="text-[8px] text-slate-400 font-medium truncate">{risk.role || risk.designation || 'Team Member'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-1 text-center text-[12px] font-bold text-slate-700">{activeTasks}</td>
                                            <td className="py-3 px-1 text-center text-[12px] font-bold text-rose-600">{overdue}</td>
                                            <td className="py-3 px-1">
                                                <div className="flex items-center justify-center gap-1">
                                                    <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${execScore >= 80 ? 'bg-emerald-400' : execScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${Math.min(execScore, 100)}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600">{execScore}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center pr-6">
                                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black border ${riskStyle} whitespace-nowrap capitalize `}>● {statusLabel}</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {employeeRisk.length > 5 && (
                    <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/20 flex justify-center">
                        <button 
                            onClick={() => setRiskShowAll(!riskShowAll)}
                            className="text-[11px] font-bold text-[#7B51ED] hover:text-violet-700 flex items-center gap-1.5 transition-colors py-1 px-4 rounded-full border border-violet-100 bg-white shadow-sm"
                        >
                            {riskShowAll ? (
                                <>Show Less</>
                            ) : (
                                <>View All ({employeeRisk.length})</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>

        </div>{/* end bottom grid */}

            {/* Team Task Overview + Quick Actions (Footer Position) */}


        </div>
    );
};

export default ManagerDashboard;
