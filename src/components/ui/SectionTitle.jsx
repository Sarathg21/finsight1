export default function SectionTitle({ title, subtitle, rightElement, style, titleStyle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12, ...style }}>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--clr-text)', lineHeight: 1.3, ...titleStyle }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {rightElement}
    </div>
  );
}
