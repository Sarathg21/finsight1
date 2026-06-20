/**
 * PLComparisonCard.jsx  ·  Enterprise Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium P&L Comparison Dashboard Card
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS (Data mapping & Palette)
═══════════════════════════════════════════════════════════════════════════ */
const SERIES = [
  {
    key: 'current',
    color: '#10B981', colorEnd: '#059669', // Emerald gradient
    gradId: 'gCompCurrent', shadowColor: 'rgba(16,185,129,0.25)',
  },
  {
    key: 'compare',
    color: '#38BDF8', colorEnd: '#2563EB', // Sky Blue gradient
    gradId: 'gCompCompare', shadowColor: 'rgba(56,189,248,0.25)',
  },
  {
    key: 'prior_year',
    color: '#94A3B8', colorEnd: '#64748B', // Soft Gray gradient
    gradId: 'gCompPrior', shadowColor: 'rgba(148,163,184,0.2)',
  },
];

const KPI_ICONS = [
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 18V6"/></svg>,
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
];

/* ── Formatters ── */
const fmtAxisNum = (v) => {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs}`;
};

const fmtCompact = (v) => {
  if (v === null || v === undefined) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`;
  return `${sign}${abs}`;
};

const pct = (a, b) => b && b !== 0 ? (((a - b) / Math.abs(b)) * 100).toFixed(1) : null;

/* ═══════════════════════════════════════════════════════════════════════════
   COUNT-UP HOOK
═══════════════════════════════════════════════════════════════════════════ */
function useCountUp(target, duration = 900, start = true) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const startVal  = 0;
    const diff = target - startVal;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setVal(startVal + diff * ease);
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return val;
}

/* ═══════════════════════════════════════════════════════════════════════════
   KPI CARD
═══════════════════════════════════════════════════════════════════════════ */
function KPICard({ label, value, prev, color, bg, icon, countStart, currency }) {
  const [hov, setHov] = useState(false);
  const animated = useCountUp(value, 900, countStart);
  const change = pct(value, prev);
  const isUp   = change !== null && parseFloat(change) >= 0;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 120px',
        background: bg,
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: '10px 14px',
        position: 'relative',
        overflow: 'hidden',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov
          ? `0 8px 24px ${color}22, 0 0 0 1px ${color}33`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.22s cubic-bezier(0.34,1.4,0.64,1)',
        cursor: 'default',
        willChange: 'transform, box-shadow',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        borderRadius: '14px 14px 0 0',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <span style={{ color, display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: '1rem', fontWeight: 800, color: '#0f172a',
        letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>
        {currency} {fmtCompact(animated)}
      </div>
      {change !== null && (
        <div style={{
          marginTop: 4, display: 'flex', alignItems: 'center', gap: 3,
          fontSize: '0.6rem', fontWeight: 700,
          color: isUp ? '#16a34a' : '#dc2626',
        }}>
          <span>{isUp ? '▲' : '▼'}</span>
          <span>{Math.abs(parseFloat(change))}% vs Prev</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PREMIUM LEGEND
═══════════════════════════════════════════════════════════════════════════ */
function PremiumLegend({ series, hidden, hoveredKey, onToggle, onHover, onHoverEnd, onIsolate }) {
  const lastClick = useRef({});
  const handleClick = (key) => {
    const now = Date.now();
    const prev = lastClick.current[key] || 0;
    if (now - prev < 350) { onIsolate(key); } else { onToggle(key); }
    lastClick.current[key] = now;
  };

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
      {series.map(s => {
        const isHidden = hidden.has(s.key);
        const isHov    = hoveredKey === s.key;
        const isDimmed = hoveredKey && hoveredKey !== s.key;

        return (
          <button
            key={s.key}
            onClick={() => handleClick(s.key)}
            onMouseEnter={() => onHover(s.key)}
            onMouseLeave={onHoverEnd}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
              background: isHov ? `${s.color}12` : 'transparent',
              border: isHov ? `1px solid ${s.color}40` : '1px solid transparent',
              opacity: isHidden ? 0.35 : isDimmed ? 0.45 : 1,
              transform: isHov ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: isHov ? `0 4px 12px ${s.shadowColor}` : 'none',
              transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
              outline: 'none',
            }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: isHidden ? '#cbd5e1' : `linear-gradient(135deg, ${s.color}, ${s.colorEnd})`,
              boxShadow: isHov ? `0 2px 6px ${s.shadowColor}` : 'none',
              transition: 'all 0.2s'
            }} />
            <span style={{
              fontSize: '0.65rem', fontWeight: 600,
              color: isHidden ? '#94a3b8' : isHov ? s.color : '#475569',
              textDecoration: isHidden ? 'line-through' : 'none',
              transition: 'color 0.18s',
            }}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI EXECUTIVE INSIGHT PANEL
═══════════════════════════════════════════════════════════════════════════ */
function AIInsightPanel({ data }) {
  const [expanded, setExpanded] = useState(true);

  const insights = useMemo(() => {
    if (!data || data.length === 0) return [
      { icon: 'ℹ', text: 'No data available for insights.' }
    ];

    const getMetric = (name) => data.find(d => String(d.metric).toLowerCase() === name.toLowerCase());

    const rev = getMetric('revenue');
    const gp = getMetric('gross profit');
    const ebitda = getMetric('ebitda');
    const np = getMetric('net profit');

    const pct = (curr, comp) => {
      const c = Number(curr) || 0;
      const p = Number(comp) || 0;
      if (!p) return 0;
      return ((c - p) / Math.abs(p)) * 100;
    };

    const generated = [];

    // Revenue Insight
    if (rev) {
      const revPct = pct(rev.current, rev.compare);
      if (revPct > 0) {
        generated.push({ icon: '⚡', text: `Revenue remained stronger than the comparison period, growing by ${revPct.toFixed(1)}%.` });
      } else if (revPct < 0) {
        generated.push({ icon: '⚠', text: `Revenue contracted by ${Math.abs(revPct).toFixed(1)}% compared to the comparison period.` });
      } else {
        generated.push({ icon: '⚡', text: `Revenue was completely flat compared to the benchmark.` });
      }
    }

    // GP Insight
    if (gp) {
      const gpPct = pct(gp.current, gp.compare);
      if (gpPct > 50) {
        generated.push({ icon: '📈', text: `Gross Profit saw a massive increase of ${gpPct.toFixed(0)}%, indicating vastly improved operational efficiency.` });
      } else if (gpPct > 0) {
        generated.push({ icon: '📈', text: `Gross Profit increased by ${gpPct.toFixed(1)}%, signaling solid margin performance.` });
      } else if (gpPct < 0) {
        generated.push({ icon: '📉', text: `Gross Profit declined by ${Math.abs(gpPct).toFixed(1)}%.` });
      }
    }

    // EBITDA Insight
    if (ebitda) {
      const ebitdaPct = pct(ebitda.current, ebitda.compare);
      generated.push({ icon: '🔄', text: `EBITDA ${ebitdaPct >= 0 ? 'recovered' : 'fell'} by ${Math.abs(ebitdaPct).toFixed(1)}% against the benchmark.` });
    }

    // Net Profit Insight
    if (np) {
      const npPct = pct(np.current, np.compare);
      if (npPct > 0) {
         generated.push({ icon: '💎', text: `Net Profit improved by ${npPct.toFixed(1)}%. Overall financial performance indicates positive momentum.` });
      } else {
         generated.push({ icon: '💎', text: `Net Profit decreased by ${Math.abs(npPct).toFixed(1)}%. Focus on bottom-line cost controls may be required.` });
      }
    }

    if (generated.length === 0) {
      return [{ icon: 'ℹ', text: 'Insufficient data for comparison insights.' }];
    }

    return generated;
  }, [data]);

  return (
    <div style={{
      marginTop: 14, border: '1px solid rgba(99,102,241,0.18)', borderLeft: '3px solid #6366f1',
      borderRadius: 12, background: 'linear-gradient(135deg, rgba(238,242,255,0.7) 0%, rgba(255,255,255,0.9) 100%)',
      backdropFilter: 'blur(8px)', overflow: 'hidden', transition: 'all 0.25s ease',
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(99,102,241,0.1)' : 'none',
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff',
          boxShadow: '0 2px 6px rgba(99,102,241,0.3)',
        }}>✦</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4338ca', letterSpacing: '-0.01em', flex: 1, textAlign: 'left' }}>
          Executive Insights
        </span>
        <span style={{ fontSize: '0.65rem', color: '#6366f1', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', display: 'inline-block' }}>▾</span>
      </button>
      {expanded && (
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, fontSize: '0.75rem', width: 20, height: 20, borderRadius: 5, background: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginTop: 1,
              }}>{ins.icon}</span>
              <p style={{ margin: 0, fontSize: '0.67rem', color: '#334155', lineHeight: 1.55, fontWeight: 500 }}>{ins.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXECUTIVE GLASS TOOLTIP
═══════════════════════════════════════════════════════════════════════════ */
const ExecComparisonTooltip = ({ active, payload, label, currency, seriesConfig }) => {
  if (!active || !payload?.length) return null;

  const dp = {};
  payload.forEach(p => { dp[p.dataKey] = p.value; });

  const currentVal = dp.current ?? null;
  const compareVal = dp.compare ?? null;
  const priorVal   = dp.prior_year ?? null;

  const variance   = currentVal !== null && compareVal !== null ? currentVal - compareVal : null;
  const growthPct  = pct(currentVal, compareVal);
  const isPos      = variance >= 0;

  const fmtIntl = (v) => {
    if (v === null || v === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(v).replace('$', currency + ' ');
  };

  const rows = [
    { key: 'current',    label: seriesConfig[0].label, val: currentVal, color: seriesConfig[0].color, colorEnd: seriesConfig[0].colorEnd },
    { key: 'compare',    label: seriesConfig[1].label, val: compareVal, color: seriesConfig[1].color, colorEnd: seriesConfig[1].colorEnd },
    { key: 'prior_year', label: seriesConfig[2].label, val: priorVal,   color: seriesConfig[2].color, colorEnd: seriesConfig[2].colorEnd },
  ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.35)', borderRadius: 18, padding: '16px 18px', width: 'max-content',
      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12), 0 2px 10px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.75)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      animation: 'plTooltipIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      pointerEvents: 'none', position: 'relative', zIndex: 1000
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)', borderRadius: '18px 18px 0 0' }} />
      
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1 }}>{label}</span>
      </div>

      {/* DATA ROWS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map(({ key, label, val, color, colorEnd }) => (
          <div key={key} style={{
            display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', columnGap: 24,
            padding: '6px 10px', borderRadius: 10, background: 'rgba(248, 250, 252, 0.60)', border: '1px solid rgba(226, 232, 240, 0.45)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: `linear-gradient(135deg, ${color}, ${colorEnd})` }} />
              <span style={{ fontSize: '0.71rem', fontWeight: 600, color: '#475569' }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
              {fmtIntl(val)}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER - Variance & Growth */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(241, 245, 249, 0.9)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.53rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Variance</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: variance === null ? '#cbd5e1' : (isPos ? '#059669' : '#dc2626') }}>
            {variance !== null ? `${isPos ? '+' : ''}${fmtIntl(variance)}` : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.53rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Growth</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: growthPct === null ? '#cbd5e1' : (isPos ? '#059669' : '#dc2626') }}>
            {growthPct !== null ? `${isPos ? '▲' : '▼'} ${Math.abs(growthPct)}%` : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.53rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: isPos ? 'rgba(220,252,231,0.6)' : 'rgba(254,226,226,0.6)', color: isPos ? '#15803d' : '#dc2626', display: 'inline-block' }}>
            {isPos ? 'Strong' : 'Weak'}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function PLComparisonCard({ data, loading, currency, periodLabel, compareLabel, priorLabel }) {
  const [hidden, setHidden] = useState(new Set());
  const [hoveredSeries, setHoveredSeries] = useState(null); // Legend hover
  const [hoveredCategory, setHoveredCategory] = useState(null); // Chart bar hover

  // Hydrate series labels from props
  const seriesConfig = useMemo(() => SERIES.map((s, i) => ({
    ...s,
    label: [periodLabel, compareLabel, priorLabel][i] || s.key
  })), [periodLabel, compareLabel, priorLabel]);

  // Actions
  const toggleSeries = useCallback((key) => {
    setHidden(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);

  const isolateSeries = useCallback((key) => {
    setHidden(new Set(seriesConfig.map(s => s.key).filter(k => k !== key)));
  }, [seriesConfig]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
      <style>{`
        @keyframes plTooltipIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes plPulseLoad { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes plKpiIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes plInsightIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes plBreathingGlow {
          0% { filter: drop-shadow(0 2px 4px var(--s-shadow)) brightness(1); }
          50% { filter: drop-shadow(0 6px 12px var(--s-shadow)) brightness(1.08); }
          100% { filter: drop-shadow(0 2px 4px var(--s-shadow)) brightness(1); }
        }
        .pl-comp-label-anim { animation: plTooltipIn 0.3s ease forwards; }
      `}</style>

      {/* CHART CONTAINER */}
      <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 240 }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'linear-gradient(90deg,rgba(241,245,249,0.85) 25%,rgba(248,250,252,0.95) 50%,rgba(241,245,249,0.85) 75%)', backgroundSize: '200% 100%', animation: 'plPulseLoad 1.4s infinite', borderRadius: 10, backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.04em' }}>Loading comparison...</span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 8, left: -18, bottom: 0 }} 
            barCategoryGap="20%"
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined) setHoveredCategory(state.activeTooltipIndex);
              else setHoveredCategory(null);
            }}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <defs>
              {seriesConfig.map(s => (
                <linearGradient key={s.gradId} id={s.gradId} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={s.color}>
                    <animate attributeName="stop-color" values={`${s.color};${s.colorEnd};${s.color}`} dur="6s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor={s.colorEnd}>
                    <animate attributeName="stop-color" values={`${s.colorEnd};${s.color};${s.colorEnd}`} dur="6s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(226,232,240,0.45)" />
            <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500, fontFamily: 'Inter, system-ui' }} axisLine={false} tickLine={false} dy={7} />
            <YAxis tickFormatter={fmtAxisNum} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 500, fontFamily: 'Inter, system-ui' }} axisLine={false} tickLine={false} width={52} />
            
            <Tooltip 
              cursor={{ fill: 'rgba(99,102,241,0.04)' }}
              content={<ExecComparisonTooltip currency={currency} seriesConfig={seriesConfig} />} 
              offset={20}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ zIndex: 999, outline: 'none', pointerEvents: 'none' }}
              isAnimationActive={false}
            />
            
            {seriesConfig.map((s, idx) => {
              if (hidden.has(s.key)) return null;
              return (
                <Bar 
                  key={s.key}
                  dataKey={s.key}    
                  name={s.label}  
                  fill={`url(#${s.gradId})`}
                  radius={[4,4,0,0]} 
                  barSize={16}
                  animationDuration={1100}
                  animationBegin={idx * 150}
                  animationEasing="ease-in-out"
                >
                  {/* Animated Labels */}
                  <LabelList 
                    dataKey={s.key} 
                    position="top" 
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      if (hoveredCategory !== index) return null;
                      return (
                        <g className="pl-comp-label-anim" transform={`translate(${x + width/2},${y - 8})`}>
                          <text fill="#0f172a" fontSize="10" fontWeight="700" textAnchor="middle" filter="drop-shadow(0 1px 2px rgba(255,255,255,0.8))">
                            {fmtCompact(value)}
                          </text>
                        </g>
                      );
                    }}
                  />
                  {/* Hover dimming & glow cells */}
                  {data?.map((entry, index) => {
                    const isHovered = hoveredCategory === index;
                    const isDimmed = hoveredCategory !== null && hoveredCategory !== index;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#${s.gradId})`}
                        opacity={isDimmed ? 0.35 : 1}
                        style={{
                          transition: 'all 0.25s ease',
                          transformOrigin: 'bottom',
                          transform: isHovered ? 'scaleY(1.02) scaleX(1.05)' : 'scale(1)',
                          '--s-shadow': s.shadowColor,
                          animation: (hoveredCategory === null) ? 'plBreathingGlow 3s infinite ease-in-out' : 'none',
                          filter: isHovered ? `drop-shadow(0 4px 12px ${s.shadowColor}) brightness(1.1)` : 'none'
                        }}
                      />
                    );
                  })}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PREMIUM LEGEND */}
      <PremiumLegend series={seriesConfig} hidden={hidden} hoveredKey={hoveredSeries} onToggle={toggleSeries} onHover={setHoveredSeries} onHoverEnd={() => setHoveredSeries(null)} onIsolate={isolateSeries} />

      {/* AI INSIGHT */}
      <div style={{ animation: 'plInsightIn 0.4s ease 0.3s both' }}>
        <AIInsightPanel data={data} />
      </div>
    </div>
  );
}
