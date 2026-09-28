import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle2, AlertTriangle, Clock, Filter, Layers, Loader2, RefreshCw, Target, TrendingUp, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/UI/SearchableSelect';
import MultiSearchableSelect from '../components/UI/MultiSearchableSelect';
import {
  fetchAssignedEmployeesDropdown,
  fetchManagersDropdown,
  fetchParentTasksDropdown,
  fetchSubTasksDropdown,
  listOkrActions,
} from '../services/okrActions';

const normStatus = (s) => (s || '').toString().trim().toUpperCase().replace(/\s+/g, '_');
const cleanStr = (v) => (v === undefined || v === null ? '' : String(v).trim());

const STATUS_META = {
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  APPROVED: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  DONE: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  STARTED: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  NEW: { label: 'Not Started', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  NOT_STARTED: { label: 'Not Started', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  PENDING: { label: 'Not Started', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  SUBMITTED: { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  PENDING_APPROVAL: { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  REVIEW: { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  OVERDUE: { label: 'Overdue', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  REWORK: { label: 'Rework', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-slate-200 text-slate-600 border-slate-300' },
};

const StatusBadge = ({ status }) => {
  const key = normStatus(status);
  const meta = STATUS_META[key] || { label: status || '—', cls: 'bg-slate-100 text-slate-500 border-slate-200' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${meta.cls}`}>
      {meta.label}
    </span>
  );
};

const KpiCard = ({ label, value, sub, gradient, Icon }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-4 rounded-2xl shadow flex flex-col justify-between min-h-[108px] group hover:scale-[1.02] transition-all`}>
    <div className="absolute -top-3 -right-3 w-14 h-14 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
    <div className="flex items-start justify-between relative z-10 w-full mb-2">
      <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.1em] drop-shadow-sm leading-tight pr-2">{label}</span>
      {Icon && <Icon size={16} className="text-white/40 group-hover:text-white/80 transition-colors shrink-0 ml-1 mt-0.5" />}
    </div>
    <div className="relative z-10 flex flex-col mt-auto">
      <span className="text-2xl font-black text-white tabular-nums tracking-tighter drop-shadow-md">{value}</span>
      <div className="h-4 mt-0.5">{sub && <span className="text-[11px] font-black text-white/90 drop-shadow-sm block">{sub}</span>}</div>
    </div>
  </div>
);

const fmtDate = (raw) => {
  if (!raw || raw === '—') return '—';
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
};

const dueMeta = (due) => {
  if (!due) return { label: '—', cls: 'text-slate-400' };
  const dt = new Date(due);
  if (Number.isNaN(dt.getTime())) return { label: '—', cls: 'text-slate-400' };
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  const diff = Math.round((dt.getTime() - todayLocal.getTime()) / (24 * 60 * 60 * 1000));
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, cls: 'text-rose-600 font-black' };
  if (diff === 0) return { label: 'Due today', cls: 'text-amber-600 font-black' };
  return { label: `${diff}d left`, cls: 'text-emerald-700 font-black' };
};

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New / Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'REWORK', label: 'Rework' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const extractItems = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Array.isArray(data.items) ? data.items : [];
};

const OKRActionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = (user?.role || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isManagerRole = userRole === 'MANAGER';
  const isCfoRole = userRole === 'CFO';

  const isCfoRoute = location.pathname.startsWith('/cfo/okr-actions');
  // Lock manager filter only for real manager users; admin/CFO on the manager route should still be able to filter.
  const shouldLockManager = isManagerRole;

  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const myEmpId = String(user?.emp_id || user?.id || '');

  const [showClosed, setShowClosed] = useState(false);
  const excludeClosed = !showClosed;

  const [parentTasks, setParentTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [managers, setManagers] = useState([]);
  const [assignees, setAssignees] = useState([]);

  const [tempFrom, setTempFrom] = useState(firstOfMonth);
  const [tempTo, setTempTo] = useState(today);

  const [filters, setFilters] = useState({
    parent_task_id: '',
    sub_task_id: '',
    manager_emp_id: [],
    assigned_to_emp_id: [],
    status: [],
    from_date: firstOfMonth,
    to_date: today,
    search: '',
    page: 1,
    limit: 20,
  });

  const effectiveManagerIds = useMemo(() => {
    if (shouldLockManager && myEmpId) return [myEmpId];
    return Array.isArray(filters.manager_emp_id) ? filters.manager_emp_id : [];
  }, [filters.manager_emp_id, myEmpId, shouldLockManager]);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ summary: {}, items: [], total: 0, page: 1, limit: 20 });

  const refreshDropdownParents = useCallback(async () => {
    const opts = await fetchParentTasksDropdown({ exclude_closed: excludeClosed }).catch(() => []);
    setParentTasks(opts);
  }, [excludeClosed]);

  useEffect(() => {
    refreshDropdownParents();
  }, [refreshDropdownParents]);

  // When parent changes, refresh dependent dropdowns + clear dependent selections
  useEffect(() => {
    const parent_task_id = filters.parent_task_id;
    setSubTasks([]);
    setManagers([]);
    setAssignees([]);

    if (!parent_task_id) {
      setFilters((p) => ({
        ...p,
        sub_task_id: '',
        manager_emp_id: shouldLockManager ? p.manager_emp_id : [],
        assigned_to_emp_id: [],
        page: 1,
      }));
      return;
    }

    (async () => {
      const [subs, mgrs] = await Promise.all([
        fetchSubTasksDropdown({ parent_task_id, exclude_closed: excludeClosed }).catch(() => []),
        fetchManagersDropdown({ parent_task_id, exclude_closed: excludeClosed }).catch(() => []),
      ]);
      setSubTasks(subs);
      setManagers(mgrs);
    })();
  }, [excludeClosed, filters.parent_task_id, shouldLockManager]);

  // Refresh assignees when parent/sub/manager changes
  useEffect(() => {
    const parent_task_id = filters.parent_task_id;
    if (!parent_task_id) return;
    const sub_task_id = filters.sub_task_id || undefined;
    const manager_emp_id = effectiveManagerIds.length === 1 ? effectiveManagerIds[0] : undefined;

    (async () => {
      const opts = await fetchAssignedEmployeesDropdown({
        parent_task_id,
        sub_task_id,
        manager_emp_id,
        exclude_closed: excludeClosed,
      }).catch(() => []);
      setAssignees(opts);
    })();
  }, [excludeClosed, effectiveManagerIds, filters.parent_task_id, filters.sub_task_id]);

  // Lock manager filter for manager view
  useEffect(() => {
    if (!shouldLockManager || !myEmpId) return;
    setFilters((p) => ({ ...p, manager_emp_id: [myEmpId] }));
  }, [myEmpId, shouldLockManager]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await listOkrActions({
        parent_task_id: filters.parent_task_id,
        sub_task_id: filters.sub_task_id,
        manager_emp_id: effectiveManagerIds,
        assigned_to_emp_id: filters.assigned_to_emp_id,
        status: filters.status,
        from_date: filters.from_date,
        to_date: filters.to_date,
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
      });

      const items = extractItems(payload);
      setData({
        summary: payload.summary || payload.kpis || {},
        items,
        total: Number(payload.total ?? items.length ?? 0),
        page: Number(payload.page ?? filters.page ?? 1),
        limit: Number(payload.limit ?? filters.limit ?? 20),
      });
    } catch (e) {
      setData({ summary: {}, items: [], total: 0, page: 1, limit: filters.limit });
      // eslint-disable-next-line no-console
      console.error('[OKRActions] list error', e);
    } finally {
      setLoading(false);
    }
  }, [effectiveManagerIds, filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const items = data.items || [];

  const kpis = useMemo(() => {
    const total = Number(data.total ?? items.length ?? 0);

    const summary = data.summary || {};
    const get = (keys, fallback) => {
      for (const k of keys) {
        const v = summary?.[k];
        if (v !== undefined && v !== null && v !== '') return Number(v);
      }
      return fallback;
    };

    const done = get(['completed', 'done', 'completed_count', 'approved', 'approved_count'], null);
    const inProg = get(['in_progress', 'in_progress_count'], null);
    const pending = get(['pending_approval', 'pending', 'pending_count'], null);
    const overdue = get(['overdue', 'overdue_count'], null);

    const computed = {
      done: items.filter((x) => ['COMPLETED', 'APPROVED', 'DONE', 'FINISHED', 'SUCCESS'].includes(normStatus(x?.status))).length,
      inProg: items.filter((x) => ['IN_PROGRESS', 'STARTED'].includes(normStatus(x?.status))).length,
      pending: items.filter((x) => ['SUBMITTED', 'PENDING_APPROVAL', 'REVIEW'].includes(normStatus(x?.status))).length,
      overdue: items.filter((x) => normStatus(x?.status) === 'OVERDUE').length,
    };

    const finalDone = done ?? computed.done;
    const finalInProg = inProg ?? computed.inProg;
    const finalPending = pending ?? computed.pending;
    const finalOverdue = overdue ?? computed.overdue;
    const pct = total > 0 ? Math.round((finalDone / total) * 100) : 0;

    return { total, done: finalDone, inProg: finalInProg, pending: finalPending, overdue: finalOverdue, pct };
  }, [data.summary, data.total, items]);

  const totalPages = Math.max(1, Math.ceil((Number(data.total) || 0) / (Number(filters.limit) || 20)));

  const handleApplyDates = () => {
    setFilters((p) => ({ ...p, from_date: tempFrom, to_date: tempTo, page: 1 }));
    localStorage.setItem('dashboard_from_date', tempFrom);
    localStorage.setItem('dashboard_to_date', tempTo);
  };

  const handleReset = () => {
    setShowClosed(false);
    setTempFrom(firstOfMonth);
    setTempTo(today);
    setFilters({
      parent_task_id: '',
      sub_task_id: '',
      manager_emp_id: shouldLockManager && myEmpId ? [myEmpId] : [],
      assigned_to_emp_id: [],
      status: [],
      from_date: firstOfMonth,
      to_date: today,
      search: '',
      page: 1,
      limit: 20,
    });
  };

  const canShowManagerFilter = isCfoRoute || isCfoRole || isAdmin;

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-4 sm:p-6 font-sans text-slate-800">
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#3730a3] tracking-tight">OKR Actions</h1>
        {isCfoRole && (
          <nav className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-indigo-600 cursor-pointer" onClick={() => navigate('/okr-dashboard')}>OKR Dashboard</span>
            <span>→</span>
            <span className="text-indigo-600">Actions</span>
          </nav>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <KpiCard label="Total Actions" value={kpis.total} gradient="from-[#4f46e5] to-[#4338ca]" Icon={Layers} />
        <KpiCard label="In Progress" value={kpis.inProg} gradient="from-[#2563eb] to-[#1d4ed8]" Icon={Clock} />
        <KpiCard label="Pending Approval" value={kpis.pending} gradient="from-[#d97706] to-[#b45309]" Icon={Filter} />
        <KpiCard label="Overdue" value={kpis.overdue} gradient="from-[#e11d48] to-[#be123c]" Icon={AlertTriangle} />
        <KpiCard label="Completed" value={kpis.done} gradient="from-[#059669] to-[#047857]" Icon={CheckCircle2} />
        <KpiCard label="Completion %" value={`${kpis.pct}%`} gradient="from-[#0891b2] to-[#0e7490]" Icon={TrendingUp} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={tempFrom}
                onChange={(e) => setTempFrom(e.target.value)}
                className="text-[11px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-[108px]"
              />
              <span className="text-slate-300 font-bold">-</span>
              <input
                type="date"
                value={tempTo}
                onChange={(e) => setTempTo(e.target.value)}
                className="text-[11px] font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-[108px]"
              />
              <button
                onClick={handleApplyDates}
                className="bg-violet-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-violet-700 ml-1 transition-all"
              >
                Apply
              </button>
            </div>

            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-600 select-none cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={showClosed}
                onChange={(e) => setShowClosed(e.target.checked)}
                className="accent-indigo-600"
              />
              Show Closed
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchList()}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
            >
              Reset
            </button>
            {loading && <Loader2 size={16} className="text-violet-400 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Parent Task</label>
            <SearchableSelect
              value={filters.parent_task_id}
              onChange={(v) =>
                setFilters((p) => ({
                  ...p,
                  parent_task_id: String(v || ''),
                  sub_task_id: '',
                  manager_emp_id: shouldLockManager ? p.manager_emp_id : [],
                  assigned_to_emp_id: [],
                  page: 1,
                }))
              }
              options={parentTasks}
              placeholder="All Parent Tasks"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sub Task</label>
            <SearchableSelect
              value={filters.sub_task_id}
              onChange={(v) => setFilters((p) => ({ ...p, sub_task_id: String(v || ''), page: 1 }))}
              options={subTasks}
              placeholder="All Sub Tasks"
            />
          </div>

          {canShowManagerFilter ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Manager</label>
              <MultiSearchableSelect
                values={effectiveManagerIds}
                onChange={(vals) => setFilters((p) => ({ ...p, manager_emp_id: vals, page: 1 }))}
                options={managers}
                placeholder="All Managers"
                disabled={shouldLockManager}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Manager</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 shadow-sm">
                <UserIcon size={14} className="text-slate-400" />
                <span className="truncate">{cleanStr(user?.name) || '—'}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned To</label>
            <MultiSearchableSelect
              values={filters.assigned_to_emp_id}
              onChange={(vals) => setFilters((p) => ({ ...p, assigned_to_emp_id: vals, page: 1 }))}
              options={assignees}
              placeholder="All Assignees"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
            <MultiSearchableSelect
              values={filters.status}
              onChange={(vals) => setFilters((p) => ({ ...p, status: vals, page: 1 }))}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Search</label>
            <div className="relative">
              <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
                placeholder="Search actions..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-[12px] font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Target size={18} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-slate-800 tracking-tight">Actions List</h3>
              <p className="text-[11px] font-semibold text-slate-400">Showing {items.length} of {data.total || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.limit}
              onChange={(e) => setFilters((p) => ({ ...p, limit: Number(e.target.value) || 20, page: 1 }))}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 shadow-sm"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Parent Task</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Sub Task</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Manager</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Assigned To</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Assigned On</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Due</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-6 text-center text-slate-400 text-[12px] font-semibold" colSpan={9}>
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-slate-400 text-[12px] font-semibold" colSpan={9}>
                    No actions found.
                  </td>
                </tr>
              ) : (
                items.map((a, idx) => {
                  const id = a?.id ?? a?.action_id ?? a?.action_code ?? idx;
                  const actionTitle = cleanStr(a?.action_title ?? a?.title ?? a?.name) || '—';
                  const actionCode = cleanStr(a?.action_code ?? a?.code ?? a?.id) || '';
                  const parentTitle = cleanStr(a?.parent_task_title ?? a?.parent_title ?? a?.parent_task_name) || '—';
                  const subTitle = cleanStr(a?.sub_task_title ?? a?.subtask_title ?? a?.sub_title) || '—';
                  const managerName = cleanStr(a?.manager_name ?? a?.assigned_by_name ?? a?.manager_emp_name) || '—';
                  const assigneeName = cleanStr(a?.assigned_to_name ?? a?.assignee_name ?? a?.assigned_to_emp_name) || '—';
                  const assignedDate =
                    a?.assigned_at ||
                    a?.assigned_date ||
                    a?.created_at ||
                    a?.assigned_on ||
                    a?.start_date ||
                    a?.date ||
                    filters.from_date ||
                    localStorage.getItem('dashboard_from_date') ||
                    '';
                  const dueDate = a?.due_date ?? a?.end_date ?? a?.target_date;
                  const status = a?.status ?? a?.task_status;

                  return (
                    <tr key={String(id)} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="min-w-[240px]">
                          <div className="text-slate-900 text-[12px] font-black leading-tight">{actionTitle}</div>
                          {actionCode && <div className="text-[10px] font-bold text-slate-400 mt-0.5">{actionCode}</div>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 text-[12px] font-semibold whitespace-nowrap">{parentTitle}</td>
                      <td className="px-5 py-3.5 text-slate-700 text-[12px] font-semibold whitespace-nowrap">{subTitle}</td>
                      <td className="px-5 py-3.5 text-slate-700 text-[12px] font-semibold whitespace-nowrap">{managerName}</td>
                      <td className="px-5 py-3.5 text-slate-700 text-[12px] font-semibold whitespace-nowrap">{assigneeName}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-[12px] whitespace-nowrap">{fmtDate(assignedDate)}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-[12px] whitespace-nowrap">{fmtDate(dueDate)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {(() => {
                          const dm = dueMeta(dueDate);
                          return <span className={`text-[12px] whitespace-nowrap ${dm.cls}`}>{dm.label}</span>;
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12px] font-bold text-slate-500">
            Page {filters.page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Prev
            </button>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-[12px] font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {(isCfoRoute || isCfoRole) && (
        <div className="mt-4 text-[11px] text-slate-400 font-semibold">
          CFO view is org-wide. Manager filter is available for scoping.
        </div>
      )}
    </div>
  );
};

export default OKRActionsPage;

