import SectionTitle from './SectionTitle';

export default function Card({
  title,
  rightElement,
  children,
  style,
  className = '',
  noPadding = false,
  variant = 'default',   // 'default' | 'flat' | 'elevated'
  ...props
}) {
  const shadowMap = {
    default:  'var(--shadow-card)',
    flat:     'none',
    elevated: 'var(--shadow-md)',
  };

  return (
    <div
      className={`card ${className}`}
      style={{
        boxShadow: shadowMap[variant] ?? shadowMap.default,
        padding: noPadding ? 0 : 'var(--card-padding)',
        ...style,
      }}
      {...props}
    >
      {title && <SectionTitle title={title} rightElement={rightElement} />}
      {children}
    </div>
  );
}
