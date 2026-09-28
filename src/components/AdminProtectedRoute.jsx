import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ user }) {
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/access-denied"
        state={{ from: location }}
        replace
      />
    );
  }

  const isAdmin =
    String(user.role_code || "").toUpperCase() === "ADMIN";

  if (!isAdmin) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    );
  }

  return <Outlet />;
}