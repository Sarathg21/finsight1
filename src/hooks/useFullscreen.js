import { useState, useEffect, useCallback } from 'react';

/**
 * useFullscreen
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable hook to manage fullscreen/maximize state for View All modal containers.
 *
 * Features:
 * - Controls `isMaximized` state with toggle/enter/exit helpers.
 * - Handles Escape key:
 *     - If maximized: exits fullscreen mode without closing the modal.
 *     - If unmaximized: calls `onClose` callback to close the modal dialog.
 * - Resets `isMaximized` to false whenever `isOpen` becomes false.
 *
 * @param {Object} options
 * @param {boolean} [options.isOpen=true] - Whether the modal/container is currently open.
 * @param {Function} [options.onClose] - Optional callback to close modal on Escape when not maximized.
 * @param {boolean} [options.initialMaximized=false] - Initial maximized state.
 */
export function useFullscreen({ isOpen = true, onClose = null, initialMaximized = false } = {}) {
  const [isMaximized, setIsMaximized] = useState(initialMaximized);

  // Reset maximized state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsMaximized(false);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMaximized) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
          }
          setIsMaximized(false);
        } else if (onClose) {
          onClose();
        }
      }
    };

    // Use capture phase so fullscreen Escape handling takes priority over outer modal closers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, isMaximized, onClose]);

  const toggleFullscreen = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsMaximized(false);
  }, []);

  const enterFullscreen = useCallback(() => {
    setIsMaximized(true);
  }, []);

  return {
    isMaximized,
    setIsMaximized,
    toggleFullscreen,
    exitFullscreen,
    enterFullscreen,
  };
}

export default useFullscreen;
