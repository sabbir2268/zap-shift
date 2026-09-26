import React from "react";
import useAuth from "../hooks/useAuth";
import { isAdminUser } from "../data/admin";
import { Navigate, useLocation } from "react-router";

/* Blocks the admin panel from non-admin users */
const AdminRoutes = ({ children }) => {
  const { user, loading, role, roleReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* wait for the role, otherwise a promoted admin gets bounced */
  if (!roleReady) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  if (!isAdminUser(user, role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* Sends the admin away from the user dashboard */
export const AdminRedirect = ({ children }) => {
  const { user, loading, role, roleReady } = useAuth();

  if (loading) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  if (!user) {
    return children;
  }

  if (!roleReady) {
    return <span className="loading loading-spinner loading-xl"></span>;
  }

  if (isAdminUser(user, role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoutes;
