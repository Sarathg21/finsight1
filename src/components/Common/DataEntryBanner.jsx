import React from 'react';

/**
 * Determines whether the "DATA ENTRY IS IN PROGRESS" banner should be visible.
 * Rule:
 *   The banner remains visible until the 9th day of the following month (inclusive).
 *   Starting from the 10th of the following month (00:00:00 local time), it is hidden.
 *
 * Examples:
 *   October 2026  -> Visible until 09-Nov-2026, Hidden from 10-Nov-2026
 *   November 2026 -> Visible until 09-Dec-2026, Hidden from 10-Dec-2026
 *   December 2026 -> Visible until 09-Jan-2027, Hidden from 10-Jan-2027
 */
export function isDataEntryInProgress(periodInput, yearInput, currentDate = new Date()) {
  if (!periodInput && !yearInput) return false;

  let year = null;
  let monthIndex = null; // 0 to 11 (0=Jan, 9=Oct, 10=Nov, 11=Dec)

  const str = String(periodInput || '').trim();
  const yearStr = String(yearInput || '').trim();

  // 1. Check for YYYY-MM or YYYY-MM-DD (e.g. "2026-10", "2026-11-01")
  const isoMatch = str.match(/^(\d{4})[-\/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    monthIndex = parseInt(isoMatch[2], 10) - 1;
  }

  // 2. Check for DD-MM-YYYY (e.g. "31-10-2026")
  if (monthIndex === null) {
    const dmyMatch = str.match(/^\d{1,2}[-\/](\d{1,2})[-\/](\d{4})$/);
    if (dmyMatch) {
      monthIndex = parseInt(dmyMatch[1], 10) - 1;
      year = parseInt(dmyMatch[2], 10);
    }
  }

  // 3. Check for month names (e.g. "Oct-26", "October 2026", "Nov-26")
  if (monthIndex === null) {
    const monthNames = [
      ['jan', 'january'],
      ['feb', 'february'],
      ['mar', 'march'],
      ['apr', 'april'],
      ['may'],
      ['jun', 'june'],
      ['jul', 'july'],
      ['aug', 'august'],
      ['sep', 'sept', 'september'],
      ['oct', 'october'],
      ['nov', 'november'],
      ['dec', 'december']
    ];

    const lower = str.toLowerCase();
    for (let i = 0; i < monthNames.length; i++) {
      if (monthNames[i].some(name => lower.includes(name))) {
        monthIndex = i;
        break;
      }
    }

    // Extract year from period string or fallback to yearInput
    const yMatch = str.match(/\b(20\d{2})\b/) || str.match(/[-/ ](\d{2})$/);
    if (yMatch) {
      year = yMatch[1].length === 2 ? 2000 + parseInt(yMatch[1], 10) : parseInt(yMatch[1], 10);
    } else if (yearStr && /^\d{4}$/.test(yearStr)) {
      year = parseInt(yearStr, 10);
    }
  }

  // Fallback: year from yearInput
  if (year === null && yearStr) {
    const y = parseInt(yearStr, 10);
    if (!isNaN(y)) year = y;
  }

  // Fallback: numeric month index
  if (monthIndex === null) {
    const mNum = parseInt(str, 10);
    if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
      monthIndex = mNum - 1;
    }
  }

  if (year === null || monthIndex === null || monthIndex < 0 || monthIndex > 11) {
    return false;
  }

  // Cutoff is the 10th day of the following month at midnight (00:00:00 local time)
  const cutoffYear = monthIndex === 11 ? year + 1 : year;
  const cutoffMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const cutoffDate = new Date(cutoffYear, cutoffMonth, 10, 0, 0, 0, 0);

  const checkDate = new Date(currentDate);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate < cutoffDate;
}

export default function DataEntryBanner({ period, year, style = {} }) {
  const visible = isDataEntryInProgress(period, year);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes bsDataEntryShimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes bsDataEntryPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.84; }
        }
        @keyframes bsDataEntryDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.45); opacity: 0.55; }
        }
      `}</style>
      <div
        className="data-entry-in-progress-banner"
        role="status"
        aria-live="polite"
        style={{
          margin: '0 0 12px 0',
          borderRadius: 8,
          background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 35%, #991b1b 50%, #b91c1c 65%, #dc2626 100%)',
          backgroundSize: '200% 100%',
          animation: 'bsDataEntryShimmer 3.2s linear infinite, bsDataEntryPulse 2s ease-in-out infinite',
          padding: '9px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 0 16px rgba(220, 38, 38, 0.4), 0 2px 8px rgba(220, 38, 38, 0.25)',
          ...style,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#ffffff',
            animation: 'bsDataEntryDot 1.4s ease-in-out infinite',
          }}
        />
        <span
          style={{
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          DATA ENTRY IS IN PROGRESS
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#ffffff',
            animation: 'bsDataEntryDot 1.4s ease-in-out infinite 0.7s',
          }}
        />
      </div>
    </>
  );
}
