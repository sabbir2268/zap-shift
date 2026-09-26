import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Bike,
  Users,
  Package,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import logo from "../assets/logo.png";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/pending-riders", label: "Pending Rider", icon: ClipboardList },
  { to: "/admin/active-riders", label: "Active Rider", icon: Bike },
  { to: "/admin/manage-users", label: "Manage User", icon: Users },
  { to: "/admin/manage-parcels", label: "Manage Parcel", icon: Package },
  { to: "/admin/manage-payments", label: "Manage Payment", icon: CreditCard },
];

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logOut } = useAuth();

  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeDrawer();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logOut()
      .then(() => toast.success("Logged out successfully!"))
      .catch((error) => toast.error(error.message || "Failed to log out"));
  };

  const initial = (
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    "A"
  ).toUpperCase();

  return (
    <div className="min-h-screen lg:flex">
      {/* ================= MOBILE TOP BAR ================= */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-[var(--foreground)] px-4 py-3 shadow-md">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="p-2 rounded-lg text-white hover:bg-white/10 transition"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ZapShift logo" className="h-9 w-9" />
          <span className="text-xl font-bold text-[var(--secondary)]">
            Admin
          </span>
        </Link>

        <div className="w-9" />
      </header>

      {/* ================= BACKDROP (MOBILE) ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* ================= SIDEBAR / DRAWER ================= */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-[var(--foreground)]
          text-white
          shadow-2xl
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <Link
            to="/"
            onClick={closeDrawer}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="ZapShift logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-[var(--secondary)]">
              ZapShift
            </span>
          </Link>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `
                flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition-all duration-200
                ${
                  isActive
                    ? "bg-[var(--secondary)] text-[var(--foreground)]"
                    : "text-white hover:bg-white/10"
                }
                `
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-white/10 px-4 py-5">
          <div className="flex items-center gap-3 px-2 pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] font-bold text-[var(--foreground)]">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.displayName || user?.email?.split("@")[0] || "Admin"}
              </p>

              <p className="truncate text-xs text-white/60">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-semibold text-red-300 transition hover:bg-white/10 hover:text-red-400"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-screen bg-[var(--background)] px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8 lg:flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
