import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * KpiInfoTooltip
 * ──────────────
 * Reusable information icon (ⓘ) with a rich tooltip for KPI cards.
 *
 * Props:
 *  - tooltipData {object} — From kpiTooltipData.js (title, definition, formula,
 *                           calculationBasis, source, notes[])
 *  - size        {number} — Icon size in px (default 13)
 *  - color       {string} — Icon colour (default '#64748b')
 *
 * Features:
 *  - Opens on hover AND click
 *  - Closes on click-outside or Escape key
 *  - Portal-based rendering to escape card overflow:hidden clipping
 *  - Smart positioning: flips to top/left/right when near viewport edges
 *  - Fully accessible (button role, aria-expanded, aria-label)
 *  - Works on desktop and mobile (touch)
 */
export default function KpiInfoTooltip({ tooltipData, size = 13, color = '#64748b' }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const btnRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // Calculate smart position using viewport coordinates
  const computePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const TIP_WIDTH = 320;
    const TIP_HEIGHT_ESTIMATE = 300;
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

    setPos({ top, left, placement });
  }, []);

  const open = useCallback(() => {
    computePosition();
    setVisible(true);
  }, [computePosition]);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // Hover: show after 150ms delay, hide immediately on leave
  const handleMouseEnter = () => {
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(open, 150);
  };

  const handleMouseLeave = (e) => {
    clearTimeout(hoverTimerRef.current);
    // Keep open if mouse moves into the tooltip itself
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

  if (!tooltipData) return null;

  const tooltipEl = visible ? (
    <div
      ref={tooltipRef}
      onMouseLeave={handleTooltipMouseLeave}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: 320,
        zIndex: 99999,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(15,23,42,0.14), 0 2px 6px rgba(15,23,42,0.08)',
        padding: '14px 16px',
        fontSize: '0.73rem',
        lineHeight: 1.55,
        color: '#1e293b',
        fontFamily: 'inherit',
        pointerEvents: 'auto',
        animation: 'kpiTipFadeIn 0.14s ease',
      }}
      role="tooltip"
      aria-label={`${tooltipData.title} definition and formula`}
    >
      <style>{`
        @keyframes kpiTipFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Title */}
      <div style={{
        fontWeight: 800,
        fontSize: '0.78rem',
        color: '#0f172a',
        marginBottom: 8,
        paddingBottom: 7,
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#dbeafe',
          color: '#1d4ed8',
          fontSize: '0.68rem',
          fontWeight: 900,
          flexShrink: 0,
        }}>ⓘ</span>
        {tooltipData.title}
      </div>

      {/* Definition */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
          Definition
        </div>
        <div style={{ color: '#334155' }}>{tooltipData.definition}</div>
      </div>

      {/* Formula */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
          Formula
        </div>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '6px 10px',
          fontFamily: 'monospace, monospace',
          fontSize: '0.7rem',
          color: '#1d4ed8',
          fontWeight: 600,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {tooltipData.formula}
        </div>
      </div>

      {/* Calculation Basis */}
      <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0, paddingTop: 1 }}>
          Basis:
        </span>
        <span style={{
          background: '#eff6ff',
          color: '#1d4ed8',
          borderRadius: 4,
          padding: '1px 7px',
          fontSize: '0.68rem',
          fontWeight: 700,
          border: '1px solid #bfdbfe',
        }}>
          {tooltipData.calculationBasis}
        </span>
      </div>

      {/* Source */}
      <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0, paddingTop: 1 }}>
          Source:
        </span>
        <span style={{ color: '#334155', fontSize: '0.7rem' }}>{tooltipData.source}</span>
      </div>

      {/* Notes */}
      {tooltipData.notes && tooltipData.notes.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Notes
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 14px', listStyleType: 'disc' }}>
            {tooltipData.notes.map((note, i) => (
              <li key={i} style={{ marginBottom: i < tooltipData.notes.length - 1 ? 4 : 0, color: '#475569' }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Arrow indicator */}
      <div style={{
        position: 'absolute',
        [pos.placement === 'bottom' ? 'top' : 'bottom']: -6,
        left: Math.min(Math.max(pos.left > 12 ? 160 : 20, 16), 288),
        width: 10,
        height: 10,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        transform: 'rotate(45deg)',
        borderRight: pos.placement === 'bottom' ? '1px solid #e2e8f0' : 'none',
        borderBottom: pos.placement === 'bottom' ? '1px solid #e2e8f0' : 'none',
        borderLeft: pos.placement === 'top' ? '1px solid #e2e8f0' : 'none',
        borderTop: pos.placement === 'top' ? '1px solid #e2e8f0' : 'none',
        boxShadow: 'none',
        zIndex: -1,
      }} />
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`Information about ${tooltipData.title}`}
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
        title={`About ${tooltipData.title}`}
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
