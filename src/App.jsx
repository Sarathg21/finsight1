
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AuditProvider } from "./context/AuditContext";
import { FilterProvider } from "./context/FilterContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import PLAnalytics from "./pages/PLAnalytics";
import ReceivablesDashboard from "./pages/ReceivablesDashboard";
import PayablesDashboard from "./pages/PayablesDashboard";
import InventoryAging from "./pages/InventoryAgingPage";
import SalesRevenueReport from "./pages/SalesRevenueReport";
import BalanceSheet from "./pages/BalanceSheet";
import OperatingAnalysis from "./pages/OperatingAnalysis";
import FinancialPosition from "./pages/FinancialPosition";
import WorkingCapitalReport from "./pages/WorkingCapitalReport";
import MyProfile from "./pages/MyProfile";

import AdminMainDashboard from "./pages/AdminMainDashboard";
import UsersDashboard from "./pages/UsersDashboard";
import RolesDashboard from "./pages/RolesDashboard";
import UserAccessManagement from "./pages/UserAccessManagement";
import MasterDataDashboard from "./pages/MasterDataDashboard";

function App() {
  return (
    <AuthProvider>
      <AuditProvider>
        <BrowserRouter>
          <Routes>
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />

            {/* Main application and reporting routes */}
            <Route
              element={
                <FilterProvider>
                  <Layout />
                </FilterProvider>
              }
            >
              <Route
                path="/"
                element={<Navigate to="/revenue" replace />}
              />

              <Route
                path="/profile"
                element={<MyProfile />}
              />

              <Route
                path="/pl"
                element={
                  <ProtectedRoute
                    pageKey="pl"
                    element={<PLAnalytics />}
                  />
                }
              />

              <Route
                path="/balance-sheet"
                element={
                  <ProtectedRoute
                    pageKey="balance-sheet"
                    element={<BalanceSheet />}
                  />
                }
              />

              <Route
                path="/operating-expenses"
                element={
                  <ProtectedRoute
                    pageKey="operating-expenses"
                    element={<OperatingAnalysis />}
                  />
                }
              />

              <Route
                path="/revenue"
                element={
                  <ProtectedRoute
                    pageKey="revenue"
                    element={<SalesRevenueReport />}
                  />
                }
              />

              <Route
                path="/receivables"
                element={
                  <ProtectedRoute
                    pageKey="receivables"
                    element={<ReceivablesDashboard />}
                  />
                }
              />

              <Route
                path="/payables"
                element={
                  <ProtectedRoute
                    pageKey="payables"
                    element={<PayablesDashboard />}
                  />
                }
              />

              <Route
                path="/inventory"
                element={
                  <ProtectedRoute
                    pageKey="inventory"
                    element={<InventoryAging />}
                  />
                }
              />

              <Route
                path="/WorkingCapital"
                element={
                  <ProtectedRoute
                    pageKey="WorkingCapital"
                    element={<WorkingCapitalReport />}
                  />
                }
              />

              <Route
                path="/FinancialPosition"
                element={
                  <ProtectedRoute
                    pageKey="FinancialPosition"
                    element={<FinancialPosition />}
                  />
                }
              />
            </Route>

            {/*
              Admin layout is deliberately not guarded by
              USER_MANAGEMENT. Each child route checks its own module.
            */}
            <Route
              path="/admin"
              element={
                <FilterProvider>
                  <Layout />
                </FilterProvider>
              }
            >
              <Route
                index
                element={<Navigate to="dashboard" replace />}
              />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute
                    pageKey="admin"
                    requiredAdminModule="USER_MANAGEMENT"
                    element={<AdminMainDashboard />}
                  />
                }
              />

              <Route
                path="users"
                element={
                  <ProtectedRoute
                    pageKey="admin"
                    requiredAdminModule="USER_MANAGEMENT"
                    element={<UsersDashboard />}
                  />
                }
              />

              <Route
                path="roles"
                element={
                  <ProtectedRoute
                    pageKey="roles"
                    requiredAdminModule="USER_MANAGEMENT"
                    element={<RolesDashboard />}
                  />
                }
              />

              <Route
                path="useraccess"
                element={
                  <ProtectedRoute
                    pageKey="useraccess"
                    requiredAdminModule="USER_MANAGEMENT"
                    element={<UserAccessManagement />}
                  />
                }
              />

              <Route
              
                path="master-data"
                element={
                  <ProtectedRoute
                    pageKey="master-data"
                    requiredViewModule="MASTER_DATA"
                    element={<MasterDataDashboard />}
                  />
                }
              />
            </Route>

            {/* Unknown route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuditProvider>
    </AuthProvider>
  );
}

export default App;
