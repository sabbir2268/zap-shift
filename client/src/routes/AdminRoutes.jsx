import React from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import useAuth from "../hooks/useAuth";
import PageLoader from "../components/PageLoader/PageLoader";

/* shown to a signed in account whose role is not admin */
const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
    <div className="max-w-md w-full text-center bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-10">
      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-400/15 text-red-600 dark:text-red-400 flex items-center justify-center">
        <ShieldAlert size={30} />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
        Access denied
      </h1>

      <p className="mt-3 text-sm text-[var(--text)] leading-6">
        This area is limited to accounts with the admin role. Your account does
        not have that role, so there is nothing to show you here.
      </p>

      <Link
        to="/dashboard"
        className="mt-8 inline-block rounded-full bg-[var(--ink)] text-[var(--secondary)] font-semibold px-7 py-3 transition-colors duration-300 hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      >
        Go to my dashboard
      </Link>
    </div>
  </div>
);

/*
 * Blocks the admin panel from everyone whose role, as stored on the server, is
 * not admin. The api enforces the same rule again, this only avoids rendering
 * the panel to someone who should never see it.
 */
const AdminRoutes = ({ children }) => {
  const { user, loading, isAdmin, roleReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* wait for the role, otherwise a promoted admin gets bounced */
  if (!roleReady) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return children;
};

export default AdminRoutes;
