import { createContext, useContext, useCallback } from 'react';

// ── Audit Log Context ────────────────────────────────────────────────
// Tracks: login, logout, report_access, filter_change, export, role_change
// Persisted to localStorage key: finsight_audit_log

const AuditContext = createContext(null);

const STORAGE_KEY = 'finsight_audit_log';
const MAX_ENTRIES = 500; // cap to prevent unbounded growth

function now() {
  return new Date().toISOString();
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLog(entries) {
  // Keep newest MAX_ENTRIES
  const trimmed = entries.slice(-MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function AuditProvider({ children }) {
  const log = useCallback((action, payload = {}) => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('finsight_user') || 'null');
    } catch { /* ignore */ }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now(),
      action,            // e.g. 'login', 'logout', 'report_access', 'filter_change', 'export', 'role_change'
      userId: user?.id || null,
      userName: user?.name || null,
      userRole: user?.role || null,
      ...payload,        // extra context: page, filterKey, filterValue, exportType, targetUserId, etc.
    };

    const existing = loadLog();
    saveLog([...existing, entry]);
  }, []);

  function getLog() {
    return loadLog().reverse(); // newest first
  }

  function clearLog() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuditContext.Provider value={{ log, getLog, clearLog }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  return useContext(AuditContext);
}
