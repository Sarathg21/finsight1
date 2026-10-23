import React from 'react';
import useFullscreen from '../../hooks/useFullscreen';
import FullscreenToggleButton from './FullscreenToggleButton';

/**
 * FullscreenWrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * A container wrapper that provides fullscreen toggle functionality to any section.
 * Supports both controlled (external isMaximized/onToggle) and uncontrolled modes.
 */
export function FullscreenWrapper({
  children,
  isMaximized: externalMaximized,
  onToggle: externalToggle,
  className = '',
  style = {},
  renderHeader = null,
  showToggle = true,
  buttonVariant = 'circle',
}) {
  const internalFullscreen = useFullscreen();
  const isMaximized = externalMaximized !== undefined ? externalMaximized : internalFullscreen.isMaximized;
  const onToggle = externalToggle || internalFullscreen.toggleFullscreen;

  return (
    <div
      className={`fullscreen-wrapper ${isMaximized ? 'fixed inset-0 z-[9999] w-screen h-screen m-0 rounded-none bg-white overflow-hidden flex flex-col' : 'relative flex flex-col'} ${className}`}
      style={isMaximized ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        zIndex: 9999,
        background: '#ffffff',
        borderRadius: 0,
        margin: 0,
        ...style,
      } : style}
    >
      {renderHeader ? (
        renderHeader({ isMaximized, onToggle })
      ) : showToggle ? (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <FullscreenToggleButton isMaximized={isMaximized} onToggle={onToggle} variant={buttonVariant} />
        </div>
      ) : null}
      {typeof children === 'function' ? children({ isMaximized, onToggle }) : children}
    </div>
  );
}

export default FullscreenWrapper;
