export default function KPICard({ label, value, change, up, icon, iconBg, style }) {
  return (
    <div className="kpi-card" style={style}>
      {/* Icon badge */}
      {icon && (
        <div className="kpi-icon" style={{ background: iconBg || 'var(--clr-surface-2)' }}>
          {icon}
        </div>
      )}

      {/* Label */}
      <div className="kpi-label">{label}</div>

      {/* Value */}
      <div className="kpi-value">{value}</div>

      {/* Change badge */}
      {change !== undefined && (
        <div className={`kpi-change ${up ? 'kpi-change-up' : 'kpi-change-down'}`}>
          <span>{up ? '▲' : '▼'}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
