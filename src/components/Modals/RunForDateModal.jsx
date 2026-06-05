import React, { useState, useEffect } from 'react';
import {
    X, Calendar, Play, AlertTriangle, CheckCircle2,
    XCircle, Loader2, RefreshCw, Info, Zap, SkipForward,
    RotateCcw, CalendarClock, ChevronRight, Layers
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

/**
 * RunForDateModal – CFO/Admin manual recurring run
 * Props:
 *   isOpen        – boolean
 *   onClose       – () => void
 *   template      – { id | recurring_id, title } (pre-selected, can be null for "all")
 *   templates     – array of all recurring templates (for dropdown)
 *   onSuccess     – () => void  (called after successful run so parent can refresh)
 */
const RunForDateModal = ({ isOpen, onClose, template, templates = [], onSuccess }) => {
    const today = new Date().toISOString().slice(0, 10);

    const [runDate, setRunDate] = useState(today);
    const [dueDateBase, setDueDateBase] = useState(today);
    const [forceRun, setForceRun] = useState(true);
    const [replaceExisting, setReplaceExisting] = useState(true);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            const t = new Date().toISOString().slice(0, 10);
            setRunDate(t);
            setDueDateBase(t);
            setForceRun(true);
            setReplaceExisting(true);
            setResult(null);
            const tid = template ? (template.id || template.recurring_id) : '';
            setSelectedId(tid ? String(tid) : '');
        }
    }, [isOpen, template]);

    if (!isOpen) return null;

    const handleRun = async () => {
        if (!runDate) { toast.error('Please select a Cycle Date.'); return; }
        if (!dueDateBase) { toast.error('Please select a Due Date Base.'); return; }

        const payload = {
            run_date: runDate,
            due_date_base: dueDateBase,
            force_run: forceRun,
            replace_existing_period_generation: replaceExisting,
        };
        if (selectedId) payload.recurring_id = parseInt(selectedId, 10);

        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/recurring-tasks/run', payload);
            const data = res.data || {};
            setResult({ ok: true, data });
            const gen = data.generated_count ?? data.generated?.length ?? 0;
            if (gen > 0) {
                toast.success(`${gen} task(s) generated successfully.`);
            } else {
                toast(`Run completed — ${data.skipped_count ?? 0} task(s) skipped.`, { icon: '⚠️' });
            }
            if (onSuccess) onSuccess();
        } catch (err) {
            const detail = err.response?.data?.detail;
            const msg = Array.isArray(detail)
                ? detail.map(d => `${d.loc?.join('.') || 'body'}: ${d.msg}`).join(', ')
                : (detail || err.message || 'Unknown error');
            setResult({ ok: false, error: msg });
            toast.error('Run failed: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const selectedTemplateName = templates.find(
        t => String(t.id || t.recurring_id) === String(selectedId)
    )?.title || null;

    /* ── Toggle component ── */
    const Toggle = ({ value, onChange, disabled, colorOn = 'bg-indigo-500', colorOff = 'bg-slate-200' }) => (
        <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={() => !disabled && onChange(!value)}
            className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 focus:outline-none ${value ? colorOn : colorOff} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
        </button>
    );

    /* ── Option card with toggle ── */
    const OptionCard = ({ icon: Icon, iconColor, title, description, value, onChange, colorOn, warning }) => (
        <div
            className={`flex items-start justify-between gap-4 px-5 py-4 rounded-2xl border transition-all cursor-pointer select-none ${
                value ? `bg-${warning ? 'amber' : 'indigo'}-50 border-${warning ? 'amber' : 'indigo'}-200` : 'bg-slate-50 border-slate-100 hover:border-slate-200'
            }`}
            onClick={() => !loading && onChange(!value)}
        >
            <div className="flex items-start gap-3 flex-1">
                <Icon size={18} className={`mt-0.5 shrink-0 ${value ? iconColor : 'text-slate-300'}`} />
                <div>
                    <p className={`text-[13px] font-black leading-none ${value ? (warning ? 'text-amber-700' : 'text-indigo-700') : 'text-slate-600'}`}>
                        {title}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">{description}</p>
                </div>
            </div>
            <Toggle
                value={value}
                onChange={onChange}
                disabled={loading}
                colorOn={warning ? 'bg-amber-400' : 'bg-indigo-500'}
            />
        </div>
    );

    const generatedCount = result?.data?.generated_count ?? result?.data?.generated?.length ?? 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[560px] rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">

                {/* ── Header ── */}
                <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg">
                            <CalendarClock size={20} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-black text-white tracking-tight leading-none">Run for Date</h2>
                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Manual Recurring Cycle Generation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/70 hover:text-white" title="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-8 space-y-5 overflow-y-auto flex-1">

                    {/* Info banner — general */}
                    <div className="flex items-start gap-3 px-4 py-3.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <Info size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-[12px] font-medium text-indigo-700 leading-relaxed">
                            Generates a recurring cycle for the selected date. Enable <strong>Replace Existing</strong> to cleanly regenerate a previously run period without duplicates.
                        </p>
                    </div>

                    {/* Info banner — action templates auto-generation */}
                    <div className="flex items-start gap-3 px-4 py-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                        <Layers size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                            <p className="text-[12px] font-black text-emerald-700">Action Templates Auto-Generated</p>
                            <p className="text-[11px] font-medium text-emerald-600 leading-relaxed">
                                If a recurring child / subtask branch has <strong>active recurring action templates</strong> under it, those employee action tasks will also be generated automatically during this same run — provided the branch is manager-owned and all validations pass.
                            </p>
                        </div>
                    </div>

                    {/* ── Section: Template ── */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Recurring Template
                        </label>
                        <select
                            className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 font-bold text-sm text-slate-700 transition-all"
                            value={selectedId}
                            onChange={e => setSelectedId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">— All Active Templates —</option>
                            {templates.map(t => {
                                const tid = t.id || t.recurring_id;
                                return (
                                    <option key={tid} value={String(tid)}>
                                        RT-{tid} · {t.title}
                                    </option>
                                );
                            })}
                        </select>
                        {selectedId && selectedTemplateName && (
                            <p className="text-[11px] text-indigo-500 font-bold ml-1 flex items-center gap-1.5">
                                <RefreshCw size={11} className="text-indigo-400" />
                                RT-{selectedId}: {selectedTemplateName}
                            </p>
                        )}
                    </div>

                    {/* ── Section: Dates ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Cycle Date */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Cycle Date <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 font-bold text-sm text-slate-700 transition-all"
                                    value={runDate}
                                    onChange={e => setRunDate(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium ml-1 leading-snug">Determines which recurring period is generated</p>
                        </div>

                        {/* Due Date Base */}
                        <div className="space-y-2">
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Due Date Base <span className="text-rose-400">*</span>
                            </label>
                            <div className="relative">
                                <CalendarClock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="date"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 font-bold text-sm text-slate-700 transition-all"
                                    value={dueDateBase}
                                    onChange={e => setDueDateBase(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium ml-1 leading-snug">Due offsets for parent/child/action tasks are calculated from this date</p>
                        </div>
                    </div>

                    {/* ── Section: Toggles ── */}
                    <div className="space-y-3">
                        <OptionCard
                            icon={Zap}
                            iconColor="text-amber-500"
                            title="Force Run"
                            description="Generate even if the cycle date doesn't match the configured schedule"
                            value={forceRun}
                            onChange={setForceRun}
                            warning={true}
                        />
                        <OptionCard
                            icon={RotateCcw}
                            iconColor="text-indigo-500"
                            title="Replace Existing Period Generation"
                            description="Cancels the earlier generated batch for this same period and regenerates cleanly — no duplicates"
                            value={replaceExisting}
                            onChange={setReplaceExisting}
                            warning={false}
                        />
                    </div>

                    {/* ── Payload Preview ── */}
                    {!result && (
                        <div className="bg-slate-900 rounded-2xl px-5 py-4 space-y-1.5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Payload Preview</p>
                            {[
                                { key: 'run_date', val: runDate || '—' },
                                { key: 'due_date_base', val: dueDateBase || '—' },
                                { key: 'force_run', val: String(forceRun) },
                                { key: 'replace_existing', val: String(replaceExisting) },
                                ...(selectedId ? [{ key: 'recurring_id', val: selectedId }] : []),
                            ].map(({ key, val }) => (
                                <div key={key} className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono text-violet-400 w-36 shrink-0">{key}</span>
                                    <ChevronRight size={10} className="text-slate-600 shrink-0" />
                                    <span className="text-[11px] font-mono text-emerald-400">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Result Summary ── */}
                    {result && (
                        <div className={`rounded-2xl border overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ${result.ok ? 'border-emerald-100' : 'border-rose-100'}`}>
                            <div className={`px-5 py-3 flex items-center gap-3 ${
                                result.ok
                                    ? (generatedCount > 0 ? 'bg-emerald-50' : 'bg-amber-50')
                                    : 'bg-rose-50'
                            }`}>
                                {result.ok ? (
                                    generatedCount > 0
                                        ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                        : <SkipForward size={18} className="text-amber-500 shrink-0" />
                                ) : (
                                    <XCircle size={18} className="text-rose-500 shrink-0" />
                                )}
                                <span className={`text-[13px] font-black ${
                                    result.ok
                                        ? (generatedCount > 0 ? 'text-emerald-700' : 'text-amber-700')
                                        : 'text-rose-700'
                                }`}>
                                    {result.ok
                                        ? (generatedCount > 0 ? 'Tasks Generated Successfully' : 'Run Completed — Tasks Skipped')
                                        : 'Run Failed'}
                                </span>
                            </div>

                            <div className="bg-white px-5 py-4 space-y-4">
                                {result.ok ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <span className="text-[28px] font-black text-emerald-600 leading-none">{generatedCount}</span>
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">Generated</span>
                                            </div>
                                            <div className="flex flex-col items-center py-3 bg-amber-50 rounded-xl border border-amber-100">
                                                <span className="text-[28px] font-black text-amber-600 leading-none">{result.data.skipped_count ?? result.data.skipped?.length ?? 0}</span>
                                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mt-1">Skipped</span>
                                            </div>
                                        </div>

                                        {Array.isArray(result.data.generated) && result.data.generated.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated Tasks</p>
                                                {result.data.generated.slice(0, 5).map((item, i) => (
                                                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                                                        <span className="text-[12px] font-bold text-slate-700 truncate flex-1">
                                                            {item.title || item.task_title || `Task #${item.id || item.task_id || (i + 1)}`}
                                                        </span>
                                                        {(item.id || item.task_id) && (
                                                            <span className="text-[9px] font-black text-slate-300 font-mono shrink-0">
                                                                #{item.id || item.task_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {result.data.generated.length > 5 && (
                                                    <p className="text-[10px] text-slate-400 font-medium text-center py-1">
                                                        +{result.data.generated.length - 5} more tasks
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {Array.isArray(result.data.skipped) && result.data.skipped.length > 0 && (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skip Reasons</p>
                                                {result.data.skipped.slice(0, 4).map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2.5 px-3 py-2 bg-amber-50/60 rounded-xl border border-amber-100">
                                                        <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
                                                        <span className="text-[11px] font-medium text-amber-700 leading-snug">
                                                            {item.reason || JSON.stringify(item)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-start gap-3 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100">
                                        <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                                        <p className="text-[12px] font-medium text-rose-700 leading-snug">{result.error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>

                    {!result && (
                        <button
                            type="button"
                            onClick={handleRun}
                            disabled={loading || !runDate || !dueDateBase}
                            className="flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Executing...</>
                            ) : (
                                <><Play size={15} strokeWidth={3} /> {forceRun ? 'Force Run' : 'Run Now'}</>
                            )}
                        </button>
                    )}

                    {result?.ok && (
                        <button
                            type="button"
                            onClick={() => { setResult(null); }}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all active:scale-95"
                        >
                            <RotateCcw size={14} /> Run Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RunForDateModal;
