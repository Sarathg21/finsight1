import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    Calendar, Download, FileSpreadsheet, Activity, AlertTriangle, 
    CheckSquare, ClipboardList, Play, ArrowUpRight, BarChart2,
    TrendingUp, Users, ChevronDown, RefreshCw, Info
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, LabelList
} from 'recharts';

const EmployeePersonalReport = () => {
    const { user } = useAuth();
    const toDateKey = (value) => {
        if (!value) return '';
        const raw = String(value).trim();
        if (!raw) return '';
        const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
        const dmyDash = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dmyDash) return `${dmyDash[3]}-${dmyDash[2]}-${dmyDash[1]}`;
        const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
        const ymdSlash = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
        if (ymdSlash) return `${ymdSlash[1]}-${ymdSlash[2]}-${ymdSlash[3]}`;
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
    };

    const extractArr = (resData) => {
        if (!resData) return [];
        if (Array.isArray(resData)) return resData;
        const direct = resData.data || resData.results || resData.items || resData.tasks || [];
        if (Array.isArray(direct)) return direct;
        if (direct && typeof direct === 'object') {
            if (Array.isArray(direct.data)) return direct.data;
            if (Array.isArray(direct.items)) return direct.items;
            if (Array.isArray(direct.results)) return direct.results;
        }
        return [];
    };
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    };

    const getToday = () => new Date().toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(localStorage.getItem('dashboard_from_date') || getFirstDayOfMonth());
    const [toDate, setToDate] = useState(localStorage.getItem('dashboard_to_date') || getToday());
    const [loading, setLoading] = useState(true);

    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState({});
    const [topPerformers, setTopPerformers] = useState([]);

    useEffect(() => {
        const handleFilterChange = () => {
            setFromDate(localStorage.getItem('dashboard_from_date') || getFirstDayOfMonth());
            setToDate(localStorage.getItem('dashboard_to_date') || getToday());
        };
        window.addEventListener('dashboard-filter-change', handleFilterChange);
        return () => window.removeEventListener('dashboard-filter-change', handleFilterChange);
    }, []);

    const fetchDashData = async () => {
        // ── Safe Parameter Normalization ────────────────────────────────────────
        // Prevents 422 Unprocessable Entity by ensuring dates are valid ISO strings
        const safeFrom = (fromDate && fromDate.length === 10) ? fromDate : getFirstDayOfMonth();
        const safeTo   = (toDate   && toDate.length   === 10) ? toDate   : getToday();

        setLoading(true);
        try {
            const myDept = user?.department_name || user?.department || '';
            
            // Backend parameter alignment: send both snake_case and camelCase
            const dateParams = { 
                from_date: safeFrom, 
                to_date: safeTo, 
                start_date: safeFrom, 
                end_date: safeTo,
                fromDate: safeFrom,
                toDate: safeTo
            };

            // 1. Fetch own dashboard summary, own tasks, AND department top performer — all in parallel
            const [dashRes, myTasksRes, topPerformerRes] = await Promise.allSettled([
                api.get('/dashboard/employee', { params: { ...dateParams, scope: 'mine' } }),
                api.get('/tasks', { params: { ...dateParams, limit: 100 } }),
                api.get('/reports/employee/department-top-performer', { params: { ...dateParams } }),
            ]);

            // 2. Process own dashboard summary
            const dashData = dashRes.status === 'fulfilled'
                ? (dashRes.value?.data?.data || dashRes.value?.data || {})
                : {};
            setSummary(dashData);

            // 3. Process own tasks
            const rawTasks = myTasksRes.status === 'fulfilled'
                ? extractArr(myTasksRes.value?.data)
                : [];
            const myId = String(user?.emp_id || user?.id || '');
            const myTasks = (Array.isArray(rawTasks) ? rawTasks : []).filter(t => {
                const assignee = String(t.assigned_to_emp_id || t.employee_id || t.assignee_id || t.emp_id || '');
                return assignee ? assignee === myId : true;
            });
            setTasks(myTasks);

            // 4. ── PRIMARY SOURCE: /reports/employee/department-top-performer ──
            //    This is the ONLY source for the Top High Performers card.
            //    The logged-in employee's own score must NEVER appear in this card.
            const ranked = [];
            if (topPerformerRes.status === 'fulfilled') {
                const rawResponse = topPerformerRes.value?.data;
                const tpData = rawResponse?.data || rawResponse || {};
                
                // Allow backend to return an array of performers or a `top_performers` field
                const performersList = Array.isArray(tpData) ? tpData 
                    : (tpData.top_performers || tpData.performers || (tpData.top_performer ? [tpData.top_performer] : []));
                
                console.log('[TopPerformer] Parsed performers list:', JSON.stringify(performersList));
                
                performersList.forEach((tp, index) => {
                    if (tp && tp.name && !tp.detail) {
                        ranked.push({
                            name: tp.name,
                            score: Math.min(100, typeof tp.score === 'number'
                                ? Math.round(tp.score)
                                : Math.round(Number(tp.score || tp.performance_score || tp.performance_index || 0))),
                            total: tp.total_tasks || tp.total || 0,
                            completed: tp.approved_tasks || tp.completed_tasks || tp.completed || 0,
                            department: tpData.department_name || tp.department_name || tp.department || myDept,
                            empId: String(tp.emp_id || tp.employee_id || tp.id || `dept_top_${index}`)
                        });
                    }
                });
            } else {
                console.error('[TopPerformer] ❌ API call failed:', topPerformerRes.reason);
            }

            // 5. Build ranked list — ONLY from the department-top-performer endpoint.
            //    Do NOT add the logged-in user's own score here.
            if (ranked.length === 0) {
                ranked.push({
                    name: 'Awaiting Stats',
                    score: null,
                    total: 0,
                    completed: 0,
                    department: myDept,
                    empId: 'awaiting'
                });
            }

            console.log('[TopPerformer] Final ranked list:', JSON.stringify(ranked));
            setTopPerformers(ranked);
        } catch (err) {
            console.error('Failed to fetch employee report data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashData();
    }, [fromDate, toDate]);

    const handleDownload = async (format) => {
        const toastId = toast.loading(`Preparing ${format}...`);
        try {
            if (format === 'excel') {
                const csvRows = [];
                csvRows.push(['Task ID', 'Title', 'Status', 'Due Date']);
                
                const exportTasks = tasks.filter(t => {
                    const dateStr = t.assigned_at || t.assigned_date || t.created_at || t.date || t.due_date || t.updated_at;
                    const taskDate = toDateKey(dateStr);
                    if (!taskDate) return true;
                    return (!fromDate || taskDate >= fromDate) && (!toDate || taskDate <= toDate);
                });

                if (exportTasks.length === 0) {
                    toast.error('No tasks found to export', { id: toastId });
                    return;
                }

                exportTasks.forEach(t => {
                    csvRows.push([
                        t.id || t.task_id || '-',
                        `"${(t.title || t.task_name || '').replace(/"/g, '""')}"`,
                        t.status || 'NEW',
                        t.due_date || t.dueDate || '-'
                    ].join(','));
                });

                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `My_Performance_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Downloaded successfully', { id: toastId });
                return;
            }

            let endpoint = `/reports/employee/export-pdf`;
            const params = { from_date: fromDate, to_date: toDate };
            const res = await api.get(endpoint, { params, responseType: 'blob' });

            // Handle potential JSON (error or presigned URL) wrapped in blob
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
                        window.open(downloadUrl, '_blank');
                        toast.success('Download started', { id: toastId });
                        return;
                    }
                } catch (parseErr) {
                    if (!(parseErr instanceof SyntaxError)) throw parseErr;
                }
            }
            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `My_Performance_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded successfully', { id: toastId });
        } catch (err) {
            toast.error(`Failed to download ${format}`, { id: toastId });
        }
    };

    // Derived Metrics with client-side date filtering
    const metrics = useMemo(() => {
        let active = 0, completed = 0, inProgress = 0, overdue = 0, dueToday = 0, reworks = 0, newTasks = 0, submitted = 0, cancelled = 0;
        
        // 1. Client-side date filter (Guarantees UI reflects the filter even if API returns too many tasks)
        const periodTasks = tasks.filter(t => {
            const dateStr = t.assigned_at || t.assigned_date || t.created_at || t.date || t.due_date || t.updated_at;
            const taskDate = toDateKey(dateStr);
            if (!taskDate) return true;
            return taskDate >= fromDate && taskDate <= toDate;
        });

        const total = periodTasks.length;
        
        periodTasks.forEach(t => {
            const status = String(t.status || '').toUpperCase();
            if (status === 'APPROVED' || status === 'COMPLETED') completed++;
            else if (status === 'IN_PROGRESS' || status === 'STARTED') inProgress++;
            else if (status === 'REWORK') reworks++;
            else if (status === 'SUBMITTED') submitted++;
            else if (status === 'CANCELLED') cancelled++;
            else newTasks++;

            if (!['APPROVED', 'CANCELLED', 'COMPLETED'].includes(status)) {
                active++;
                // Check overdue and due today
                const dueStr = t.due_date || t.dueDate;
                if (dueStr) {
                    const dueKey = toDateKey(dueStr);
                    const todayStr = getToday();
                    if (dueKey < todayStr) overdue++;
                    else if (dueKey === todayStr) dueToday++;
                }
            }
        });

        const performanceIndex = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total: summary.total_tasks ?? total,
            active: summary.active_tasks ?? active,
            completed: summary.approved_tasks ?? completed,
            inProgress,
            overdue: summary.overdue_tasks ?? overdue,
            dueToday: summary.due_today_tasks || dueToday,
            pending: summary.pending_submission_tasks ?? (newTasks + reworks),
            reworks,
            submitted,
            newTasks,
            cancelled,
            onTimePct: summary.on_time_pct !== undefined && summary.on_time_pct !== null ? Math.round(Number(summary.on_time_pct)) : 0,
            efficiency: Math.min(100, Math.round(summary.performance_score ?? performanceIndex)),
            performanceScore: Math.min(100, Math.round(summary.performance_score ?? performanceIndex)),
            deptAvg: Math.round(summary.department_avg_score ?? summary.dept_avg_score ?? 0),
            vsDeptAvg: Math.round(summary.score_vs_department_avg ?? 0)
        };
    }, [tasks, summary, fromDate, toDate]);

    // Dynamic Trend Data: based on filter range (month buckets)
    const trendData = useMemo(() => {
        // 1. Calculate local buckets to use as a fallback for 'approved' counts
        const from = fromDate && fromDate.length === 10 ? new Date(fromDate) : new Date();
        const to = toDate && toDate.length === 10 ? new Date(toDate) : new Date();
        const start = new Date(from.getFullYear(), from.getMonth(), 1);
        const end = new Date(to.getFullYear(), to.getMonth(), 1);

        const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const labelFor = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        const buckets = {};
        let cursor = new Date(start);
        while (cursor <= end) {
            const key = monthKey(cursor);
            buckets[key] = { name: labelFor(cursor), approved: 0, total: 0 };
            cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        }

        const doneStatuses = new Set(['APPROVED', 'COMPLETED', 'FINISHED', 'DONE', 'SUBMITTED', 'SUCCESS']);
        tasks.forEach(t => {
            const dateStr = t.assigned_at || t.assigned_date || t.created_at || t.date || t.due_date || t.updated_at;
            const taskDate = toDateKey(dateStr);
            if (!taskDate) return;
            if (taskDate < fromDate || taskDate > toDate) return;
            const key = taskDate.slice(0, 7);
            if (!buckets[key]) return;
            buckets[key].total += 1;
            const status = String(t.status || '').toUpperCase();
            if (doneStatuses.has(status) || t.is_completed) {
                buckets[key].approved += 1;
            }
        });

        // 2. If backend provides the trend, map it natively but fallback to local approved counts if the backend omits it
        if (summary?.graphs?.performance_trend && Array.isArray(summary.graphs.performance_trend)) {
            return summary.graphs.performance_trend.map(pt => {
                const nameStr = pt.period || pt.name || pt.month || '';
                const localMatch = Object.values(buckets).find(b => b.name === nameStr);
                
                return {
                    name: nameStr,
                    approved: pt.approved_tasks ?? pt.approved ?? (localMatch ? localMatch.approved : 0),
                    score: Math.min(100, Math.round(pt.score ?? pt.performance_score ?? 0))
                };
            });
        }

        // 3. Raw fallback if backend has no graph data
        const rows = Object.values(buckets).map(b => ({
            name: b.name,
            approved: b.approved,
            score: b.total > 0 ? Math.round((b.approved / b.total) * 100) : 0
        }));
        const anyData = rows.some(r => r.approved > 0 || r.score > 0);
        if (!anyData) {
            const total = Number(summary.total_tasks || summary.total || 0);
            const approved = Number(summary.approved_tasks || summary.completed_tasks || 0);
            const score = total > 0 ? Math.round((approved / total) * 100) : 0;
            return rows.map(r => ({ ...r, approved, score }));
        }
        return rows;
    }, [tasks, summary, fromDate, toDate]);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    if (loading) {
        return <div className="p-10 text-center text-slate-500 font-medium">Loading report data...</div>;
    }

    const pieDataMap = [
        { name: 'Not Started', value: summary.graphs?.status_distribution?.NEW ?? metrics.newTasks ?? 0, color: '#3b82f6', bg: 'bg-blue-500' },
        { name: 'In Progress', value: summary.graphs?.status_distribution?.IN_PROGRESS ?? metrics.inProgress ?? 0, color: '#8b5cf6', bg: 'bg-purple-500' },
        { name: 'Submitted', value: summary.graphs?.status_distribution?.SUBMITTED ?? metrics.submitted ?? 0, color: '#f59e0b', bg: 'bg-amber-400' },
        { name: 'Approved', value: summary.graphs?.status_distribution?.APPROVED ?? metrics.completed ?? 0, color: '#10b981', bg: 'bg-emerald-500' },
        { name: 'Rework', value: summary.graphs?.status_distribution?.REWORK ?? metrics.reworks ?? 0, color: '#ef4444', bg: 'bg-red-500' },
        { name: 'Cancelled', value: summary.graphs?.status_distribution?.CANCELLED ?? metrics.cancelled ?? 0, color: '#94a3b8', bg: 'bg-slate-400' }
    ];
    const activePieData = pieDataMap.filter(d => d.value > 0);
    const donutTotal = summary.total_tasks ?? metrics.total;

    let exactPcts = pieDataMap.map(() => 0);
    if (donutTotal > 0) {
        const pieSum = pieDataMap.reduce((acc, cur) => acc + cur.value, 0);
        const rawPcts = pieDataMap.map(stat => (stat.value / donutTotal) * 100);
        
        if (pieSum === donutTotal) {
            const flooredPcts = rawPcts.map(p => Math.floor(p));
            let diff = 100 - flooredPcts.reduce((a, b) => a + b, 0);
            let remainders = rawPcts.map((p, i) => ({ idx: i, rem: p - flooredPcts[i] }));
            remainders.sort((a, b) => b.rem - a.rem);
            for (let i = 0; i < diff && i < remainders.length; i++) {
                flooredPcts[remainders[i].idx] += 1;
            }
            exactPcts = flooredPcts;
        } else {
            exactPcts = rawPcts.map(p => Math.round(p));
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFF] p-4 lg:p-8 space-y-6 font-sans">
            
            {/* ── Page Header ─────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-[26px] font-bold text-[#1E1B4B] leading-tight">My Performance</h1>
                    <p className="text-[12px] text-slate-400 mt-0.5">Overview of your tasks and performance</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date range pill */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                        <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                        <input
                            type="date"
                            className="border-none text-[12px] font-semibold text-slate-700 bg-transparent p-0 focus:ring-0 cursor-pointer"
                            value={fromDate}
                            onChange={e => {
                                const val = e.target.value;
                                setFromDate(val);
                                localStorage.setItem('dashboard_from_date', val);
                                window.dispatchEvent(new Event('dashboard-filter-change'));
                            }}
                        />
                        <span className="text-slate-300 text-[12px]">-</span>
                        <input
                            type="date"
                            className="border-none text-[12px] font-semibold text-slate-700 bg-transparent p-0 focus:ring-0 cursor-pointer"
                            value={toDate}
                            onChange={e => {
                                const val = e.target.value;
                                setToDate(val);
                                localStorage.setItem('dashboard_to_date', val);
                                window.dispatchEvent(new Event('dashboard-filter-change'));
                            }}
                        />
                        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                    </div>

                    {/* PDF button */}
                    <button
                        onClick={() => handleDownload('pdf')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#1E1B4B] rounded-xl hover:bg-slate-50 transition-all font-semibold text-[12px] shadow-sm"
                    >
                        <Download size={14} className="text-rose-500" />
                        PDF
                    </button>

                    {/* Excel button */}
                    <button
                        onClick={() => handleDownload('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#1E1B4B] rounded-xl hover:bg-slate-50 transition-all font-semibold text-[12px] shadow-sm"
                    >
                        <FileSpreadsheet size={14} className="text-emerald-500" />
                        Excel
                    </button>
                </div>
            </div>

            {/* ── KPI Strip ───────────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
                    <div className="flex items-center gap-4 px-6 first:pl-0">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <CheckSquare size={20} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 capitalize tracking-wide mb-0.5">Total Tasks</p>
                            <p className="text-[28px] font-bold text-[#1E1B4B] leading-none">{metrics.total}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">All time tasks</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <div className="relative group w-max">
                                <div className="flex items-center gap-1 cursor-help">
                                    <p className="text-[11px] font-bold text-slate-400 capitalize tracking-wide mb-0.5">Performance Score</p>
                                    <Info size={12} className="text-slate-400 mb-0.5" />
                                </div>
                                <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] opacity-0 transition-opacity group-hover:opacity-100 z-50 bg-[#1E1B4B] text-white shadow-xl rounded-xl p-4 text-left">
                                    {/* Arrow */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-[#1E1B4B]"></div>
                                    
                                    <p className="text-[11px] text-slate-200 mb-2 leading-relaxed">
                                        Performance Score is calculated based on tasks due in the selected period.
                                    </p>
                                    <p className="text-[11px] font-semibold text-white mb-1">Scoring basis:</p>
                                    <ul className="text-[11px] text-slate-200 space-y-1 mb-3 ml-1">
                                        <li>• On-time submitted/approved task = 100 points</li>
                                        <li>• Submitted within 2 days after due date = 60 points</li>
                                        <li>• Submitted more than 2 days late = 0 points</li>
                                        <li>• Each rework reduces 10 points</li>
                                    </ul>
                                    <p className="text-[11px] text-slate-200 leading-relaxed border-t border-slate-700 pt-2 mt-2">
                                        <span className="font-semibold text-white">Final score =</span> Earned points ÷ Ideal points for all due tasks in the selected period.
                                    </p>
                                </div>
                            </div>
                            <p className="text-[28px] font-bold text-emerald-500 leading-none">{metrics.performanceScore}%</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Your performance</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Users size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 capitalize tracking-wide mb-0.5">Dept Avg Score</p>
                            <p className="text-[28px] font-bold text-blue-500 leading-none">{metrics.deptAvg}%</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Department average</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-6">
                        <div className="w-11 h-11 rounded-2xl bg-fuchsia-50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={20} className="text-fuchsia-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 capitalize tracking-wide mb-0.5">Vs Dept Avg</p>
                            <p className="text-[28px] font-bold text-fuchsia-500 leading-none">
                                {metrics.vsDeptAvg > 0 ? '+' : ''}{metrics.vsDeptAvg}%
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Performance difference</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Action Required ─────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <div className="mb-4">
                    <h3 className="text-[15px] font-bold text-[#1E1B4B]">Action Required</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Focus areas that need your attention</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <ClipboardList size={18} className="text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500capitalize tracking-wide">Active Tasks</p>
                            <p className="text-[26px] font-bold text-[#1E1B4B] leading-none my-1">{metrics.active}</p>
                            <p className="text-[10px] text-slate-400">Tasks in progress</p>
                        </div>
                    </div>

                    <div className="border-l-4 border-rose-400 border border-rose-50 rounded-2xl p-4 flex items-start gap-3 bg-rose-50/30">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle size={18} className="text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-rose-500 capitalize tracking-wide">Overdue</p>
                            <p className="text-[26px] font-bold text-rose-600 leading-none my-1">{metrics.overdue}</p>
                            <p className="text-[10px] text-slate-400">Past due tasks</p>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Calendar size={18} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-amber-500 capitalize tracking-wide">Due Today</p>
                            <p className="text-[26px] font-bold text-amber-600 leading-none my-1">{metrics.dueToday}</p>
                            <p className="text-[10px] text-slate-400">Tasks due today</p>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity size={18} className="text-violet-500" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-violet-500 capitalize tracking-wide">Pending Submission</p>
                            <p className="text-[26px] font-bold text-violet-600 leading-none my-1">{metrics.pending}</p>
                            <p className="text-[10px] text-slate-400">Awaiting your submission</p>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckSquare size={18} className="text-teal-500" />
                        </div>
                        <div>
                            <div className="relative group w-max">
                                <div className="flex items-center gap-1 cursor-help">
                                    <p className="text-[11px] font-bold text-teal-500 capitalize tracking-wide mb-0.5">On-Time Achievement %</p>
                                    <Info size={12} className="text-teal-500 mb-0.5" />
                                </div>
                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 transition-opacity group-hover:opacity-100 z-50 bg-[#1E1B4B] text-white shadow-xl rounded-xl p-3 text-center whitespace-nowrap">
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1E1B4B]"></div>
                                    <p className="text-[11px] font-semibold text-slate-200">on-time completed tasks / Total tasks</p>
                                </div>
                            </div>
                            <p className="text-[26px] font-bold text-teal-600 leading-none my-1">{metrics.onTimePct}%</p>
                            <p className="text-[10px] text-slate-400">Due tasks completed on time</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Status Distribution (Exclusive) */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left - Table */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-5">
                            <h3 className="text-[16px] font-bold text-[#1E1B4B]">Task Status Distribution (Exclusive)</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Breakdown of tasks by current status</p>
                        </div>

                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="pb-3 text-[11px] font-bold text-slate-400capitalize tracking-wider">Status</th>
                                    <th className="pb-3 text-[11px] font-bold text-slate-400 capitalize tracking-wider text-center">Tasks</th>
                                    <th className="pb-3 text-[11px] font-bold text-slate-400 capitalize tracking-wider">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pieDataMap.map((stat, i) => {
                                    const pct = exactPcts[i];
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stat.bg}`}></span>
                                                    <span className="text-[13px] font-semibold text-[#1E1B4B]">{stat.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="text-[14px] font-bold text-[#1E1B4B]">{stat.value}</span>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[13px] font-bold text-[#1E1B4B] w-10 flex-shrink-0">{pct}%</span>
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${stat.bg} rounded-full transition-all duration-700`}
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-200">
                                    <td className="pt-3 pb-1">
                                        <span className="text-[13px] font-black text-[#1E1B4B]">Total</span>
                                    </td>
                                    <td className="pt-3 pb-1 text-center">
                                        <span className="text-[14px] font-black text-[#1E1B4B]">{donutTotal}</span>
                                    </td>
                                    <td className="pt-3 pb-1">
                                        <span className="text-[13px] font-black text-[#1E1B4B]">100%</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px bg-slate-100 self-stretch"></div>

                    {/* Right - Donut Chart */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="mb-5">
                            <h3 className="text-[16px] font-bold text-[#1E1B4B]">Task Status Distribution</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
                            {/* Donut */}
                            <div className="relative w-[320px] h-[320px] flex-shrink-0 mx-auto sm:mx-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                        <Pie
                                            data={activePieData.length > 0 ? activePieData : [{name:'None', value: 1, color:'#e2e8f0'}]}
                                            innerRadius={100}
                                            outerRadius={150}
                                            paddingAngle={3}
                                            dataKey="value"
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                if (percent < 0.04) return null;
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                return (
                                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '13px', fontWeight: 700 }}>
                                                        {`${Math.round(percent * 100)}%`}
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {(activePieData.length > 0 ? activePieData : [{name:'None', value: 1, color:'#e2e8f0'}]).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-1">
                                    <p className="text-[32px] font-black text-[#1E1B4B] leading-none">{donutTotal}</p>
                                    <p className="text-[12px] font-bold text-slate-400 capitalize tracking-widest mt-1">Total Tasks</p>
                                </div>
                            </div>

                            {/* Legend + Info */}
                            <div className="flex flex-col gap-1.5 flex-1">
                                {pieDataMap.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${stat.bg}`}></span>
                                        <span className="text-[12px] font-semibold text-slate-600">{stat.name}</span>
                                        <span className="text-[12px] font-bold text-slate-400 ml-auto">({stat.value})</span>
                                    </div>
                                ))}

                                <div className="mt-4 flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">These status categories are mutually exclusive and add up to total tasks.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Performance Trend */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mb-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-[16px] font-bold text-[#1E1B4B]">Monthly Performance Trend</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Your approved tasks and performance score over time</p>
                    </div>
                    {/* Legend top-right */}
                    <div className="flex items-center gap-5 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm flex-shrink-0"></div>
                            <span className="text-[11px] font-semibold text-slate-500">Approved Tasks (Count)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-0 border-t-2 border-purple-500 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full border-2 border-purple-500 bg-white absolute"></div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">Performance Score (%)</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%" minWidth={150} minHeight={150}>
                        <ComposedChart data={trendData} margin={{ top: 24, right: 60, left: 60, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                domain={[0, dataMax => Math.max(dataMax + 2, 8)]}
                                label={{ value: 'Approved Tasks (Count)', angle: -90, position: 'insideLeft', offset: -40, style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600 } }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                domain={[0, 100]}
                                tickFormatter={v => `${v}%`}
                                label={{ value: 'Performance Score (%)', angle: -90, position: 'insideRight', offset: -45, textAnchor: 'middle', style: { fill: '#94a3b8', fontSize: 11, fontWeight: 600, textAnchor: 'middle' } }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 600 }}
                                formatter={(value, name) => name === 'score' ? [`${value}%`, 'Performance Score'] : [value, 'Approved Tasks']}
                            />
                            <Bar yAxisId="left" dataKey="approved" fill="#10b981" barSize={36} radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="approved" position="top" style={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                            </Bar>
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="score"
                                stroke="#8b5cf6"
                                strokeWidth={2.5}
                                dot={{ r: 5, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2.5 }}
                                activeDot={{ r: 7 }}
                            >
                                <LabelList dataKey="score" position="top" style={{ fill: '#8b5cf6', fontSize: 11, fontWeight: 700 }} formatter={v => `${v}%`} />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Footer note */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-[10px] text-slate-400">Performance score is calculated based on timely completion, quality and adherence to task requirements.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <p className="text-[10px] text-slate-400">Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <RefreshCw size={12} className="text-slate-400" />
                    </div>
                </div>
            </div>


            
        </div>
    );
};

export default EmployeePersonalReport;
