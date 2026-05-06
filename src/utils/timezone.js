/**
 * timezone.js — UAE timezone display utilities
 *
 * Problem:
 *   The backend stores timestamps as naive UTC (datetime.now(timezone.utc).replace(tzinfo=None)).
 *   When the frontend parses these bare strings (e.g. "2025-05-06T07:20:00"), JS Date treats
 *   them as LOCAL time rather than UTC — so in UAE (UTC+4) the displayed time is 4 hours behind.
 *
 * Fix:
 *   Append 'Z' to any timestamp that has no timezone suffix, forcing JS to interpret it as UTC.
 *   Then format using timeZone: 'Asia/Dubai' (UTC+4, no DST) for correct UAE local time.
 */

const UAE_TIMEZONE = 'Asia/Dubai';

/**
 * Normalises a raw timestamp string to a valid UTC Date object.
 * If the string has no 'Z' or '+' offset, we append 'Z' so JS treats it as UTC.
 *
 * @param {string|Date|null|undefined} raw
 * @returns {Date|null}
 */
export function parseUTC(raw) {
    if (!raw) return null;
    if (raw instanceof Date) return raw;

    let s = String(raw).trim();

    // Normalise Python datetime format: "2026-05-06 07:20:33.136173"
    // 1. Replace space separator with 'T' so it becomes valid ISO 8601
    s = s.replace(' ', 'T');
    // 2. Truncate microseconds to milliseconds (JS only supports 3 decimal places)
    //    e.g. "07:20:33.136173" → "07:20:33.136"
    s = s.replace(/(\.\d{3})\d+/, '$1');

    // Already has timezone info — parse as-is
    if (s.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(s)) {
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }
    // Naive timestamp — treat as UTC by appending 'Z'
    const d = new Date(s + 'Z');
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a stored UTC timestamp as a full date+time string in UAE local time.
 * Example output: "May 6, 2025, 11:20 AM"
 *
 * @param {string|Date|null|undefined} raw
 * @param {Intl.DateTimeFormatOptions} [overrideOptions]
 * @returns {string}
 */
export function formatUAEDateTime(raw, overrideOptions) {
    const d = parseUTC(raw);
    if (!d) return '';
    const opts = overrideOptions || {
        timeZone: UAE_TIMEZONE,
        dateStyle: 'medium',
        timeStyle: 'short',
    };
    if (!opts.timeZone) opts.timeZone = UAE_TIMEZONE;
    try {
        return new Intl.DateTimeFormat(undefined, opts).format(d);
    } catch {
        return d.toLocaleString();
    }
}

/**
 * Formats a stored UTC timestamp as a date-only string in UAE local time.
 * Example output: "May 6, 2025"
 *
 * @param {string|Date|null|undefined} raw
 * @returns {string}
 */
export function formatUAEDate(raw) {
    const d = parseUTC(raw);
    if (!d) return '';
    try {
        return new Intl.DateTimeFormat(undefined, {
            timeZone: UAE_TIMEZONE,
            dateStyle: 'medium',
        }).format(d);
    } catch {
        return d.toLocaleDateString();
    }
}

/**
 * Formats a stored UTC timestamp as a time-only string in UAE local time.
 * Example output: "11:20 AM"
 *
 * @param {string|Date|null|undefined} raw
 * @returns {string}
 */
export function formatUAETime(raw) {
    const d = parseUTC(raw);
    if (!d) return '';
    try {
        return new Intl.DateTimeFormat(undefined, {
            timeZone: UAE_TIMEZONE,
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    } catch {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

/**
 * Formats a stored UTC timestamp as a short date (YYYY-MM-DD) in UAE local time.
 * Useful for date-only comparisons that don't need full locale formatting.
 * Example output: "2025-05-06"
 *
 * @param {string|Date|null|undefined} raw
 * @returns {string}
 */
export function formatUAEDateISO(raw) {
    const d = parseUTC(raw);
    if (!d) return '';
    try {
        // Use 'en-CA' locale which reliably gives YYYY-MM-DD format
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: UAE_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(d);
    } catch {
        return d.toISOString().slice(0, 10);
    }
}
