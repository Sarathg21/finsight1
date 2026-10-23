import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * FullscreenToggleButton
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable full-screen toggle button for FinSight View All containers.
 *
 * Properties:
 * - isMaximized: boolean
 * - onToggle: function
 * - titleMaximize: string (default: "Maximize to full screen")
 * - titleMinimize: string (default: "Restore window size")
 * - size: number (default: 14)
 * - strokeWidth: number (default: 2.3)
 * - variant: 'circle' | 'square'
 * - className: string
 * - style: React.CSSProperties
 */
export function FullscreenToggleButton({
  isMaximized,
  onToggle,
  titleMaximize = 'Maximize to full screen',
  titleMinimize = 'Restore window size',
  size = 14,
  strokeWidth = 2.3,
  variant = 'circle',
  className = '',
  style = {},
}) {
  const title = isMaximized ? titleMinimize : titleMaximize;

  const baseStyle = variant === 'square'
    ? {
        height: 34,
        width: 34,
        padding: 0,
        border: '1px solid #cbd5e1',
        borderRadius: 6,
        background: '#ffffff',
        color: '#475569',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        ...style,
      }
    : {
        background: '#f1f5f9',
        border: 'none',
        borderRadius: '50%',
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#64748b',
        transition: 'all 0.15s ease',
        flexShrink: 0,
        ...style,
      };

  return (
    <button
      type="button"
      onClick={onToggle}
      title={title}
      aria-label={title}
      className={`fullscreen-toggle-btn transition-colors duration-150 ${className}`}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!style.background) {
          e.currentTarget.style.background = variant === 'square' ? '#f1f5f9' : '#e2e8f0';
        }
        if (!style.color) {
          e.currentTarget.style.color = '#0f172a';
        }
      }}
      onMouseLeave={(e) => {
        if (!style.background) {
          e.currentTarget.style.background = baseStyle.background;
        }
        if (!style.color) {
          e.currentTarget.style.color = baseStyle.color;
        }
      }}
    >
      {isMaximized ? (
        <Minimize2 size={size} strokeWidth={strokeWidth} />
      ) : (
        <Maximize2 size={size} strokeWidth={strokeWidth} />
      )}
    </button>
  );
}

export default FullscreenToggleButton;
