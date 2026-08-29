import { Search, Bell, LogOut, Calendar, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': { title: 'CFO Dashboard', sub: 'Executive financial command centre' },
  '/exec-dashboard': { title: 'Exec Finance Dashboard', sub: 'Enterprise financial overview across all divisions' },
  '/finsight-dashboard': { title: 'Executive Dashboard', sub: 'Comprehensive financial performance overview' },
  '/pl': { title: 'Profit & Loss Report', sub: 'Income statement analysis' },
  '/ar': { title: 'Receivables Aging', sub: 'AR aging & collection tracking' },
  '/ap': { title: 'Payables Aging', sub: 'AP aging & cash planning' },
  '/inventory': { title: 'Inventory Aging', sub: 'Stock movement & slow-moving analysis' },
  '/workingcapital-report': { title: 'Working Capital Performance', sub: 'Monitor liquidity, assets, liabilities, and cash conversion performance' },
  '/working-capital': { title: 'Working Capital Dashboard', sub: 'DSO / DIO / DPO & NWC trend' },
  '/balance-sheet': { title: 'Balance Sheet', sub: 'Assets, liabilities & equity' },
  '/cash-collection': { title: 'Cash Collection Report', sub: 'Collections vs. targets' },
  '/fixed-assets': { title: 'Fixed Asset Register', sub: 'NBV, depreciation & movements' },
  '/country-performance': { title: 'Country Performance', sub: 'Cross-country KPI comparison' },
  '/salesman': { title: 'Salesman Dashboard', sub: 'Individual performance & AR tracking' },
  '/revenue': { title: 'Revenue Analysis', sub: 'Revenue by segment, product & period' },
  '/receivables': { title: 'Receivables Analysis', sub: 'Monitor outstanding receivables, aging & collection performance' },
  '/payables': { title: 'Payables Analysis', sub: 'Monitor outstanding payables, aging & payment obligations' },
  '/division': { title: 'Division Reports', sub: 'Division-wise financial performance' },
  '/bu-pack': { title: 'BU Financial Pack', sub: 'Business unit reporting pack' },
  '/admin': { title: 'User & Access Control', sub: 'Role management & security settings' },

};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const page = PAGE_TITLES[pathname] || { title: 'Finsight', sub: 'FJ Group Finance Intelligence' };

  const handleProfileClick = () => {
    if (pathname === "/profile") {
      navigate("/dashboard");
    } else {
      navigate("/profile");
    }
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase() || "ZE";
  };

  return (
    <header className="topbar">
      {/* Page title */}
      <div className="topbar-title">
        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {page.title}
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--clr-text-dim)', fontWeight: 400, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {page.sub}
        </div>
      </div>

      <div className="topbar-actions">
        {/* Context pill — FY + Entity */}
        <div
          className="hide-on-tablet"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--clr-surface-2)',
            padding: '5px 12px', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--clr-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={12} style={{ color: 'var(--clr-primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)' }}>FY 2026</span>
          </div>
          <div className="filter-divider" style={{ height: 12, margin: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Globe size={12} style={{ color: 'var(--clr-emerald)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--clr-text)' }}>All Entities</span>
          </div>
        </div>

        <div className="filter-divider hide-on-tablet" />

        {/* Search */}
        <div className="search-wrap hide-on-tablet">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search reports…"
            className="search-input"
            aria-label="Search"
          />
        </div>

        {/* Bell */}
        <button className="btn-icon" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={16} />
          <span
            className="live-dot"
            style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, border: '1.5px solid var(--clr-surface)' }}
          />
        </button>

        <div className="filter-divider" />


        {/* User */}
        <div
          className="user-menu-wrap"
          onClick={handleProfileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleProfileClick();
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            cursor: "pointer",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30,
              height: 30,
              minWidth: 30,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.62rem",
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(99,102,241,0.25)",
              textTransform: "uppercase",
            }}
          >
            {getInitials(user?.name || "Zenith User")}
          </div>

          {/* User Details */}
          <div
            className="hide-on-tablet"
            style={{
              lineHeight: 1.25,
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--clr-text)",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "Zenith User"}
            </div>

            <div
              style={{
                fontSize: "0.6rem",
                color: "var(--clr-text-dim)",
                fontWeight: 400,
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
            >
              {user?.roleLabel || "User"}
            </div>
          </div>

          {/* Logout SVG */}
          <button
            className="btn-icon btn-icon-danger"
            onClick={logout}
            title="Logout"
            id="logout-btn"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

