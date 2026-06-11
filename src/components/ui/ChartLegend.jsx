export default function ChartLegend({ color, label, dashed, square }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {square ? (
        <span style={{ width: 9, height: 9, borderRadius: 2, background: color, display: 'inline-block', flexShrink: 0 }} />
      ) : (
        <span style={{
          width: 16, height: 2.5, borderRadius: 2,
          background: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : 'none',
          display: 'inline-block', flexShrink: 0,
        }} />
      )}
      <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}
