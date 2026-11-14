import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * KpiInfoTooltip
 * ──────────────
 * Compact formula tooltip for KPI cards and tables.
 *
 * Displays ONLY the approved mathematical formula in a sleek, non-intrusive popover.
 *
 * Props:
 *  - tooltipData {object} — From kpiTooltipData.js (contains formula, title)
 *  - size        {number} — Icon size in px (default 13)
 *  - color       {string} — Icon colour (default '#64748b')
 *
 * Features:
 *  - Opens on hover AND click
 *  - Closes on click-outside or Escape key
 *  - Portal-based rendering to escape card overflow:hidden clipping
 *  - Smart positioning with dynamic arrow pointing directly to the info icon
 *  - Ultra-compact height (~75px) avoiding chart or content obstruction
 *  - Fully accessible (button role, aria-expanded, aria-label)
 */
export default function KpiInfoTooltip({ tooltipData, size = 13, color = '#64748b' }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'bottom', arrowLeft: 20 });
  const btnRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Calculate smart position using viewport coordinates
  const computePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const TIP_WIDTH = 320;
    const TIP_HEIGHT_ESTIMATE = 85;
    const OFFSET = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left + rect.width / 2 - TIP_WIDTH / 2;
    let top = rect.bottom + OFFSET;
    let placement = 'bottom';

    // Flip above if too close to bottom
    if (top + TIP_HEIGHT_ESTIMATE > vh - 16) {
      top = rect.top - TIP_HEIGHT_ESTIMATE - OFFSET;
      placement = 'top';
    }

    // Clamp horizontal
    if (left + TIP_WIDTH > vw - 12) left = vw - TIP_WIDTH - 12;
    if (left < 12) left = 12;

    const btnCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(12, Math.min(btnCenter - left - 5, TIP_WIDTH - 22));

    setPos({ top, left, placement, arrowLeft });
  }, []);

  const open = useCallback(() => {
    computePosition();
    setVisible(true);
  }, [computePosition]);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // Hover: show after 120ms delay, hide immediately on leave
  const handleMouseEnter = () => {
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(open, 120);
  };

  const handleMouseLeave = (e) => {
    clearTimeout(hoverTimerRef.current);
    if (tooltipRef.current && tooltipRef.current.contains(e.relatedTarget)) return;
    close();
  };

  const handleTooltipMouseLeave = (e) => {
    if (btnRef.current && btnRef.current.contains(e.relatedTarget)) return;
    close();
  };

  // Click toggle
  const handleClick = (e) => {
    e.stopPropagation();
    if (visible) {
      close();
    } else {
      open();
    }
  };

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, close]);

  // Close on outside click
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visible, close]);

  // Recompute on scroll/resize
  useEffect(() => {
    if (!visible) return;
    const handler = () => computePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [visible, computePosition]);

  // Cleanup hover timer on unmount
  useEffect(() => () => clearTimeout(hoverTimerRef.current), []);

  if (!tooltipData || !tooltipData.formula) return null;

  const tooltipEl = visible ? (
    <div
      ref={tooltipRef}
      onMouseLeave={handleTooltipMouseLeave}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: 'max-content',
        maxWidth: 340,
        minWidth: 220,
        zIndex: 99999,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        boxShadow: '0 8px 20px rgba(15,23,42,0.12), 0 2px 5px rgba(15,23,42,0.06)',
        padding: '9px 12px',
        fontSize: '0.73rem',
        lineHeight: 1.45,
        color: '#1e293b',
        fontFamily: 'inherit',
        pointerEvents: 'auto',
        animation: 'kpiTipFadeIn 0.14s ease',
      }}
      role="tooltip"
      aria-label={`${tooltipData.title || 'KPI'} formula: ${tooltipData.formula}`}
    >
      <style>{`
        @keyframes kpiTipFadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header: Formula label */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 5,
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: '#dbeafe',
          color: '#1d4ed8',
          fontSize: '0.58rem',
          fontWeight: 900,
          flexShrink: 0,
        }}>ⓘ</span>
        <span>Formula</span>
      </div>

      {/* Formula content */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '7px 11px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.72rem',
        color: '#1d4ed8',
        fontWeight: 600,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.45,
      }}>
        {tooltipData.formula}
      </div>

      {/* Arrow indicator pointing to info icon */}
      <div style={{
        position: 'absolute',
        [pos.placement === 'bottom' ? 'top' : 'bottom']: -5,
        left: pos.arrowLeft,
        width: 9,
        height: 9,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        transform: 'rotate(45deg)',
        borderRight: pos.placement === 'bottom' ? '1px solid #cbd5e1' : 'none',
        borderBottom: pos.placement === 'bottom' ? '1px solid #cbd5e1' : 'none',
        borderLeft: pos.placement === 'top' ? '1px solid #cbd5e1' : 'none',
        borderTop: pos.placement === 'top' ? '1px solid #cbd5e1' : 'none',
        boxShadow: 'none',
        zIndex: 1,
      }} />
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Formula for ${tooltipData.title || 'KPI'}`}
        aria-expanded={visible}
        aria-haspopup="true"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size + 4,
          height: size + 4,
          borderRadius: '50%',
          border: 'none',
          background: visible ? '#dbeafe' : 'transparent',
          color: visible ? '#1d4ed8' : color,
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          transition: 'background 0.15s, color 0.15s',
          lineHeight: 1,
          verticalAlign: 'middle',
          marginLeft: 3,
        }}
        title={`Formula: ${tooltipData.formula}`}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <text
            x="8"
            y="12"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="bold"
            fill="currentColor"
            fontFamily="serif"
          >i</text>
        </svg>
      </button>
      {/* Render tooltip via portal to escape overflow:hidden card containers */}
      {typeof document !== 'undefined' && createPortal(tooltipEl, document.body)}
    </>
  );
}
