/* ═══════════════════════════════════════════════════════════════
   FJ Group Finance Suite — Design System Tokens
   Single source of truth for all design values.
   CSS variables in index.css mirror these exactly.
═══════════════════════════════════════════════════════════════ */

/* ── Brand Colors ─────────────────────────────────────────── */
export const C = {
  // Primary brand — Indigo
  primary:  '#6366f1',
  primaryDim: 'rgba(99,102,241,0.08)',
  primaryGlow: 'rgba(99,102,241,0.15)',

  // Semantic
  navy:    '#1e293b',   // primary text / headings
  blue:    '#2563eb',
  blue2:   '#3b82f6',
  emerald: '#10b981',
  green:   '#16a34a',
  green2:  '#22c55e',
  amber:   '#f59e0b',
  orange:  '#f97316',
  rose:    '#f43f5e',
  purple:  '#7c3aed',
  cyan:    '#0ea5e9',
  teal:    '#0d9488',
  pink:    '#ec4899',

  // Neutral
  slate:   '#64748b',
  muted:   '#94a3b8',
  dim:     '#cbd5e1',

  // Surfaces
  bg:      '#f8f9fd',
  surface: '#ffffff',
  surface2: '#f1f5fb',
  surface3: '#eef2ff',
  border:  'rgba(0,0,0,0.06)',
  borderHover: 'rgba(0,0,0,0.12)',
};

/* ── Chart Color Palette ──────────────────────────────────── */
export const CHART_COLORS = [
  C.primary, C.emerald, C.amber, C.rose,
  C.cyan, C.purple, C.blue2, C.teal,
];

/* ── Typography Scale ─────────────────────────────────────── */
export const T = {
  pageTitle:    { fontSize: '1.45rem', fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' },
  pageSub:      { fontSize: '0.78rem', color: C.slate, marginTop: 4 },
  sectionTitle: { fontSize: '0.9rem',  fontWeight: 700, color: C.navy },
  cardLabel:    { fontSize: '0.75rem', fontWeight: 600, color: C.slate },
  kpiValue:     { fontSize: '1.6rem',  fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' },
  kpiChange:    { fontSize: '0.72rem', fontWeight: 700 },
  tableHead:    { fontSize: '0.74rem', fontWeight: 700, color: '#1e3a8a' },
  tableCell:    { fontSize: '0.8rem',  color: '#334155' },
};

/* ── Spacing Scale ────────────────────────────────────────── */
export const S = {
  pageGap:    20,    // gap between major page sections
  cardPad:    '20px 24px',
  cardGap:    16,    // gap between cards in a row
  sectionGap: 20,    // marginBottom on card sections
};

/* ── Shadow Scale ─────────────────────────────────────────── */
export const SHADOW = {
  sm:   '0 1px 3px rgba(0,0,0,0.05)',
  md:   '0 4px 12px rgba(0,0,0,0.06)',
  lg:   '0 10px 28px rgba(0,0,0,0.08)',
  card: '0 1px 3px rgba(0,0,0,0.05)',
  cardHover: '0 4px 16px rgba(0,0,0,0.08)',
};

/* ── Tooltip style (light theme) ──────────────────────────── */
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    fontSize: 11,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  cursor: { fill: 'rgba(99,102,241,0.04)' },
};
