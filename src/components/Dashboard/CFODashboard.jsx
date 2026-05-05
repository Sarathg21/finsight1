import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../UI/Badge';
import StatsCard from '../UI/StatsCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line, Area
} from 'recharts';
import {
    TrendingUp, Users, CheckSquare, AlertTriangle, ChevronRight,
    BarChart2, Loader2, CheckCircle, Activity, Shield, Layout, Target, Clock, PlusCircle,
    Plus, MessageSquare, User, ChevronDown, XCircle, Calendar, Info, X
} from 'lucide-react';
import EmployeeIssueModal from '../Modals/EmployeeIssueModal';
import DeptReviewModal from '../Modals/DeptReviewModal';
import toast from 'react-hot-toast';
import CustomSelect from '../UI/CustomSelect';


const TERMINAL_STATUSES = new Set(['APPROVED', 'COMPLETED', 'CANCELLED']);

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

const DepartmentPerformanceGrid = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-12 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 font-bold capitalize tracking-[0.3em] text-[10px]">No Department Performance Data</p>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'ON_TRACK': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
            case 'AT_RISK': return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
            case 'OFF_TRACK': return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
            default: return 'bg-slate-300';
        }
    };

    const getStatusText = (status) => {
        if (!status || status === 'NO_DATA') return 'No Data';
        const key = status.toUpperCase();
        if (key === 'NEW' || key === 'NOT_STARTED') return 'Not started';
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    return (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 transition-all hover:shadow-md">
            <h3 className="text-[12px] font-bold text-slate-500 mb-8 flex items-center gap-3">
                <Target size={16} className="text-emerald-600" />
                Departmental Health Grid
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-400 font-bold border-b border-slate-100 uppercase tracking-tighter">
                        <tr>
                            <th className="py-2.5 px-4 pl-6 font-bold text-[10px]">Dept</th>
                            <th className="py-2.5 px-4 font-bold text-center">Total</th>
                            <th className="py-2.5 px-4 font-bold text-center">O.D</th>
                            <th className="py-2.5 px-4 font-bold text-center text-indigo-500">Prog</th>
                            <th className="py-2.5 px-4 font-bold text-center text-emerald-500">Done</th>
                            <th className="py-2.5 px-4 font-bold min-w-[60px] text-center">%</th>
                            <th className="py-2.5 px-4 font-bold text-right pr-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((dept, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-2 px-4 pl-6">
                                    <span className="text-[11px] font-bold text-slate-800 capitalize tracking-tight whitespace-nowrap truncate max-w-[100px] block">
                                        {dept.department_name || dept.name || 'Unknown'}
                                    </span>
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-slate-600 tabular-nums text-[10px]">
                                    {dept.total_tasks || 0}
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-rose-600 tabular-nums text-[10px]">
                                    {dept.overdue_tasks || 0}
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-indigo-600 tabular-nums text-[10px]">
                                    {dept.in_progress_tasks || 0}
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-emerald-600 tabular-nums text-[10px]">
                                    {dept.completed_tasks || 0}
                                </td>
                                <td className="py-2 px-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden max-w-[40px]">
                                            <div className="h-full bg-indigo-500" style={{ width: `${dept.completion_pct || 0}%` }} />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400">{Math.round(dept.completion_pct || 0)}%</span>
                                    </div>
                                </td>
                                <td className="py-2 px-1.5 text-right pr-6 whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-105 min-w-max">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(dept.status)}`} />
                                        <span className="text-[9px] font-black text-slate-500 capitalize tracking-tight whitespace-nowrap">
                                            {getStatusText(dept.status)}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
const EmployeeRiskPanel = ({ tasks, onIssueClick }) => {
    const riskData = useMemo(() => {
        const counts = {};
        tasks.forEach(t => {
            if (t.status === 'REWORK' || t.is_overdue || t.overdue) {
                const name = t.assigneeName || t.assigned_to_name || 'System';
                if (!counts[name]) counts[name] = { name, overdue: 0, rework: 0, total: 0 };
                if (t.status === 'REWORK') counts[name].rework++;
                if (t.is_overdue || t.overdue) counts[name].overdue++;
                counts[name].total++;
            }
        });
        return Object.values(counts)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [tasks]);

    if (riskData.length === 0) return null;

    return (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 transition-all hover:shadow-md">
            <h3 className="text-[12px] font-bold text-slate-500 mb-6 flex items-center gap-3">
                <AlertTriangle size={16} className="text-rose-600" />
                Top Risk Employees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {riskData.map((emp, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100/50 flex flex-col justify-between group hover:bg-white transition-all">
                                <div className="flex items-start justify-between mb-2">
                                    <p className="text-[16px] font-black text-slate-800 leading-tight">{emp.name}</p>
                                    <span className="text-sm">⚠</span>
                                </div>
                        <div className="flex items-end justify-between">
                            <p className="text-[12px] text-slate-400 font-bold capitalize tracking-widest leading-none">
                                {emp.overdue} Overdue
                            </p>
                            <button
                                onClick={() => onIssueClick(emp.name)}
                                    className="px-2 py-1 rounded bg-rose-100/50 text-rose-600 text-[12px] font-semibold hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                            >
                                {emp.total} Issues
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExecutiveHealthPanel = ({ metrics, departments }) => {
    const topDept = [...departments].sort((a, b) => b.completion_pct - a.completion_pct)[0];
    const bottomDept = [...departments].sort((a, b) => a.completion_pct - b.completion_pct)[0];

    return (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 transition-all hover:shadow-md">
            <h3 className="text-[12px] font-bold text-slate-500 mb-8 flex items-center gap-3">
                <Shield size={15} className="text-violet-600" />
                Organization Health Panel
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Part 1: Performance Rates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Completion Rate', value: `${metrics?.orgCompletionRate || 0}%`, color: 'text-violet-600', icon: CheckCircle },
                        { label: 'On-Time Rate', value: `${metrics?.avgOnTime || 0}%`, color: 'text-sky-600', icon: Clock },
                        { label: 'Rework Rate', value: `${metrics?.avgRework || 0}`, color: 'text-amber-600', icon: TrendingUp },
                    ].map((m, i) => (
                        <div key={i} className="flex flex-col p-5 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:bg-white transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <m.icon size={18} className={m.color} />
                                <span className={`text-xl font-semibold ${m.color}`}>{m.value}</span>
                            </div>
                            <span className="text-[14px] font-semibold text-slate-400">{m.label}</span>
                        </div>
                    ))}
                </div>

                {/* Part 2: Department Leaders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <span className="text-xl">🏆</span>
                            <span className="text-[15px] font-semibold text-emerald-700 capitalize tracking-widest">Top Dept</span>
                        </div>
                        <h4 className="text-[15px] font-medium text-slate-900 border-l-4 border-emerald-500 pl-3 relative z-10 capitalize tracking-tight">
                            {topDept?.department || topDept?.name || 'Accounts'}
                        </h4>
                    </div>
                    <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <span className="text-xl">⚠</span>
                            <span className="text-[15px] font-semibold text-rose-700 capitalize tracking-widest">Bottom Dept</span>
                        </div>
                        <h4 className="text-[15px] font-medium text-slate-900 border-l-4 border-rose-500 pl-3 relative z-10 capitalize tracking-tight">
                            {bottomDept?.department || bottomDept?.name || 'Whse'}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskTrendsChart = ({ data, fromDate, toDate }) => {
    // Short/full month tables used by the normalizer
    const MONTH_SHORTS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const MONTH_FULLS  = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    /**
     * Convert any date-like string → "YYYY-MM" key.
     * Handles: YYYY-MM-DD, YYYY-MM, YYYY-WNN, "February 2026", "Feb 2026",
     *          "Feb", week ISO strings (2026-W06), etc.
     */
    const toYearMonthKey = (rawKey, monthRange) => {
        if (!rawKey) return null;
        const s = String(rawKey).trim();
        
        // 1. Flexible Date Match: YYYY-MM-DD, YY-MM-DD, DD-MM-YYYY, etc.
        const dateMatch = s.match(/^(\d{2,4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (dateMatch) {
            let y = dateMatch[1], m = dateMatch[2];
            if (y.length === 2 && parseInt(y) >= 20) y = '20' + y;
            if (y.length === 2 && parseInt(y) <= 31 && s.length >= 8) {
                const lastPart = s.match(/(\d{4})$/);
                if (lastPart) { y = lastPart[1]; m = dateMatch[2]; }
            }
            if (y.length === 4) return `${y}-${m.padStart(2, '0')}`;
        }

        if (/^\d{4}-\d{2}$/.test(s)) return s;

        // "February 2026", "Feb 2026", "Feb"
        const yearMatch = s.match(/\b(20\d{2})\b/);
        const yr = yearMatch ? yearMatch[1] : null;
        const sLower = s.toLowerCase();
        let mIdx = -1;
        for (let i = 0; i < MONTH_FULLS.length; i++) {
            if (sLower.includes(MONTH_FULLS[i]) || sLower.startsWith(MONTH_SHORTS[i].toLowerCase())) { mIdx = i; break; }
        }
        if (mIdx >= 0 && yr)  return `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
        if (mIdx >= 0) { const f = monthRange.find(m => m.label === MONTH_SHORTS[mIdx]); if (f) return f.key; }
        // Last resort: native Date parse
        try { 
            const p = new Date(s); 
            if (!isNaN(p.getTime())) {
                let y = p.getFullYear();
                if (y < 100) y += 2000;
                return `${y}-${String(p.getMonth()+1).padStart(2,'0')}`; 
            }
        } catch (_) {}
        return null;
    };


    const trends = useMemo(() => {
        // Debug: see exactly what the backend sends
        if (data && data.length > 0) {
            console.log('[TaskTrendsChart] raw data sample:', JSON.stringify(data[0]), '| total rows:', data.length);
        } else {
            console.warn('[TaskTrendsChart] trends data is empty — no bars will render');
        }

        // Build full month skeleton from fromDate → toDate
        const generateMonthRange = (from, to) => {
            if (!from || !to) return [];
            const months = [];
            const start = new Date(from); start.setDate(1);
            const end   = new Date(to);   end.setDate(1);
            const cur = new Date(start);
            while (cur <= end) {
                const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
                months.push({ key, label: cur.toLocaleString('en-US', { month: 'short' }) });
                cur.setMonth(cur.getMonth() + 1);
            }
            return months;
        };

        const monthRange = generateMonthRange(fromDate, toDate);

        // Map backend rows → YYYY-MM keyed accumulator
        const backendMap = {};
        (data || []).forEach(d => {
            const rawKey = d.name || d.month || d.period || d.week || '';
            const normKey = toYearMonthKey(rawKey, monthRange);
            if (!normKey) return; // skip unmappable rows

            const g = (keys) => { for (const k of keys) { if (d[k] !== undefined && d[k] !== null) return Number(d[k]); } return 0; };

            if (!backendMap[normKey]) backendMap[normKey] = { new: 0, pending: 0, overdue: 0, completed: 0 };
            backendMap[normKey].new       += g(['new_tasks', 'new', 'not_started', 'Not Started', 'new_count', 'created']);
            backendMap[normKey].pending   += g(['pending_submission', 'pending', 'submitted', 'submitted_tasks', 'pending_tasks', 'Pending', 'In Progress', 'in_progress']);
            backendMap[normKey].overdue   += g(['overdue_tasks', 'overdue', 'Overdue', 'overdue_count', 'is_overdue']);
            backendMap[normKey].completed += g(['completed_tasks', 'completed', 'Completed', 'approved', 'Approved', 'completed_count', 'approved_tasks']);
        });

        console.log('[TaskTrendsChart] backendMap keys:', Object.keys(backendMap), '| monthRange:', monthRange.map(m => m.key));

        if (monthRange.length > 0) {
            return monthRange.map(({ key, label }) => ({
                name:      label,
                new:       backendMap[key]?.new       ?? 0,
                pending:   backendMap[key]?.pending   ?? 0,
                overdue:   backendMap[key]?.overdue   ?? 0,
                completed: backendMap[key]?.completed ?? 0,
            }));
        }

        // Fallback: render backend data directly, best-effort label
        return (data || []).map(d => {
            const g = (keys) => { for (const k of keys) { if (d[k] !== undefined && d[k] !== null) return Number(d[k]); } return 0; };
            const rawKey = d.name || d.month || d.period || d.week || '';
            const ymKey  = toYearMonthKey(rawKey, []);
            const label  = ymKey ? new Date(ymKey + '-01').toLocaleString('en-US', { month: 'short' }) : rawKey;
            return {
                name:      label,
                new:       g(['new_tasks', 'new', 'not_started', 'Not Started', 'new_count', 'created']),
                pending:   g(['pending_submission', 'pending', 'submitted', 'submitted_tasks', 'pending_tasks', 'Pending', 'In Progress', 'in_progress']),
                overdue:   g(['overdue_tasks', 'overdue', 'Overdue', 'overdue_count', 'is_overdue']),
                completed: g(['completed_tasks', 'completed', 'Completed', 'approved', 'Approved', 'completed_count', 'approved_tasks']),
            };
        });
    }, [data, fromDate, toDate]);

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-6 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center shadow-sm border border-violet-100/50">
                        <TrendingUp size={20} className="text-violet-600" />
                    </div>
                    <div>
                        <h3 className="text-[20px] font-black text-slate-800 tracking-tight">Task Activity Trends</h3>
                        <p className="text-[10px] font-bold text-slate-400 capitalize tracking-[0.2em] mt-0.5">Dynamic Workload Trajectory</p>
                    </div>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                        <span className="text-[10px] font-black text-slate-500 capitalize tracking-widest">Approved</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                        <span className="text-[10px] font-black text-slate-500 capitalize tracking-widest">Not started</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                        <span className="text-[10px] font-black text-slate-500 capitalize tracking-widest">Pending</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                        <span className="text-[10px] font-black text-slate-500 capitalize tracking-widest">Overdue</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={trends.length ? trends : [{ name: 'No Data', new: 0, pending: 0, overdue: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                if (name === 'new')       return [value, 'Not started'];
                                if (name === 'pending')   return [value, 'Pending'];
                                if (name === 'overdue')   return [value, 'Overdue'];
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
    );
};

const OrganizationHealth = ({ metrics, prevMonthName }) => {
    const fmt1 = (v) => Number(v).toFixed(1) + '%';
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-[15px] font-bold text-slate-800 mb-6">Organization Health</h3>

            <div className="space-y-6">
                <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm group-hover:scale-105 transition-transform">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div className="grid">
                            <span className="text-[13px] font-semibold text-indigo-500 leading-tight">Org Performance Score</span>
                            <span className="text-[11px] text-slate-400 font-medium">vs {prevMonthName}: {metrics?.orgPerfScoreDelta != null ? `${Number(metrics.orgPerfScoreDelta) >= 0 ? '↑' : '↓'} ${Math.abs(Number(metrics.orgPerfScoreDelta)).toFixed(1)}pp` : '—'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[24px] font-bold text-indigo-600 tabular-nums">{fmt1(metrics?.healthOrgPerformanceScore ?? 0)}</span>
                        <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
                            <BarChart2 size={18} strokeWidth={2.5} />
                        </div>
                        <div className="grid">
                            <span className="text-[13px] font-semibold text-blue-500 leading-tight">Org Completion Rate</span>
                            <span className="text-[11px] text-slate-400 font-medium">vs {prevMonthName}: {metrics?.orgCompletionRateDelta != null ? `${Number(metrics.orgCompletionRateDelta) >= 0 ? '↑' : '↓'} ${Math.abs(Number(metrics.orgCompletionRateDelta)).toFixed(1)}pp` : '—'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[24px] font-bold text-blue-600 tabular-nums">{fmt1(metrics?.healthOrgCompletionRate ?? 0)}</span>
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 shadow-sm group-hover:scale-105 transition-transform">
                            <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div className="grid">
                            <span className="text-[13px] font-semibold text-teal-500 leading-tight">Org On-Time %</span>
                            <span className="text-[11px] text-slate-400 font-medium">vs {prevMonthName}: {metrics?.orgOnTimePctDelta != null ? `${Number(metrics.orgOnTimePctDelta) >= 0 ? '↑' : '↓'} ${Math.abs(Number(metrics.orgOnTimePctDelta)).toFixed(1)}pp` : '—'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[24px] font-bold text-teal-600 tabular-nums">{fmt1(metrics?.healthOrgOnTimePct ?? 0)}</span>
                        <div className="w-1.5 h-8 bg-teal-500 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExportReportsPanel = ({ fromDate, toDate }) => {
    const handleDownload = async (format) => {
        const toastId = toast.loading(`Preparing ${format.charAt(0).toUpperCase() + format.slice(1)} report...`);
        try {
            const params = {};
            if (fromDate) params.from_date = fromDate;
            if (toDate)   params.to_date   = toDate;

            const endpoint = format === 'pdf' ? '/reports/cfo/export-pdf' : '/reports/cfo/export-excel';

            // Helper to read real error from blob response
            const readErr = async (err) => {
                const d = err?.response?.data;
                if (d instanceof Blob && d.size > 0) {
                    try {
                        const text = await d.text();
                        const j = JSON.parse(text);
                        return Array.isArray(j.detail)
                            ? j.detail.map(x => x.msg).join(', ')
                            : (j.detail || j.message || text.slice(0, 200));
                    } catch { /* not JSON */ }
                }
                return err?.message || 'Unknown error';
            };

            try {
                const response = await api.get(endpoint, {
                    params,
                    responseType: 'blob',
                    headers: { 'Accept': 'application/octet-stream' }
                });

                // Small blob = likely a JSON (error or presigned URL)
                if (response.data.type === 'application/json' || response.data.size < 600) {
                    const text = await response.data.text();
                    try {
                        const json = JSON.parse(text);
                        // If it's an error, handle it
                        if (json.detail || json.message) {
                            const msg = Array.isArray(json.detail) ? json.detail.map(d => d.msg).join(', ') : (json.detail || json.message);
                            throw new Error(msg);
                        }
                        // If it's a presigned URL, use it!
                        const downloadUrl = json.download_url || json.data?.download_url;
                        if (downloadUrl) {
                            window.open(downloadUrl, '_blank');
                            toast.success('Download started', { id: toastId });
                            return;
                        }
                    } catch (parseErr) {
                        // If not JSON, continue to regular blob handling
                        if (parseErr instanceof SyntaxError) { /* ignore */ }
                        else throw parseErr;
                    }
                }

                const ext = format === 'excel' ? 'xlsx' : 'pdf';
                const contentType = response.headers['content-type'] ||
                    (format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                const blob = new Blob([response.data], { type: contentType });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `CFO_Report_${fromDate}_${toDate}.${ext}`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success(`${format.charAt(0).toUpperCase() + format.slice(1)} downloaded successfully`, { id: toastId });
            } catch (epErr) {
                const status = epErr?.response?.status;
                const errMsg = await readErr(epErr);
                console.warn(`[CFO Export] ${endpoint} failed (${status}):`, errMsg);

                if (status === 500) {
                    // Backend bug on CFO endpoint — guide the user
                    toast.error(
                        'Report generation failed on the server (500). Use the Performance Dashboard and filter by department to export a department-specific report.',
                        { id: toastId, duration: 8000 }
                    );
                } else {
                    toast.error(errMsg.slice(0, 150), { id: toastId });
                }
            }
        } catch (err) {
            console.error(`Export failed:`, err);
            toast.error(err.message || `Failed to download ${format} report`, { id: toastId });
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 overflow-hidden relative group">
            <h3 className="text-[15px] font-semibold text-slate-700 mb-6 flex items-center gap-2 relative">
                <Layout size={16} className="text-slate-400" />
                Export Reports
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Excel', format: 'xlsx', icon: '📊', color: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100' },
                    { label: 'PDF', format: 'pdf', icon: '📕', color: 'text-rose-600', bg: 'bg-rose-50 hover:bg-rose-100' },
                ].map((ext) => (
                    <button
                        key={ext.format}
                        onClick={() => handleDownload(ext.format === 'xlsx' ? 'excel' : 'pdf')}
                        className={`flex flex-col items-center justify-center py-3 rounded-xl border border-slate-100 transition-all hover:shadow-md hover:scale-[1.05] bg-white group ${ext.bg}`}
                    >
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-sm">{ext.icon}</span>
                            <span className={`text-[11px] font-black capitalize tracking-widest ${ext.color}`}>{ext.label}</span>
                        </div>
                        <div className="w-6 h-0.5 rounded-full bg-slate-200" />
                    </button>
                ))}
            </div>
        </div>
    );
};

const CFODashboard = () => {
    const navigate = useNavigate();
    const handleCreateTask = () => navigate('/tasks/assign');
    const handleManagePerformance = () => navigate('/performance-dashboard');

    const [dashboardData, setDashboardData] = useState(null);
    const [orgMetrics, setOrgMetrics] = useState(null);
    const [trendsData, setTrendsData] = useState([]);
    const [deptPerformance, setDeptPerformance] = useState([]);
    const [todayOrgTasks, setTodayOrgTasks] = useState([]);
    const [allOrgTasks, setAllOrgTasks] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeeRiskData, setEmployeeRiskData] = useState([]);
    const todayTasksRef = useRef([]); // Protections against stale closures in setInterval


    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedEmployeeForIssue, setSelectedEmployeeForIssue] = useState('');
    const [isDeptReviewModalOpen, setIsDeptReviewModalOpen] = useState(false);
    const [selectedDeptForReview, setSelectedDeptForReview] = useState('');

    const handleDeptSelect = (deptName) => {
        setSelectedDeptForReview(deptName);
        setIsDeptReviewModalOpen(true);
    };

    const handleIssueClick = (name) => {
        setSelectedEmployeeForIssue(name);
        setIsIssueModalOpen(true);
    };

    const handleSaveIssue = (issueData) => {
        console.log('Saving executive issue record:', issueData);
        toast.success(`Performance record saved for ${issueData.employee}`, {
            icon: '🛡️',
            style: {
                borderRadius: '1rem',
                background: '#1e293b',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
            },
        });
        // In a real app, we would POST this to an /issues or /performance endpoint
    };

    const handleSaveDeptReview = (reviewData) => {
        console.log('Saving department review:', reviewData);
        toast.success(`Executive review for ${reviewData.department} finalized`, {
            icon: '🏢',
            style: {
                borderRadius: '1rem',
                background: '#064e3b',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
            },
        });
        // In a real app, we would POST this to an /dept-reviews endpoint
    };

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

    const getFirstDayOfMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    };

    const getToday = () => new Date().toISOString().split('T')[0];

    // Priority: 1. localStorage (Global sync), 2. Defaults
    const [fromDate, setFromDate] = useState(localStorage.getItem('dashboard_from_date') || getFirstDayOfMonth());
    const [toDate, setToDate] = useState(localStorage.getItem('dashboard_to_date') || getToday());

    useEffect(() => {
        const handleFilterChange = () => {
            // Dashboard still syncs via event hub, but won't be 'stuck' across refreshes
            setFromDate(localStorage.getItem('dashboard_from_date') || getFirstDayOfMonth());
            setToDate(localStorage.getItem('dashboard_to_date') || getToday());
        };

        window.addEventListener('dashboard-filter-change', handleFilterChange);
        return () => window.removeEventListener('dashboard-filter-change', handleFilterChange);
    }, []);

    const DEPT_COLORS = [
        '#6366f1',
        '#10b981',
        '#f59e0b',
        '#3b82f6',
        '#8b5cf6',
        '#f43f5e',
        '#06b6d4',
        '#f97316',
    ];

    const handleDateChange = (type, value) => {
        if (type === 'from') {
            setFromDate(value);
            localStorage.setItem('dashboard_from_date', value);
            if (value > toDate) {
                const today = getToday();
                setToDate(today);
                localStorage.setItem('dashboard_to_date', today);
            }
        } else {
            if (value >= fromDate) {
                setToDate(value);
                localStorage.setItem('dashboard_to_date', value);
            }
        }
        window.dispatchEvent(new Event('dashboard-filter-change'));
    };

    const { user } = useAuth();
    const fetchDashboardData = async (signal) => {
        // ── Safe Parameter Normalization ────────────────────────────────────────
        // Prevents 422 Unprocessable Entity by ensuring dates are valid ISO strings (YYYY-MM-DD)
        const getValidFromDate = () => {
            const stored = localStorage.getItem('dashboard_from_date');
            if (stored && stored.length === 10) return stored;
            return fromDate && fromDate.length === 10 ? fromDate : getFirstDayOfMonth();
        };
        const getValidToDate = () => {
            const stored = localStorage.getItem('dashboard_to_date');
            if (stored && stored.length === 10) return stored;
            return toDate && toDate.length === 10 ? toDate : getToday();
        };

        const safeFrom = getValidFromDate();
        const safeTo   = getValidToDate();

        setLoading(true);
        const queryParams = {
            from_date:  safeFrom,
            to_date:    safeTo,
            start_date: safeFrom,
            end_date:   safeTo
        };

        try {
            const role = (user?.role || '').toUpperCase();
            const isAdmin = role === 'ADMIN';

            const managerBase = '/dashboard/manager';

            const [dataRes, todayRes, metricsRes, trendsRes, deptsRes, riskRes, empRes] = await Promise.all([
                isAdmin ? Promise.resolve({ data: {} }) : api.get('/dashboard/cfo', { params: queryParams, signal }).catch(() => api.get(managerBase, { params: queryParams, signal }).catch(() => Promise.resolve({ data: {} }))),
                isAdmin ? Promise.resolve({ data: {} }) : api.get('/dashboard/cfo/today', { params: queryParams, signal }).catch(() => api.get(`${managerBase}/today`, { params: queryParams, signal }).catch(() => Promise.resolve({ data: [] }))),
                isAdmin ? Promise.resolve({ data: {} }) : api.get('/dashboard/cfo/org-metrics', { params: queryParams, signal }).catch(() => api.get(`${managerBase}/org-metrics`, { params: queryParams, signal }).catch(() => Promise.resolve({ data: {} }))),
                isAdmin ? Promise.resolve({ data: {} }) : api.get('/dashboard/cfo/trends', { params: queryParams, signal }).catch(() => api.get(`${managerBase}/trends`, { params: queryParams, signal }).catch(() => Promise.resolve({ data: [] }))),
                isAdmin ? Promise.resolve({ data: {} }) : api.get('/dashboard/cfo/departments', { params: queryParams, signal }).catch(() => api.get(`${managerBase}/departments`, { params: queryParams, signal }).catch(() => Promise.resolve({ data: [] }))),
                Promise.resolve({ data: [] }), // riskRes
                api.get('/employees', { signal }).catch(() => Promise.resolve({ data: [] }))
            ]);
            
            // Build a fresh emp-id → name lookup synchronously so it can be used
            // inside buildDeptStatusCounts before React re-renders allEmployees state.
            const freshEmpList = Array.isArray(empRes?.data?.data) ? empRes.data.data
                : Array.isArray(empRes?.data) ? empRes.data : [];
            if (freshEmpList.length > 0) setAllEmployees(freshEmpList);
            const empIdToName = {};
            freshEmpList.forEach(e => {
                const id = e.emp_id || e.id;
                if (id) empIdToName[id] = e.name || id;
            });
            // Employee risk — document section 5
            const riskPayload = riskRes?.data?.data || riskRes?.data || [];
            const riskRows = Array.isArray(riskPayload) ? riskPayload : [];
            const RISK_ORDER = { OFF_TRACK: 0, AT_RISK: 1, WATCH: 2, ON_TRACK: 3 };
            setEmployeeRiskData(
                riskRows
                    .filter(r => r.name && r.name !== 'NO_DATA')
                    .sort((a, b) => {
                        const ra = RISK_ORDER[String(a.risk_status || '').toUpperCase()] ?? 4;
                        const rb = RISK_ORDER[String(b.risk_status || '').toUpperCase()] ?? 4;
                        if (ra !== rb) return ra - rb;
                        if ((b.overdue_tasks ?? 0) !== (a.overdue_tasks ?? 0)) return (b.overdue_tasks ?? 0) - (a.overdue_tasks ?? 0);
                        return (a.performance_score ?? 0) - (b.performance_score ?? 0);
                    })
            );

            const metricsPayload = metricsRes?.data?.data || metricsRes?.data || {};
            setOrgMetrics(metricsPayload);

            const trendsPayload = trendsRes?.data?.data || trendsRes?.data || [];
            setTrendsData(Array.isArray(trendsPayload) ? trendsPayload : []);

            const deptsPayload = deptsRes?.data?.data || deptsRes?.data || [];
            const rawDepts = Array.isArray(deptsPayload) ? deptsPayload : [];

            const dashboardPayload = dataRes?.data?.data || dataRes?.data || {};
            const todayPayload = todayRes?.data?.data || todayRes?.data || todayRes?.data?.tasks || [];
            const todayRows = Array.isArray(todayPayload) ? todayPayload : (Array.isArray(todayPayload?.items) ? todayPayload.items : []);

            const totalTasksFromPayload = dashboardPayload?.total_tasks ?? dashboardPayload?.total ?? 0;
            const hasDashboardStats = totalTasksFromPayload > 0 || (dashboardPayload?.department_stats?.length > 0) || (dashboardPayload?.dept_stats?.length > 0) || !!dashboardPayload?.top_kpis || !!dashboardPayload?.organization_health;



            // Helper: compute per-dept status counts from a flat task array.
            // empLookup maps emp_id → display name (from /employees API) so that
            // when tasks lack assigned_to_name we still get a real name.
            const buildDeptStatusCounts = (normalizedTasks, empLookup = {}) => {
                const byDeptName = {};
                normalizedTasks.forEach(t => {
                    const d = t.department;
                    if (!byDeptName[d]) byDeptName[d] = { total_computed: 0, new_tasks: 0, in_progress_tasks: 0, submitted_tasks: 0, rework_tasks: 0, approved_tasks_computed: 0, employees: {} };
                    const dept = byDeptName[d];

                    const s = String(t.status || '').toUpperCase();
                    dept.total_computed++;
                    if (s === 'APPROVED' || s === 'COMPLETED') dept.approved_tasks_computed++;
                    if (s === 'NEW' || s === 'CREATED') dept.new_tasks++;
                    if (['IN_PROGRESS', 'STARTED', 'PENDING', 'IN-PROGRESS'].includes(s)) dept.in_progress_tasks++;
                    if (s === 'SUBMITTED') dept.submitted_tasks++;
                    if (s === 'REWORK' || s === 'CHANGES_REQUESTED') dept.rework_tasks++;

                    // Group by emp_id; resolve name from task fields, then fallback to empLookup
                    const empId = t.assigned_to || t.emp_id || t.assignee_id || t.assignee || 'Unassigned';
                    const rawName = t.assigneeName || t.assigned_to_name || '';
                    const empName = (rawName && rawName !== 'Unassigned') ? rawName
                        : (empLookup[empId] || empId);
                    if (!dept.employees[empId]) dept.employees[empId] = { name: empName, completed: 0, rework: 0, total: 0 };
                    // Keep the best resolved name (may improve across iterations)
                    if (dept.employees[empId].name === empId || dept.employees[empId].name === 'Unassigned') {
                        dept.employees[empId].name = empName;
                    }
                    dept.employees[empId].total++;
                    if (s === 'APPROVED' || s === 'COMPLETED') dept.employees[empId].completed++;
                    if (s === 'REWORK' || s === 'CHANGES_REQUESTED') dept.employees[empId].rework++;
                });

                // Compute top performer for each dept
                Object.values(byDeptName).forEach(dept => {
                    const sortedEmps = Object.values(dept.employees).map(emp => {
                        const pScore = emp.total > 0 ? Math.max(0, (((emp.completed * 5) - (emp.rework * 2)) / (emp.total * 5)) * 100) : 0;
                        return { ...emp, performanceScore: pScore };
                    }).sort((a, b) => b.performanceScore - a.performanceScore || b.total - a.total);

                    if (sortedEmps.length > 0) {
                        const top = sortedEmps[0];
                        dept.top_performer = { name: top.name, score: Math.round(top.performanceScore) };
                    }
                });

                return byDeptName;
            };

            // Helper: derive status label from completion_pct
            const deriveStatus = (dept) => {
                const s = String(dept.status || '').toUpperCase().replace(' ', '_');
                if (s && s !== 'NO_DATA' && s !== 'NULL' && s !== 'UNDEFINED') return s;
                if (!dept.total_tasks && !dept.total) return 'NO_DATA';
                const pct = dept.completion_pct || 0;
                if (pct >= 70) return 'ON_TRACK';
                if (pct >= 40) return 'AT_RISK';
                return 'OFF_TRACK';
            };

            // Helper: enrich rawDepts with per-status counts from task data
            const enrichDepts = (depts, taskCounts, topHighPerformers = []) => {
                const safeNum = (v) => {
                    const n = parseFloat(v);
                    return isNaN(n) ? 0 : n;
                };

                // Create a map of high performer scores by name for quick lookup
                const topScoresMap = {};
                if (Array.isArray(topHighPerformers)) {
                    topHighPerformers.forEach(p => {
                        const name = (p.name || p.employee_name || '').toLowerCase();
                        if (name) {
                            const pScore = safeNum(p.performance_score ?? p.score ?? p.performance_index);
                            topScoresMap[name] = Math.max(topScoresMap[name] || 0, pScore);
                        }
                    });
                }

                return depts.map(d => {
                    const dName = (d.department_name || d.name || '').toLowerCase();
                    // Also match by department_id (e.g. "AR") — tasks often store only
                    // the short ID as their department key when department_name is absent.
                    const dId   = String(d.department_id || d.id || d.dept_id || '').toLowerCase();

                    // Aggregate all keys that match this department name or ID
                    const matchedKeys = Object.keys(taskCounts).filter(k => {
                        const lk = k.toLowerCase();
                        // name-based match (both directions, but guard against very short keys)
                        const nameMatch = lk === dName
                            || (lk.length > 2 && dName.includes(lk))
                            || lk.includes(dName);
                        // id-based match: "ar" === "ar"
                        const idMatch   = dId && lk === dId;
                        return nameMatch || idMatch;
                    });

                    const aggregated = {
                        total_computed: 0,
                        approved_tasks_computed: 0,
                        rework_tasks: 0,
                        employees: {}
                    };

                    matchedKeys.forEach(k => {
                        const c = taskCounts[k];
                        aggregated.total_computed += safeNum(c.total_computed);
                        aggregated.approved_tasks_computed += safeNum(c.approved_tasks_computed);
                        aggregated.rework_tasks += safeNum(c.rework_tasks);
                        
                        // Merge employees
                        if (c.employees) {
                            Object.entries(c.employees).forEach(([eid, e]) => {
                                if (!aggregated.employees[eid]) {
                                    aggregated.employees[eid] = { ...e };
                                } else {
                                    aggregated.employees[eid].total = safeNum(aggregated.employees[eid].total) + safeNum(e.total);
                                    aggregated.employees[eid].completed = safeNum(aggregated.employees[eid].completed) + safeNum(e.completed);
                                    aggregated.employees[eid].rework = safeNum(aggregated.employees[eid].rework) + safeNum(e.rework);
                                }
                            });
                        }
                    });

                    // 1. Determine base metrics from API
                    let apiApproved = safeNum(d.approved_tasks ?? d.completed_tasks ?? d.completed);
                    let apiTotal    = safeNum(d.total_tasks ?? d.total);
                    let apiRework   = safeNum(d.rework_tasks ?? d.rework);

                    // 2. Determine local metrics from our task subset (includes COMPLETED tasks)
                    let localApproved = safeNum(aggregated.approved_tasks_computed);
                    let localTotal    = safeNum(aggregated.total_computed);
                    let localRework   = safeNum(aggregated.rework_tasks);

                    // 3. Pick the most comprehensive values
                    const finalTotal = Math.max(apiTotal, localTotal);
                    const finalApproved = Math.max(apiApproved, localApproved);
                    const finalRework = Math.max(apiRework, localRework);

                    const computedPerfScore = finalTotal > 0 
                        ? Math.max(0, (((finalApproved * 5) - (finalRework * 2)) / (finalTotal * 5)) * 100)
                        : 0;
                    
                    const apiPerfScore = safeNum(d.performance_score ?? d.performance_index);

                    // 4. Top Performer — API value is the source of truth.
                    //    The backend's department_performance[].top_performer already contains
                    //    the correct winner (e.g. AR Exec 5 / 33.33%).
                    //    Only fall back to our computed value when the API provides no name.
                    let apiTopName = '';
                    let apiTopScore = 0;
                    
                    if (typeof d.top_performer === 'string') {
                        const parts = d.top_performer.split('/');
                        apiTopName = parts[0].trim();
                        apiTopScore = parts.length > 1 ? safeNum(parts[1]) : 0;
                    } else if (d.top_performer && typeof d.top_performer === 'object') {
                        apiTopName = d.top_performer.name || '';
                        apiTopScore = safeNum(d.top_performer.score ?? d.top_performer.performance_score ?? d.top_performer.performance_index);
                    } else if (d.top_performer_name) {
                        apiTopName = d.top_performer_name;
                        apiTopScore = safeNum(d.top_performer_score ?? d.performance_score ?? 0);
                    }

                    let topName  = (apiTopName && apiTopName !== 'N/A') ? apiTopName : '';
                    let topScore = apiTopScore;

                    if (!topName && Object.keys(aggregated.employees).length > 0) {
                        // Fallback: compute from task counts only when API has no top performer name
                        const sortedEmps = Object.values(aggregated.employees).map(emp => {
                            const total = safeNum(emp.total);
                            const pScore = total > 0 ? Math.max(0, (((safeNum(emp.completed) * 5) - (safeNum(emp.rework) * 2)) / (total * 5)) * 100) : 0;
                            return { ...emp, score: pScore };
                        }).sort((a, b) => b.score - a.score || b.total - a.total);

                        if (sortedEmps.length > 0 && sortedEmps[0].score > 0) {
                            topName  = sortedEmps[0].name;
                            topScore = sortedEmps[0].score;
                        }
                    }

                    if (!topName) { topName = 'N/A'; topScore = 0; }

                    const enriched = {
                        ...d,
                        total_tasks: finalTotal,
                        approved_tasks: finalApproved,
                        rework_tasks: finalRework,
                        completion_pct: finalTotal > 0 ? Math.round((finalApproved / finalTotal) * 100) : (d.completion_pct ?? 0),
                        performance_score: Math.max(computedPerfScore, apiPerfScore),
                        top_performer: {
                            name: topName,
                            score: Math.round(topScore)
                        }
                    };
                    enriched.status = deriveStatus(enriched);
                    return enriched;
                });
            };

            const aggregateFromTasks = (rows) => {
                const normalized = rows.map(normalizeRow);
                const counts = { NEW: 0, IN_PROGRESS: 0, SUBMITTED: 0, APPROVED: 0, REWORK: 0, CANCELLED: 0 };
                const byDept = {};

                normalized.forEach(t => {
                    const s = t.status;
                    if (s === 'NEW' || s === 'CREATED') counts.NEW++;
                    else if (['IN_PROGRESS', 'STARTED', 'PENDING', 'IN-PROGRESS'].includes(s)) counts.IN_PROGRESS++;
                    else if (s === 'SUBMITTED') counts.SUBMITTED++;
                    else if (s === 'APPROVED' || s === 'COMPLETED') counts.APPROVED++;
                    else if (s === 'REWORK' || s === 'CHANGES_REQUESTED') counts.REWORK++;
                    else if (s === 'CANCELLED') counts.CANCELLED++;

                    const d = t.department;
                    if (!byDept[d]) byDept[d] = { department_id: d, name: d, department_name: d, total_tasks: 0, approved_tasks: 0, pending_tasks: 0, total: 0, completed: 0, new_tasks: 0, in_progress_tasks: 0, submitted_tasks: 0, rework_tasks: 0 };
                    byDept[d].total_tasks++;
                    byDept[d].total++;
                    if (s === 'APPROVED' || s === 'COMPLETED') { byDept[d].approved_tasks++; byDept[d].completed++; }
                    if (!TERMINAL_STATUSES.has(s)) byDept[d].pending_tasks++;
                    
                    if (s === 'NEW' || s === 'CREATED') byDept[d].new_tasks++;
                    if (['IN_PROGRESS', 'STARTED', 'PENDING', 'IN-PROGRESS'].includes(s)) byDept[d].in_progress_tasks++;
                    if (s === 'SUBMITTED') byDept[d].submitted_tasks++;
                    if (s === 'REWORK' || s === 'CHANGES_REQUESTED') byDept[d].rework_tasks++;
                });

                const totalCount = normalized.length;
                const approvedCount = counts.APPROVED;

                const totalActive = normalized.filter(t => !['APPROVED', 'CANCELLED'].includes(t.status)).length;
                const overdue = normalized.filter((t) => {
                    const due = toDateKey(t.due_date);
                    const today = new Date().toLocaleDateString('en-CA');
                    return (t.is_overdue || t.overdue || (due && due < today)) && !['APPROVED', 'CANCELLED'].includes(t.status);
                }).length;

                const deptArray = Object.values(byDept).map(d => ({
                    ...d,
                    completion_pct: d.total_tasks > 0 ? (d.approved_tasks / d.total_tasks) * 100 : 0,
                    status: deriveStatus(d),
                }));

                setDeptPerformance((rawDepts.length > 0 ? enrichDepts(rawDepts, buildDeptStatusCounts(normalized), dashboardPayload.top_5_employees || []) : deptArray).sort((a, b) => b.completion_pct - a.completion_pct));
                setDashboardData({
                    ...dashboardPayload,
                    total_tasks: totalCount,
                    active_tasks: totalActive,
                    approved_tasks: approvedCount,
                    pending_tasks: counts.SUBMITTED,
                    submitted_tasks: counts.SUBMITTED,
                    cancelled_tasks: counts.CANCELLED,
                    rework_tasks: counts.REWORK,
                    in_progress_tasks: counts.IN_PROGRESS,
                    new_tasks: counts.NEW,
                    overdue_tasks: overdue,
                    org_performance_index: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0,
                    department_stats: Object.values(byDept),
                });
                setTodayOrgTasks(normalized.slice(0, 200));
                setAllOrgTasks(normalized);
            };

            // Always fetch all org tasks to compute per-dept status breakdowns
            // Uses a short 12s timeout so slow requests fail fast rather than blocking for 60s
            const fetchOrgTasks = async (signal) => {
                const scopes = [
                    { ...queryParams, scope: 'org', limit: 200 },
                    { ...queryParams, limit: 200 },
                    { ...queryParams, scope: 'department', limit: 200 },
                    { ...queryParams, scope: 'mine', limit: 200 }
                ];

                try {
                    const results = await Promise.allSettled(
                        scopes.map(params => api.get('/tasks', { params, signal, timeout: 15000 }).catch(() => null))
                    );
                    
                    const allFound = [];
                    results.forEach(res => {
                        if (res.status === 'fulfilled' && res.value?.data) {
                            const d = res.value.data;
                            const items = Array.isArray(d) ? d : (d.data || d.items || d.tasks || []);
                            allFound.push(...items);
                        }
                    });

                    // Deduplicate by ID
                    const seen = new Set();
                    const unique = allFound.filter(t => {
                        const id = t.task_id || t.id || t.id_task;
                        if (!id || seen.has(id)) return false;
                        seen.add(id);
                        return true;
                    });

                    return { data: unique };
                } catch (e) {
                    console.error("fetchOrgTasks failed:", e);
                    return { data: [] };
                }
            };

            const allTasksRes = await fetchOrgTasks(signal);
            const allTasksRaw = allTasksRes?.data
                ? (Array.isArray(allTasksRes.data) ? allTasksRes.data : (allTasksRes.data?.data || []))
                : [];

            // ── Client-side Filter Safeguard ──
            const allTasks = allTasksRaw.filter(t => {
                const dateStr = t.assigned_at || t.assigned_date || t.created_at || t.date || t.due_date;
                if (!dateStr) return true;
                const taskDate = dateStr.split('T')[0];
                return taskDate >= safeFrom && taskDate <= safeTo;
            });

            // ── Compute monthly trends from raw tasks when API returns all-zero fields ──
            // The /cfo/trends endpoint returns rows but with new_tasks=0, pending_submission=0,
            // overdue_tasks=0 (backend bug). Detect this and fall back to client-side aggregation.
            const apiTrendsPayload = Array.isArray(trendsPayload) ? trendsPayload : [];
            const apiTrendsHaveData = apiTrendsPayload.some(t =>
                (Number(t.new_tasks) || 0) + (Number(t.pending_submission) || 0) + (Number(t.overdue_tasks) || 0) > 0
            );

            if (!apiTrendsHaveData && allTasks.length > 0) {
                // Build month skeleton
                const monthMap = {};
                const mStart = new Date(safeFrom); mStart.setDate(1);
                const mEnd   = new Date(safeTo);   mEnd.setDate(1);
                const mCur   = new Date(mStart);
                while (mCur <= mEnd) {
                    const k = `${mCur.getFullYear()}-${String(mCur.getMonth() + 1).padStart(2, '0')}`;
                    monthMap[k] = { new_tasks: 0, pending_submission: 0, overdue_tasks: 0, completed_tasks: 0 };
                    mCur.setMonth(mCur.getMonth() + 1);
                }

                const todayStr = new Date().toISOString().split('T')[0];
                allTasks.forEach(t => {
                    const dateStr = t.assigned_at || t.assigned_date || t.created_at || t.date;
                    if (!dateStr) return;
                    const monthKey = String(dateStr).substring(0, 7);
                    if (!monthMap[monthKey]) return;

                    const status = String(t.status || '').toUpperCase();
                    const due = toDateKey(t.due_date || t.deadline || t.end_date);
                    if (['NEW', 'NOT_STARTED', 'CREATED', 'ASSIGNED'].includes(status) || !status) {
                        monthMap[monthKey].new_tasks++;
                    }
                    if (['SUBMITTED', 'PENDING', 'PENDING_APPROVAL', 'IN_PROGRESS'].includes(status)) {
                        monthMap[monthKey].pending_submission++;
                    }
                    if (due && due < todayStr && !['APPROVED', 'COMPLETED', 'CANCELLED'].includes(status)) {
                        monthMap[monthKey].overdue_tasks++;
                    }
                    if (['APPROVED', 'COMPLETED'].includes(status)) {
                        monthMap[monthKey].completed_tasks++;
                    }
                });

                const computedTrends = Object.entries(monthMap).map(([month, vals]) => ({
                    month,
                    ...vals,
                }));
                console.log('[CFODashboard] API trends were all-zero — using computed trends:', computedTrends);
                setTrendsData(computedTrends);
            }

            // Pass 1: Build lookup map for ID -> Title
            const taskMap = {};
            [...todayRows, ...allTasks].forEach(t => {
                const id = t.task_id || t.id;
                const title = t.task_title || t.subtask_title || t.title || t.task_name || t.name || t.directive_title || t.directive_name;
                if (id && title) taskMap[id] = title;
            });



            // Pass 2: Normalize
            // Pass 2: Normalize
            const normalizeRow = (t) => {
                const pid =
                    t.parent_task_id ||
                    t.parent_id ||
                    (t.parent_task ? (t.parent_task.task_id || t.parent_task.id) : null);

                let ptitle =
                    t.parent_task_title ||
                    t.parentTaskTitle ||
                    t.parent_task_name ||
                    t.parent_title ||
                    t.parent_name ||
                    t.parent_directive_title ||
                    t.parent_directive_name ||
                    (t.parent_task
                        ? (t.parent_task.task_title ||
                            t.parent_task.title ||
                            t.parent_task.task_name ||
                            t.parent_task.name ||
                            t.parent_task.directive_title)
                        : '') ||
                    taskMap[pid] ||
                    '';

                // Robust Department Extraction
                const deptCandidates = [
                    t.department_name,
                    t.department,
                    t.dept_name,
                    t.dept,
                    t.owner_dept,
                    t.assigned_dept,
                    t.department_id ? `Dept-${t.department_id}` : null
                ];
                let finalDept = 'Accounts';
                for (const c of deptCandidates) {
                    if (c && c !== 'N/A' && c !== 'undefined' && c !== 'null') {
                        finalDept = typeof c === 'object' ? (c.name || JSON.stringify(c)) : String(c).trim();
                        break;
                    }
                }

                return {
                    ...t,
                    task_id: t.task_id || t.id,
                    title: t.title || 'Untitled Task',
                    status: String(t.status || '').toUpperCase(),
                    department: finalDept,
                    priority: String(t.priority || t.severity || 'Medium'),
                    assigneeName: t.assigned_to_name || t.assignee || 'Unassigned',
                    parent_task_id: pid || '-',
                    parent_task_title: ptitle || '-',
                };
            };

            const allNormalized = allTasks.map(normalizeRow);
            const taskCountsByDept = buildDeptStatusCounts(allNormalized, empIdToName);

            if (hasDashboardStats) {
                setDashboardData(dashboardPayload);
                const tasksForToday = todayRows.length > 0 ? todayRows.map(normalizeRow) : allNormalized;
                setTodayOrgTasks(tasksForToday.slice(0, 200));
                setAllOrgTasks(allNormalized);
                // Enrich rawDepts with computed per-status counts
                setDeptPerformance(enrichDepts(rawDepts, allNormalized.length > 0 ? taskCountsByDept : buildDeptStatusCounts(tasksForToday, empIdToName), dashboardPayload.top_5_employees || []));
                return;
            }

            if (todayRows.length > 0) { aggregateFromTasks(todayRows); return; }
            if (allNormalized.length > 0) { aggregateFromTasks(allTasks); return; }

            // Fallback: still enrich rawDepts even if no task data
            setDeptPerformance(rawDepts.map(d => ({ ...d, status: deriveStatus(d), new_tasks: 0, in_progress_tasks: 0, submitted_tasks: 0, rework_tasks: 0 })));
            setDashboardData({
                ...dashboardPayload,
                total_tasks: 0, approved_tasks: 0, pending_tasks: 0, rework_tasks: 0,
                in_progress_tasks: 0, new_tasks: 0, org_performance_index: 0, department_stats: []
            });
            setTodayOrgTasks([]);

        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') return; // stale request, ignore
            console.error("CFO Dashboard Error:", err);
        } finally {


            setLoading(false);
        }
    };




    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const run = () => fetchDashboardData(signal);
        run();

        // Poll every 60s — longer than the 12s org-task timeout so requests never stack
        const dashboardInterval = setInterval(run, 60000);

        return () => {
            controller.abort();
            clearInterval(dashboardInterval);
        };
    }, [fromDate, toDate]);




    const { workloadData, orgStatusData, globalStats, kpis, topPerformers, empMap } = useMemo(() => {
        // Build a robust mapping of emp_id -> { name, dept } 
        const eMap = {};
        
        // 1. Populate from complete employees list (Best source for Names)
        allEmployees.forEach(e => {
            const id = e.emp_id || e.id;
            if (id) {
                eMap[id] = {
                    id,
                    name: e.name || e.full_name || id,
                    dept: e.department || e.department_name || e.role || 'Employee'
                };
            }
        });

        // 2. Supplement from tasks (Captures display names used in real-time)
        allOrgTasks.forEach(t => {
            const id = t.assigned_to || t.emp_id || t.assignee_id || t.assignee;
            if (id && !eMap[id]) {
                eMap[id] = {
                    id,
                    name: t.assigned_to_name || t.assigneeName || t.employee_name || id,
                    dept: t.department || t.department_name || 'General'
                };
            }
        });

        if (!dashboardData) return { 
            workloadData: [], 
            orgStatusData: [], 
            globalStats: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, in_progress_tasks: 0, overallScore: 0 }, 
            kpis: { riskSummary: {} }, 
            topPerformers: [],
            empMap: eMap
        };
        const deptSource = dashboardData.department_stats || [];

        const workloadData = deptSource.map((d, i) => ({
            name: d.name || d.department_id || 'Unknown',
            Completed: d.approved_tasks || d.completed || 0,
            Pending: d.in_progress_tasks || d.pending || 0,
            Rework: d.rework_tasks || 0,
            Total: d.total || d.total_tasks || 0,
            fill: DEPT_COLORS[i % DEPT_COLORS.length],
        }));

        const orgStatusData = [
            { name: 'Approved', value: dashboardData.approved_tasks || 0, fill: '#10b981' },
            { name: 'Pending', value: dashboardData.pending_tasks || 0, fill: '#f59e0b' },
            { name: 'Rework', value: dashboardData.rework_tasks || 0, fill: '#ef4444' },
            { name: 'In Progress', value: dashboardData.in_progress_tasks || 0, fill: '#6366f1' },
            { name: 'Not Started', value: dashboardData.new_tasks || 0, fill: '#3b82f6' },
        ].filter(d => d.value > 0);

        const departmentsOnTrack = deptSource.filter(d => {
            const total = d.total_tasks || d.total || 0;
            const approved = d.approved_tasks || d.completed || 0;
            return total > 0 && (approved / total) >= 0.7;
        }).length;

        // ── Document mapping: top_kpis + kpi_deltas from /dashboard/cfo ──
        const topKpis     = dashboardData.top_kpis    || {};
        const kpiDeltas   = dashboardData.kpi_deltas  || {};
        const orgHealth   = dashboardData.organization_health || {};
        const riskSummary = dashboardData.risk_summary || {};
        const top5Emps    = dashboardData.top_5_employees || [];

        const totalTasks = Number(dashboardData.total_tasks ?? dashboardData.total ?? 0);
        const approvedTasks = Number(dashboardData.approved_tasks ?? dashboardData.completed_tasks ?? dashboardData.completed ?? 0);
        const inferredActiveTasks = Number(
            dashboardData.active_tasks
            ?? (Number(dashboardData.in_progress_tasks ?? 0)
                + Number(dashboardData.submitted_tasks ?? 0)
                + Number(dashboardData.rework_tasks ?? 0))
        );
        const inferredCompletionRate = totalTasks > 0 ? (approvedTasks / totalTasks) * 100 : 0;
        const inferredEmployeesAtRisk = (() => {
            const byEmployee = {};
            const todayStr = new Date().toLocaleDateString('en-CA');
            todayOrgTasks.forEach(t => {
                const name = t.assigneeName || t.assigned_to_name || 'Unknown';
                if (!byEmployee[name]) byEmployee[name] = { overdue: 0, rework: 0 };
                const due = toDateKey(t.due_date);
                const isTaskOverdue = (t.is_overdue || t.overdue || (due && due < todayStr)) && !['APPROVED', 'CANCELLED'].includes(t.status);
                if (isTaskOverdue) byEmployee[name].overdue++;
                if (t.status === 'REWORK' || t.status === 'CHANGES_REQUESTED') byEmployee[name].rework++;
            });
            return Object.values(byEmployee).filter(emp => {
                const healthScore = Math.max(0, 100 - (emp.overdue * 15) - (emp.rework * 10));
                return healthScore < 70;
            }).length;
        })();

        // Derived fallbacks so the dashboard still works even if backend returns flat keys
        const kpis = {
            // Top KPI values (document section 2 & 3)
            // Top KPI values
            activeTasks:          topKpis.active_tasks ?? inferredActiveTasks,
            approvedTasks:        topKpis.approved_tasks ?? approvedTasks,
            departmentsOnTrack:   topKpis.departments_on_track ?? departmentsOnTrack,
            employeesAtRisk:      topKpis.employees_at_risk ?? dashboardData.employees_at_risk ?? inferredEmployeesAtRisk,
            orgPerformanceScore:  orgHealth.org_performance_score ?? dashboardData.org_performance_index ?? 0,
            orgCompletionRate:    orgHealth.org_completion_rate ?? dashboardData.org_completion_rate ?? inferredCompletionRate,
            orgOnTimePct:         orgHealth.org_on_time_pct ?? dashboardData.org_on_time_pct ?? orgMetrics?.org_avg_on_time_pct ?? 0,

            // Delta values
            activeTasksDelta:        kpiDeltas.active_tasks_delta_pct,
            approvedTasksDelta:      kpiDeltas.approved_tasks_delta_pct,
            departmentsOnTrackDelta: kpiDeltas.departments_on_track_delta,
            employeesAtRiskDelta:    kpiDeltas.employees_at_risk_delta,
            orgPerfScoreDelta:       kpiDeltas.org_performance_score_delta_pp,
            orgCompletionRateDelta:  kpiDeltas.org_completion_rate_delta_pp,
            orgOnTimePctDelta:       kpiDeltas.org_on_time_pct_delta_pp,

            // Organization Health Card (section 7)
            healthOrgPerformanceScore: orgHealth.org_performance_score ?? 0,
            healthOrgCompletionRate:   orgHealth.org_completion_rate ?? 0,
            healthOrgOnTimePct:        orgHealth.org_on_time_pct ?? 0,

            // Risk Summary (section 3)
            riskSummary: {
                onTrack:  riskSummary.on_track ?? deptPerformance.filter(d => (d.completion_pct || 0) >= 70).length,
                watch:    riskSummary.watch ?? deptPerformance.filter(d => (d.completion_pct || 0) >= 50 && (d.completion_pct || 0) < 70).length,
                atRisk:   riskSummary.at_risk ?? deptPerformance.filter(d => (d.completion_pct || 0) >= 25 && (d.completion_pct || 0) < 50).length,
                offTrack: riskSummary.off_track ?? deptPerformance.filter(d => (d.completion_pct || 0) < 25).length,
            },

            // Legacy fields used elsewhere in the component
            new:             dashboardData.new_tasks       || 0,
            inProgress:      dashboardData.in_progress_tasks || 0,
            submitted:       dashboardData.submitted_tasks  || 0,
            rework:          dashboardData.rework_tasks     || 0,
            overdue:         dashboardData.overdue_tasks    || 0,
            avgOnTime:       orgMetrics?.org_avg_on_time_pct ?? 0,
            avgRework:       orgMetrics?.org_avg_rework_rate ?? 0,
        };

        const topPerformers = (() => {
            // Section 8: Top High Performers
            if (top5Emps && top5Emps.length > 0) {
                return top5Emps.map((emp, i) => {
                    // Join with employeeRiskData to derive department
                    const riskMatch = employeeRiskData.find(r => (r.emp_id && String(r.emp_id) === String(emp.emp_id)) || (r.name && r.name === emp.name)) || {};
                    
                    // Fallback to searching allOrgTasks to find the real employee name
                    let taskMatchName = null;
                    const lookupId = emp.emp_id || emp.employee_id || emp.name;
                    const resolvedEmp = eMap[lookupId] || Object.values(eMap).find(e => e.name === emp.name) || {};
                    
                    let finalName = resolvedEmp.name || emp.name;
                    // If name still looks like an ID, use fallback
                    if (!finalName || /^[A-Z_0-9]+$/.test(finalName)) {
                        finalName = emp.employee_name || emp.emp_name || emp.full_name || emp.name || 'Unknown Employee';
                    }

                    // Calculate true performance score from allOrgTasks to override incorrect API completion %
                    let perfCompleted = 0, perfRework = 0, perfTotal = 0;
                    allOrgTasks.forEach(t => {
                        const tId = t.assigned_to || t.emp_id || t.assignee_id || t.assignee;
                        if (String(tId) === String(lookupId)) {
                            perfTotal++;
                            const s = String(t.status || '').toUpperCase();
                            if (s === 'APPROVED' || s === 'COMPLETED') perfCompleted++;
                            if (s === 'REWORK' || s === 'CHANGES_REQUESTED') perfRework++;
                        }
                    });
                    
                    const safeVal = (v) => {
                        const n = parseFloat(v);
                        return isNaN(n) ? 0 : n;
                    };
                    
                    let truePerfScore = perfTotal > 0 
                        ? Math.max(0, (((perfCompleted * 5) - (perfRework * 2)) / (perfTotal * 5)) * 100)
                        : safeVal(emp.performance_score ?? emp.score ?? emp.performance_index);

                    return {
                        rank: i + 1,
                        name: finalName,
                        role: resolvedEmp.dept || emp.department || emp.department_name || 'Employee',
                        score: Math.round(truePerfScore),
                        completed: perfCompleted || emp.approved_tasks || 0,
                        total: perfTotal || emp.total_tasks || 0,
                    };
                });
            }
            return [];
        })();

        return {
            workloadData,
            orgStatusData,
            globalStats: {
                totalTasks: dashboardData.total_tasks || 0,
                completedTasks: dashboardData.approved_tasks || 0,
                pendingTasks: dashboardData.pending_tasks || 0,
                in_progress_tasks: dashboardData.in_progress_tasks || 0,
                overallScore: dashboardData.org_performance_index || 0,
            },
            kpis,
            topPerformers,
            empMap: eMap
        };
    }, [dashboardData, orgMetrics, todayOrgTasks, allOrgTasks, deptPerformance, employeeRiskData]);

    // ── Sync dept top_performer scores with the computed topPerformers list ──────────────
    // topPerformers is computed by scanning allOrgTasks per emp_id (same weighted formula).
    // deptPerformance.top_performer.score came from enrichDepts which used raw API scores.
    // This memo patches the dept table to always match the High Performers card scores.
    const syncedDeptPerformance = useMemo(() => {
        if (!topPerformers || topPerformers.length === 0) return deptPerformance;

        // Create a map of the best performer per department from the global topPerformers list
        const bestPerDept = {};
        topPerformers.forEach(p => {
            if (p.name && p.role) {
                const deptKey = p.role.toLowerCase().trim();
                if (!bestPerDept[deptKey] || p.score > bestPerDept[deptKey].score) {
                    bestPerDept[deptKey] = p;
                }
            }
        });

        return deptPerformance.map(dept => {
            const deptNameKey = (dept.department || dept.department_name || dept.name || '').toLowerCase().trim();
            const bestGlobalForDept = bestPerDept[deptNameKey];
            
            const currentTp = dept.top_performer || { name: '', score: 0 };
            
            // If the global top performers list has a better performer for this department,
            // or if the current department top performer has no name, we completely replace it.
            if (bestGlobalForDept && (bestGlobalForDept.score > (currentTp.score || 0) || !currentTp.name || currentTp.name === 'N/A' || currentTp.name === 'Unknown')) {
                return {
                    ...dept,
                    top_performer: {
                        name: bestGlobalForDept.name,
                        score: bestGlobalForDept.score
                    }
                };
            }

            // Otherwise, we just sync the score if the names match
            if (bestGlobalForDept && currentTp.name && bestGlobalForDept.name.toLowerCase() === currentTp.name.toLowerCase()) {
                const finalScore = Math.max(currentTp.score ?? 0, bestGlobalForDept.score);
                if (finalScore !== currentTp.score) {
                    return {
                        ...dept,
                        top_performer: { ...currentTp, score: finalScore }
                    };
                }
            }

            return dept;
        });
    }, [deptPerformance, topPerformers]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-10 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-slate-500 font-semibold capitalize tracking-[0.2em] text-[10px]">Syncing Executive Intelligence...</p>
        </div>
    );

    const topDept = [...syncedDeptPerformance].sort((a, b) => b.completion_pct - a.completion_pct)[0];
    const bottomDept = [...syncedDeptPerformance].sort((a, b) => a.completion_pct - b.completion_pct)[0];

    // Calculate Employees At Risk Count for the KPI card
    const employeesAtRiskCount = (() => {
        const byEmployee = {};
        const todayStr = new Date().toLocaleDateString('en-CA');
        todayOrgTasks.forEach(t => {
            const name = t.assigneeName || t.assigned_to_name || 'Unknown';
            if (!byEmployee[name]) byEmployee[name] = { overdue: 0, rework: 0 };
            
            const due = toDateKey(t.due_date);
            const isTaskOverdue = (t.is_overdue || t.overdue || (due && due < todayStr)) && !['APPROVED', 'CANCELLED'].includes(t.status);
            
            if (isTaskOverdue) byEmployee[name].overdue++;
            if (t.status === 'REWORK' || t.status === 'CHANGES_REQUESTED') byEmployee[name].rework++;
        });
        return Object.values(byEmployee).filter(emp => {
            const healthScore = Math.max(0, 100 - (emp.overdue * 15) - (emp.rework * 10));
            return healthScore < 70;
        }).length;
    })();

    const prevMonthName = (() => {
        if (!fromDate) return 'Prev Month';
        const d = new Date(fromDate);
        d.setMonth(d.getMonth() - 1);
        return d.toLocaleString('en-US', { month: 'short' });
    })();

    return (
        <div className="space-y-4 pb-8">
            <div className="space-y-4">
                        {/* ── HEADER FILTERS: Premium Date Picker ── */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                             <div>
                                 <h2 className="text-[26px] font-bold text-slate-800 tracking-tight leading-none mb-1.5">CFO Executive Console</h2>
                                 <p className="text-[13px] text-slate-500 font-medium">Organization-wide performance and task intelligence</p>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                 <span className="text-[13px] font-medium text-slate-500">Date Range</span>
                                 <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
                                     <Calendar size={16} className="text-slate-400" />
                                     <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                                         <input type="date" className="bg-transparent border-none p-0 focus:ring-0 w-[105px] text-center" value={fromDate} onChange={(e) => handleDateChange('from', e.target.value)} />
                                         <span className="text-slate-400">-</span>
                                         <input type="date" className="bg-transparent border-none p-0 focus:ring-0 w-[105px] text-center" value={toDate} onChange={(e) => handleDateChange('to', e.target.value)} />
                                     </div>
                                     <ChevronDown size={14} className="text-slate-400 ml-2" />
                                 </div>
                             </div>
                        </div>

                        {/* ── KPI ROW: 6 cards per mapping document ── */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                {
                                    label: 'Active Tasks',
                                    value: kpis.activeTasks,
                                    delta: kpis.activeTasksDelta,
                                    deltaFormat: 'pct',
                                    icon: CheckSquare,
                                    bg: 'bg-[#3b52d9]',
                                    path: `/tasks/team?status=&from_date=${fromDate}&to_date=${toDate}`
                                },
                                {
                                    label: 'Approved Tasks',
                                    value: kpis.approvedTasks,
                                    delta: kpis.approvedTasksDelta,
                                    deltaFormat: 'pct',
                                    icon: CheckCircle,
                                    bg: 'bg-[#10b981]',
                                    path: `/tasks/team?status=APPROVED&from_date=${fromDate}&to_date=${toDate}`
                                },
                                {
                                    label: 'Departments On Track',
                                    value: kpis.departmentsOnTrack,
                                    delta: kpis.departmentsOnTrackDelta,
                                    deltaFormat: 'num',
                                    icon: Target,
                                    bg: 'bg-[#8b5cf6]',
                                    path: '/performance-dashboard'
                                },
                                {
                                    label: 'Employees At Risk',
                                    value: kpis.employeesAtRisk,
                                    delta: kpis.employeesAtRiskDelta,
                                    deltaFormat: 'num',
                                    icon: AlertTriangle,
                                    bg: 'bg-[#f43f5e]',
                                    path: '/performance-dashboard#employee-risk'
                                },
                                {
                                    label: 'Org Performance Score',
                                    value: `${Number(kpis.orgPerformanceScore).toFixed(1)}%`,
                                    delta: kpis.orgPerfScoreDelta,
                                    deltaFormat: 'pp',
                                    icon: Activity,
                                    bg: 'bg-[#0ea5e9]',
                                    path: '/performance-dashboard'
                                },
                                {
                                    label: 'Org Completion Rate',
                                    value: `${Number(kpis.orgCompletionRate).toFixed(1)}%`,
                                    delta: kpis.orgCompletionRateDelta,
                                    deltaFormat: 'pp',
                                    icon: BarChart2,
                                    bg: 'bg-[#06b6d4]',
                                    path: '/performance-dashboard'
                                },
                            ].map((item, idx) => {
                                const handleAction = () => {
                                    if (item.path.startsWith('#')) {
                                        const el = document.getElementById(item.path.slice(1));
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    } else {
                                        navigate(item.path);
                                    }
                                };
                                return (
                                <div
                                    key={idx}
                                    onClick={handleAction}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAction(); }}
                                    className={`group relative overflow-hidden rounded-xl ${item.bg} text-white shadow-sm py-4 px-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                                                <item.icon size={16} strokeWidth={2} />
                                            </div>
                                            <span className="text-[13px] font-medium leading-tight max-w-[80px]">{item.label}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[32px] font-bold tabular-nums tracking-tight leading-none mb-2">
                                                {item.value}
                                            </div>
                                            <div className="text-[11px] font-medium text-white/90 flex items-center gap-1">
                                                {item.delta == null 
                                                    ? '—' 
                                                    : (
                                                        <>
                                                            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-bold inline-flex items-center gap-0.5 leading-none">
                                                                {Number(item.delta) >= 0 ? '▲' : '▼'} {Math.abs(Number(item.delta)).toFixed(item.deltaFormat === 'pp' ? 1 : 0)}{item.deltaFormat === 'pct' ? '%' : item.deltaFormat === 'pp' ? 'pp' : ''}
                                                            </span>
                                                            <span className="opacity-80 text-[10px]">vs {prevMonthName}</span>
                                                        </>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* ── Secondary Summary Strip (Section 3) ── */}
                        <div className="flex items-center gap-6 bg-white rounded-2xl px-6 py-4 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
                                <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500">
                                    <Clock size={12} />
                                </div>
                                <p className="text-[13px] font-medium text-slate-500">Org On-Time %</p>
                                <span className="text-[20px] font-bold text-slate-800 ml-2">{Number(kpis.orgOnTimePct).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-12 flex-1">
                                {[
                                    { label: 'On Track', count: kpis.riskSummary.onTrack, color: 'text-emerald-700', dot: 'bg-emerald-500', labelText: 'Depts' },
                                    { label: 'Watch', count: kpis.riskSummary.watch, color: 'text-blue-500', dot: 'bg-blue-500', labelText: 'Depts' },
                                    { label: 'At Risk', count: kpis.riskSummary.atRisk, color: 'text-amber-500', dot: 'bg-amber-500', labelText: 'Depts' },
                                    { label: 'Off Track', count: kpis.riskSummary.offTrack, color: 'text-rose-500', dot: 'bg-rose-500', labelText: 'Depts' },
                                ].map((r, i) => {
                                    const isNull = r.count == null;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${isNull ? 'bg-slate-300' : r.dot}`} />
                                                <span className="text-[12px] font-semibold text-slate-700">{r.label}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">{isNull ? '—' : `${r.count} ${r.count === 1 ? r.labelText.replace('s', '') : r.labelText}`}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── ROW 2: Trends + Risk Monitor ── */}
                        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-4">
                            <TaskTrendsChart data={trendsData} fromDate={fromDate} toDate={toDate} />
                            
                            <div id="employee-risk-monitor" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[520px] scroll-mt-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[15px] font-bold text-slate-800">
                                        Employee Risk Monitor
                                    </h3>
                                    <button onClick={() => navigate('/performance-dashboard')} className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View All</button>
                                </div>

                                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-3 mb-2 px-1 text-center">
                                    <div className="flex-1 min-w-0">Employee</div>
                                    <div className="w-[56px] shrink-0">Active</div>
                                    <div className="w-[60px] shrink-0">Score</div>
                                    <div className="w-[76px] shrink-0">Status</div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-1">
                                    {(() => {
                                        // Section 5: use API employee-risk data; fallback to computed from tasks
                                        const RISK_STATUS_CONFIG = {
                                            ON_TRACK:  { label: 'On Track',  bg: 'bg-emerald-50 text-emerald-600' },
                                            WATCH:     { label: 'Watch',     bg: 'bg-blue-50 text-blue-600' },
                                            AT_RISK:   { label: 'At Risk',   bg: 'bg-orange-50 text-orange-600' },
                                            OFF_TRACK: { label: 'Off Track', bg: 'bg-rose-50 text-rose-600' },
                                        };

                                        const items = employeeRiskData.length > 0
                                            ? employeeRiskData.slice(0, 8).map(r => {
                                                // Calculate true performance score from allOrgTasks
                                                let perfCompleted = 0;
                                                let perfRework = 0;
                                                let perfTotal = 0;
                                                const lookupId = r.emp_id || r.name;
                                                if (lookupId) {
                                                    allOrgTasks.forEach(t => {
                                                        if (String(t.assigned_to) === String(lookupId) || 
                                                            String(t.emp_id) === String(lookupId) || 
                                                            String(t.assignee_id) === String(lookupId) ||
                                                            String(t.assignee) === String(lookupId)) {
                                                            perfTotal++;
                                                            if (t.status === 'APPROVED') perfCompleted++;
                                                            if (t.status === 'REWORK' || t.status === 'CHANGES_REQUESTED') perfRework++;
                                                        }
                                                    });
                                                }
                                                
                                                let truePerfScore = 0;
                                                if (perfTotal > 0) {
                                                    truePerfScore = Math.max(0, (((perfCompleted * 5) - (perfRework * 2)) / (perfTotal * 5)) * 100);
                                                } else {
                                                    truePerfScore = r.performance_score ?? r.score ?? 0;
                                                }

                                                return {
                                                    name:        r.name,
                                                    role:        r.role || r.department || '',
                                                    activeTasks: r.active_tasks ?? 0,
                                                    score:       Math.round(truePerfScore),
                                                    riskStatus:  String(r.risk_status || 'ON_TRACK').toUpperCase(),
                                                };
                                            })
                                            : Object.values((() => {
                                                // fallback: compute from loaded tasks
                                                const byEmp = {};
                                                const todayStr = new Date().toLocaleDateString('en-CA');
                                                todayOrgTasks.forEach(t => {
                                                    const name = t.assigneeName || t.assigned_to_name || 'Unknown';
                                                    if (!byEmp[name]) byEmp[name] = { name, overdue: 0, active: 0, completed: 0, rework: 0, total: 0 };
                                                    byEmp[name].total++;
                                                    if (['APPROVED','COMPLETED'].includes(t.status)) byEmp[name].completed++;
                                                    else byEmp[name].active++;
                                                    if (['REWORK', 'CHANGES_REQUESTED'].includes(t.status)) byEmp[name].rework++;
                                                    const due = toDateKey(t.due_date);
                                                    if ((due && due < todayStr) && !['APPROVED','CANCELLED'].includes(t.status)) byEmp[name].overdue++;
                                                });
                                                return byEmp;
                                              })()).map(e => {
                                                const pScore = e.total > 0 ? Math.max(0, (((e.completed * 5) - (e.rework * 2)) / (e.total * 5)) * 100) : 0;
                                                return {
                                                    name: e.name, role: '', activeTasks: e.active,
                                                    score: Math.round(pScore),
                                                    riskStatus: e.overdue === 0 ? 'ON_TRACK' : e.overdue === 1 ? 'WATCH' : e.overdue === 2 ? 'AT_RISK' : 'OFF_TRACK',
                                                };
                                              }).sort((a,b) => {
                                                const O={OFF_TRACK:0,AT_RISK:1,WATCH:2,ON_TRACK:3};
                                                return (O[a.riskStatus]??4)-(O[b.riskStatus]??4);
                                              }).slice(0, 8);

                                        if (items.length === 0) return (
                                            <div className="py-8 text-center text-slate-400 opacity-50">
                                                <Activity size={24} className="mx-auto mb-2" />
                                                <p className="text-[11px] font-bold">No data available</p>
                                            </div>
                                        );

                                        return items.map((emp, i) => {
                                            const cfg = RISK_STATUS_CONFIG[emp.riskStatus] || { label: emp.riskStatus, bg: 'bg-slate-100 text-slate-600' };
                                            return (
                                                <div key={i} className="flex items-center gap-1 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg transition-all px-1">
                                                    <div className="flex items-center justify-center gap-3 flex-1 min-w-0 px-2">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0 overflow-hidden">
                                                            <span className="opacity-60">{emp.name.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                        <div className="grid text-center">
                                                            <p className="text-[12px] font-semibold text-slate-800 leading-tight mb-0.5">{emp.name}</p>
                                                            {emp.role && <p className="text-[10px] text-slate-500 capitalize tracking-tight leading-none">{emp.role}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="w-[56px] text-center text-[12px] font-medium text-slate-700 shrink-0">{emp.activeTasks}</div>
                                                    <div className="w-[60px] text-center text-[12px] font-medium text-slate-800 shrink-0">{emp.score}%</div>
                                                    <div className="w-[76px] text-center shrink-0">
                                                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap inline-block ${cfg.bg}`}>{cfg.label}</span>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* ── ROW 3: Dept Performance + Org Health/Export ── */}
                        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px] gap-4">
                            {/* Department Performance Table Component (Now on Bottom Left) */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-auto">
                                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Department Performance
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left font-sans">
                                        <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                                            <tr className="text-[11px] font-extrabold text-slate-400 capitalize tracking-tighter">
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Department</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Top Performer</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Due Tasks</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Approved</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Overdue</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">On-Time %</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-1.5 cursor-help hover:text-slate-500 transition-colors relative group w-fit mx-auto">
                                                        Perf. Score % 
                                                        <Info size={13} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                                                        
                                                        {/* Tooltip anchored to the right edge of the text/icon so it expands left */}
                                                        <div className="absolute top-full right-[-10px] mt-2 w-[290px] bg-[#1a233a] text-white text-[11px] font-medium leading-[1.6] tracking-wide rounded-xl p-3.5 shadow-2xl z-50 text-left border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-normal">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <span>Performance Score = ((Completion Score - Rework Penalty) / Ideal Total Score) x 100</span>
                                                            </div>
                                                            {/* Upward pointing arrow aligned near the Info icon */}
                                                            <div className="absolute bottom-full right-[12px] border-[6px] border-transparent border-b-[#1a233a]" />
                                                        </div>
                                                    </div>
                                                </th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap">Completion Rate</th>
                                                <th className="py-2 px-4 text-center whitespace-nowrap min-w-[80px]">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {syncedDeptPerformance.map((dept, idx) => {
                                                // Section 6: use risk_status from API; fallback to derived status
                                                const rawStatus = String(dept.risk_status || dept.status || 'NO_DATA').toUpperCase().replace(' ', '_');
                                                const statusStyles = {
                                                    ON_TRACK: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                                    AT_RISK:  'bg-amber-100 text-amber-600 border-amber-200',
                                                    OFF_TRACK:'bg-rose-50 text-rose-600 border-rose-100',
                                                    WATCH:    'bg-blue-50 text-blue-600 border-blue-100',
                                                    NO_DATA:  'bg-slate-50 text-slate-400 border-slate-100',
                                                };
                                                const fmt1 = (v) => v != null ? Number(v).toFixed(1) : '—';
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleDeptSelect(dept.department_id || dept.id || dept.name)}>
                                                        <td className="py-2 px-4 text-center">
                                                            <span className="font-bold text-slate-700 text-[12.5px] whitespace-nowrap">{dept.department_name || dept.name}</span>
                                                        </td>
                                                        <td className="py-2 px-4 text-center">
                                                            {dept.top_performer ? (
                                                                <div className="flex flex-col items-center justify-center whitespace-nowrap">
                                                                    <span className="text-[10px] font-bold text-slate-800 tracking-tight">
                                                                        {/* Try to resolve name from empMap for better accuracy */}
                                                                        {(() => {
                                                                            const rawName = dept.top_performer.name;
                                                                            const resolved = Object.values(empMap).find(e => e.name === rawName || String(e.id) === String(rawName));
                                                                            return resolved?.name || rawName;
                                                                        })()}
                                                                    </span>
                                                                    <span className="text-[8px] text-indigo-500 font-black uppercase">{Math.round(dept.top_performer.score ?? 0)}%</span>
                                                                </div>
                                                            ) : <span className="text-slate-300 text-[8px] italic">—</span>}
                                                        </td>
                                                        <td className="py-2 px-4 text-center text-[10px] font-semibold text-slate-600">{dept.due_task_count ?? dept.total_tasks ?? 0}</td>
                                                        <td className="py-2 px-4 text-center text-[10px] font-semibold text-emerald-600">{dept.approved_tasks ?? 0}</td>
                                                        <td className="py-2 px-4 text-center text-[10px] font-bold text-rose-500">{dept.overdue_tasks ?? 0}</td>
                                                        <td className="py-2 px-4 text-center text-[10px] font-semibold text-sky-600">{fmt1(dept.on_time_pct ?? dept.on_time ?? null)}%</td>
                                                        <td className="py-2 px-4 text-center text-[10px] font-semibold text-violet-600" title="(Completion Score - Rework Penalty) / Ideal Total Score × 100">{fmt1(dept.performance_score ?? null)}%</td>
                                                        <td className="py-2 px-4">
                                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden max-w-[48px]">
                                                                    <div className={`h-full rounded-full transition-all duration-700 ${rawStatus === 'ON_TRACK' ? 'bg-emerald-500' : rawStatus === 'AT_RISK' ? 'bg-amber-400' : 'bg-rose-500'}`}
                                                                        style={{ width: `${dept.completion_rate ?? dept.completion_pct ?? 0}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-slate-400">{fmt1(dept.completion_rate ?? dept.completion_pct ?? null)}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-4 text-center">
                                                            <span className={`inline-block whitespace-nowrap text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize tracking-tight border ${statusStyles[rawStatus] || statusStyles.NO_DATA}`}>
                                                                {rawStatus.toLowerCase().replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <OrganizationHealth metrics={kpis} prevMonthName={prevMonthName} />
                                
                                {/* ── Top High Performers (Rank 1-3 Departments) ── */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col min-h-[300px]">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[15px] font-bold text-slate-800">Top High Performers</h3>
                                        <button onClick={() => navigate('/performance-dashboard')} className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View All</button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {topPerformers.length > 0 ? topPerformers.slice(0, 3).map((dept, idx) => (
                                            <div key={idx} className="group flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg transition-all px-2">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 mt-0.5 ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-500' : idx === 2 ? 'bg-orange-50 text-orange-400' : 'bg-slate-50 text-slate-400'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div className="grid">
                                                        <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-0.5">{dept.name}</h4>
                                                        <p className="text-[11px] font-medium text-slate-500">
                                                            {dept.role || '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[15px] font-bold text-slate-800 tabular-nums leading-tight">{Number(dept.score).toFixed(1)}%</div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 text-center opacity-40">
                                                <Shield className="w-8 h-8 mb-2 mx-auto text-slate-400" />
                                                <p className="text-[11px] font-bold">No Data Available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <ExportReportsPanel fromDate={fromDate} toDate={toDate} />
                                </div>
                            </div>
                        </div>

                        <EmployeeIssueModal
                            isOpen={isIssueModalOpen}
                            onClose={() => setIsIssueModalOpen(false)}
                            onSave={handleSaveIssue}
                            employeeName={selectedEmployeeForIssue}
                        />

                        <DeptReviewModal
                            isOpen={isDeptReviewModalOpen}
                            onClose={() => setIsDeptReviewModalOpen(false)}
                            onSave={handleSaveDeptReview}
                            departments={syncedDeptPerformance}
                            initialDepartment={selectedDeptForReview}
                        />
                    </div>
        </div>
    );
};

const PieChart2 = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);

export default CFODashboard;