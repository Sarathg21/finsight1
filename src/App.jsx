import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';
import { FilterProvider } from './context/FilterContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CFODashboard from './pages/CFODashboard';
import ExecDashboard from './pages/ExecDashboard';
import PLAnalytics from './pages/PLAnalytics';
import ARDashboard from './pages/ARDashboard';
import WCDashboard from './pages/WCDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExcelConsolidator from './pages/ExcelConsolidator';
import FinSightDashboard from './pages/FinSightDashboard';

// Placeholder for yet-to-be-built pages
const PlaceholderPage = ({ title }) => (
  <div className="animate-in">
    <div className="page-header">
      <div>
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-subtitle">Module development in progress...</p>
      </div>
    </div>
    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏗️</div>
      <h2 style={{ marginBottom: '10px' }}>Advanced Analytics Coming Soon</h2>
      <p style={{ color: 'var(--clr-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
        This reporting module is currently being mapped to the Oracle Fusion ERP data streams.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            <Route element={<FilterProvider><Layout /></FilterProvider>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {/* Each route is guarded by ProtectedRoute with its pageKey */}
              <Route path="/dashboard"          element={<ProtectedRoute pageKey="dashboard"          element={<CFODashboard />} />} />
              <Route path="/exec-dashboard"     element={<ProtectedRoute pageKey="exec-dashboard"     element={<ExecDashboard />} />} />
              <Route path="/finsight-dashboard" element={<FinSightDashboard />} />
              <Route path="/country-performance"element={<ProtectedRoute pageKey="country-performance"element={<PlaceholderPage title="Country Performance" />} />} />
              <Route path="/working-capital"    element={<ProtectedRoute pageKey="working-capital"    element={<WCDashboard />} />} />
              <Route path="/division"           element={<ProtectedRoute pageKey="division"           element={<PlaceholderPage title="Division-wise Reporting" />} />} />
              <Route path="/salesman"           element={<ProtectedRoute pageKey="salesman"           element={<PlaceholderPage title="Salesman-wise Reporting" />} />} />
              <Route path="/bu-pack"            element={<ProtectedRoute pageKey="bu-pack"            element={<PlaceholderPage title="BU Financial Pack" />} />} />
              <Route path="/pl"                 element={<ProtectedRoute pageKey="pl"                 element={<PLAnalytics />} />} />
              <Route path="/balance-sheet"      element={<ProtectedRoute pageKey="balance-sheet"      element={<PlaceholderPage title="Balance Sheet" />} />} />
              <Route path="/revenue"            element={<ProtectedRoute pageKey="revenue"            element={<PlaceholderPage title="Revenue Analysis" />} />} />
              <Route path="/cash-collection"    element={<ProtectedRoute pageKey="cash-collection"   element={<PlaceholderPage title="Cash Collection Report" />} />} />
              <Route path="/fixed-assets"       element={<ProtectedRoute pageKey="fixed-assets"      element={<PlaceholderPage title="Fixed Asset Report" />} />} />
              <Route path="/bank-facility"      element={<ProtectedRoute pageKey="bank-facility"     element={<PlaceholderPage title="Bank Facility Utilization" />} />} />
              <Route path="/ar"                 element={<ProtectedRoute pageKey="ar"                 element={<ARDashboard />} />} />
              <Route path="/ap"                 element={<ProtectedRoute pageKey="ap"                 element={<PlaceholderPage title="AP Aging Report" />} />} />
              <Route path="/inventory"          element={<ProtectedRoute pageKey="inventory"          element={<PlaceholderPage title="Inventory Aging" />} />} />
              <Route path="/excel-consolidator" element={<ProtectedRoute pageKey="excel-consolidator" element={<ExcelConsolidator />} />} />
              {/* Admin – segregated, board & CFO only */}
              <Route path="/admin"              element={<ProtectedRoute pageKey="admin"              element={<AdminDashboard />} />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuditProvider>
    </AuthProvider>
  );
}

export default App;
