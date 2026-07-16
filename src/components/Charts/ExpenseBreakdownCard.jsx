import React, { useState, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

/**
 * ExpenseBreakdownCard.jsx
 * Enterprise Quality Donut Chart for Expense Breakdown
 */

const RAW_COLORS = {
  'Employee Cost': '#6366F1',     // Indigo
  'Sales & Marketing': '#10B981', // Emerald Green
  'Admin Expenses': '#F59E0B',    // Amber
  'Finance Cost': '#0EA5E9',      // Sky Blue
  'Depreciation': '#A855F7',      // Light Purple
  'Others': '#EF4444',            // Coral Red
};
const FALLBACK_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#0EA5E9', '#A855F7', '#EF4444'];

const getColor = (name, index) => RAW_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

// Custom Active Shape (expanding the outerRadius on hover)
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4} // Subtly expands outward
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0 4px 12px ${fill}66)`,
          transition: 'all 0.3s ease',
        }}
      />
    </g>
  );
};

// Glassmorphic Custom Tooltip
const GlassTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  
  const fmtVal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(data.amount);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      borderRadius: 18,
      padding: '20px 22px',
      boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      pointerEvents: 'none',
      zIndex: 1000,
      minWidth: 280,
      maxWidth: 320,
      animation: 'plTooltipFadeScale 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
    }}>
      <style>{`
        @keyframes plTooltipFadeScale {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: data.fill, flexShrink: 0 }} />
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{data.name}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Amount</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {currency} {fmtVal}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Share</span>
        <span style={{ fontSize: '16px', fontWeight: 700, color: data.fill, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {data.calculatedPct}%
        </span>
      </div>
    </div>
  );
};

export default function ExpenseBreakdownCard({ data = [], loading = false, currency = 'AED', error, onRetry, menuItems, KebabMenu, ErrorBanner, Skeleton }) {
  const [hiddenSegments, setHiddenSegments] = useState(new Set());
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const toggleSegment = useCallback((name) => {
    setHiddenSegments(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  // Filter data and recalculate total and percentages for the visible segments
  const visibleData = useMemo(() => {
    const visible = data.filter(d => !hiddenSegments.has(d.name));
    const total = visible.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    
    return visible.map((item, index) => {
      const amount = Number(item.amount) || 0;
      const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
      return {
        ...item,
        amount,
        calculatedPct: pct,
        fill: getColor(item.name, index),
      };
    });
  }, [data, hiddenSegments]);

  const visibleTotal = useMemo(() => {
    return visibleData.reduce((sum, item) => sum + item.amount, 0);
  }, [visibleData]);

  // Determine activeIndex for hovered shape
  const activeIndex = useMemo(() => {
    if (!hoveredSegment) return -1;
    return visibleData.findIndex(d => d.name === hoveredSegment);
  }, [hoveredSegment, visibleData]);

  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 460 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', letterSpacing: '-0.01em' }}>Expense Breakdown (MTD)</div>
        {KebabMenu && menuItems && <KebabMenu id="menu-expense" items={menuItems} />}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {error ? (() => {
          const errText = typeof error === 'string' ? error : (typeof error === 'object' && error !== null ? (error.message || error.msg || JSON.stringify(error)) : String(error));
          return ErrorBanner ? <ErrorBanner message={errText} onRetry={onRetry} /> : <div style={{ color: 'red', fontSize: '0.8rem' }}>{errText}</div>;
        })() : loading ? (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '10px 0' }}>
            {Skeleton && <Skeleton h={150} w={150} radius={999} />}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Skeleton && [...Array(6)].map((_, i) => <Skeleton key={i} h={12} />)}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', flex: 1 }}>
            
            {/* Donut Chart Area */}
            <div style={{ position: 'relative', flex: '1 1 100%', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Absolutely Centered Label inside Donut Hole - Placed BEFORE ResponsiveContainer to render underneath tooltip */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none', zIndex: 1
              }}>
                <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
                  Total Expenses
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {currency} {Number(visibleTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 10 }}>
                <PieChart>
                  <Pie
                    data={visibleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={78}
                    outerRadius={105}
                    dataKey="amount"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setHoveredSegment(visibleData[index].name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    {visibleData.map((entry, index) => {
                      const isDimmed = hoveredSegment && hoveredSegment !== entry.name;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill} 
                          opacity={isDimmed ? 0.4 : 1}
                          style={{ transition: 'opacity 0.25s ease' }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    content={<GlassTooltip currency={currency} />}
                    cursor={false}
                    isAnimationActive={false}
                    allowEscapeViewBox={{ x: false, y: true }}
                    offset={20}
                    wrapperStyle={{ zIndex: 1000, outline: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>

            </div>

            {/* Interactive Vertical Legend */}
            <div style={{ flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'visible' }}>
              {data.map((item, index) => {
                const isHidden = hiddenSegments.has(item.name);
                const isHovered = hoveredSegment === item.name;
                const fill = getColor(item.name, index);
                
                // If it's hidden, we show 0%. If visible, we find its calculated pct.
                let displayPct = '0.0';
                if (!isHidden) {
                  const vItem = visibleData.find(v => v.name === item.name);
                  if (vItem) displayPct = vItem.calculatedPct;
                }

                return (
                  <div 
                    key={item.name} 
                    onClick={() => toggleSegment(item.name)}
                    onMouseEnter={() => setHoveredSegment(item.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                      background: isHovered ? 'rgba(241, 245, 249, 0.6)' : 'transparent',
                      opacity: isHidden ? 0.38 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        width: 10, height: 10, borderRadius: 3, 
                        background: isHidden ? '#cbd5e1' : fill, 
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                        boxShadow: isHovered && !isHidden ? `0 2px 6px ${fill}66` : 'none'
                      }} />
                      <span style={{ 
                        fontSize: '0.68rem', color: isHidden ? '#94a3b8' : '#334155', 
                        fontWeight: isHovered ? 700 : 600,
                        textDecoration: isHidden ? 'line-through' : 'none',
                        transition: 'all 0.2s ease'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 800, 
                      color: isHidden ? '#94a3b8' : '#0f172a', 
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'color 0.2s ease'
                    }}>
                      {displayPct}%
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* ── Key Expense Highlights (Fills empty space) ── */}
      {!loading && !error && data.length > 0 && (
        <div style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Largest Driver</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{data[0]?.name || '—'}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6366f1', marginTop: 2 }}>{visibleData.find(v => v.name === data[0]?.name)?.calculatedPct || 0}% of Total</span>
          </div>

          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Budget Status</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>1 Category Over</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>Admin Expenses (+5%)</span>
          </div>
        </div>
      )}

      {/* Tier 2: Budget Utilization Status */}
      {!loading && !error && (
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />
          
          <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
            Budget Utilization Status
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Employee Cost */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>Employee Cost</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>AED 189.4M / AED 231.0M Budgeted</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '82%', background: '#6366f1', borderRadius: 3, transition: 'width 1.2s ease-out' }} />
              </div>
            </div>

            {/* Sales & Marketing */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>Sales & Marketing</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>AED 87.7M / AED 93.3M Budgeted</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '94%', background: '#10b981', borderRadius: 3, transition: 'width 1.2s ease-out 0.2s' }} />
              </div>
            </div>

            {/* Admin Expenses (Over Budget) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>Admin Expenses</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>AED 62.5M / AED 59.5M Budgeted</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 6 }}>
                    Over Budget by 5%
                  </span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: '#ef4444', borderRadius: 3, transition: 'width 1.2s ease-out 0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
