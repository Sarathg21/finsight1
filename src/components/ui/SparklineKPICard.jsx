import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function SparklineKPICard({ label, value, change, up, icon, iconBg, data, color }) {
  const [hover, setHover] = useState(false);
  const chartData = data.map((v, i) => ({ name: i, value: v }));

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="kpi-card"
      style={{
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-card)',
        transform: hover ? 'translateY(-2px)' : 'none',
        gap: 0,
        padding: '18px 20px',
      }}
    >
      {/* Top row: icon + label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: iconBg || 'var(--clr-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
          }}>
            {icon}
          </div>
        )}
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--clr-text-muted)', paddingTop: 2, lineHeight: 1.3 }}>
          {label}
        </div>
      </div>

      {/* Value */}
      <div className="kpi-value" style={{ fontSize: '1.3rem', marginBottom: 8 }}>{value}</div>

      {/* Change + Sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{
          fontSize: '0.68rem', fontWeight: 700,
          color: up ? 'var(--clr-emerald)' : 'var(--clr-rose)',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <span>{up ? '▲' : '▼'}</span>
          <span>{change}</span>
        </div>

        <div style={{ width: 64, height: 28 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone" dataKey="value"
                stroke={color || 'var(--clr-primary)'}
                strokeWidth={2} dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
