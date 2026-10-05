import React from "react";
import { Link, Navigate, useLocation } from "react-router";
import { ShieldAlert } from "lucide-react";
import useAuth from "../hooks/useAuth";
import PageLoader from "../components/PageLoader/PageLoader";

/* shown to a signed in account whose role is not rider */
const RiderAccessDenied = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-md w-full text-center bg-white rounded-3xl border border-gray-200 p-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <ShieldAlert size={30} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">
          Access denied
        </h1>

        <p className="mt-3 text-sm text-[var(--text)] leading-6">
          The rider dashboard is limited to accounts with the rider role. Your
          account does not have that role, so there is nothing to show you here.
        </p>

        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          className="mt-8 inline-block rounded-full bg-[var(--foreground)] text-[var(--secondary)] font-semibold px-7 py-3 transition-colors duration-300 hover:bg-[var(--primary)] hover:text-[var(--foreground)]"
        >
          {isAdmin ? "Go to the admin panel" : "Go to my dashboard"}
        </Link>
      </div>
    </div>
  );
};

/*
 * Blocks the rider dashboard from everyone whose role, as stored on the server,
 * is not rider. The api enforces the same rule again, this only avoids rendering
 * the panel to someone who should never see it.
 */
const RiderRoutes = ({ children }) => {
  const { user, loading, isRider, roleReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* wait for the role, otherwise a fresh rider gets bounced */
  if (!roleReady) {
    return <PageLoader />;
  }

  if (!isRider) {
    return <RiderAccessDenied />;
  }

  return children;
};

/*
 * Keeps a rider off the customer dashboard, so a rider who signs in lands on the
 * rider panel rather than the one built for senders. An admin is still sent to
 * the admin panel, exactly as before.
 */
export const DashboardRedirect = ({ children }) => {
  const { user, loading, isAdmin, isRider, roleReady } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return children;
  }

  if (!roleReady) {
    return <PageLoader />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isRider) {
    return <Navigate to="/rider" replace />;
  }

  return children;
};

export default RiderRoutes;
