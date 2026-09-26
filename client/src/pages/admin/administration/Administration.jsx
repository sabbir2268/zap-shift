import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Mail,
  UserRound,
  Users,
  ShieldPlus,
  UserCheck,
  Bike,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import useAuth from "../../../hooks/useAuth";
import { ADMIN_EMAIL, isAdminEmail } from "../../../data/admin";

const ROLES = [
  { value: "user", label: "User", icon: UserRound, className: "bg-gray-100 text-gray-700" },
  { value: "rider", label: "Rider", icon: Bike, className: "bg-blue-100 text-blue-700" },
  { value: "admin", label: "Admin", icon: ShieldCheck, className: "bg-[var(--secondary)] text-[var(--foreground)]" },
];

const getRoleMeta = (role) =>
  ROLES.find((item) => item.value === role) || ROLES[0];

const Administration = () => {
  const api = useAxios();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [workingId, setWorkingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.get("/api/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return users.filter((item) => {
      if (roleFilter !== "all" && (item.role || "user") !== roleFilter) {
        return false;
      }

      if (!term) return true;

      return [item.name, item.email, item.riderID]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [users, query, roleFilter]);

  const counts = useMemo(() => {
    const result = { all: users.length, user: 0, rider: 0, admin: 0 };

    users.forEach((item) => {
      const role = item.role || "user";

      if (result[role] !== undefined) result[role] += 1;
    });

    return result;
  }, [users]);

  /* promotes or demotes a user, then refreshes the row in place */
  const changeRole = useCallback(
    async (target, nextRole) => {
      if (target.role === nextRole) return;

      setWorkingId(target._id);

      try {
        const updated = await api.patch(`/api/users/${target._id}/role`, {
          role: nextRole,
        });

        setUsers((prev) =>
          prev.map((item) => (item._id === target._id ? { ...item, ...updated } : item))
        );

        toast.success(
          `${target.name || target.email} is now ${getRoleMeta(nextRole).label.toLowerCase()}`
        );
      } catch (error) {
        toast.error(error.message || "Failed to update role");
      } finally {
        setWorkingId(null);
      }
    },
    [api]
  );

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Administration
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Promote logged in users to admin or send them back to a normal role.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            className="
              shrink-0
              px-6 py-3
              rounded-full
              bg-[var(--foreground)]
              text-[var(--secondary)]
              font-semibold
              hover:bg-[var(--primary)]
              hover:text-[var(--foreground)]
              transition-all duration-300
              flex items-center gap-2
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { key: "all", label: "Total Users", icon: Users },
            { key: "user", label: "Users", icon: UserRound },
            { key: "rider", label: "Riders", icon: Bike },
            { key: "admin", label: "Admins", icon: ShieldCheck },
          ].map((card) => {
            const active = roleFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setRoleFilter(active && card.key !== "all" ? "all" : card.key)}
                className={`
                  bg-white rounded-2xl border p-4 text-left transition
                  ${
                    active
                      ? "border-[var(--foreground)] shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-center gap-2 text-[var(--text)] text-xs font-semibold uppercase tracking-wide">
                  <card.icon size={14} />
                  {card.label}
                </div>
                <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">
                  {counts[card.key]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/50"
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or rider id"
            className="
              w-full
              rounded-full
              border
              border-gray-200
              bg-white
              py-3
              pl-11
              pr-4
              outline-none
              focus:border-[var(--foreground)]
            "
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <Users size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No users found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query || roleFilter !== "all"
                ? "No users match your filters."
                : "Users appear here once they register."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Rider ID
                    </th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => {
                    const role = item.role || "user";
                    const meta = getRoleMeta(role);
                    const busy = workingId === item._id;
                    const isOwner = isAdminEmail(item.email);
                    const isSelf = item.email === currentUser?.email;

                    return (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0 font-bold text-xs">
                              {(item.name || item.email)?.[0]?.toUpperCase() || "U"}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--foreground)] truncate">
                                {item.name || "Unnamed user"}
                              </p>
                              <p className="text-xs text-[var(--text)] truncate flex items-center gap-1">
                                <Mail size={12} />
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Rider ID */}
                        <td className="hidden px-4 py-3 md:table-cell">
                          <span className="font-mono text-xs text-[var(--text)]">
                            {item.riderID || "—"}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                          >
                            <meta.icon size={12} />
                            {meta.label}
                          </span>

                          {isOwner && (
                            <p className="mt-1 text-[10px] text-[var(--text)]">
                              Owner account
                            </p>
                          )}

                          {role === "rider" && (
                            <p className="mt-1 text-[10px] text-[var(--text)]">
                              Admin not allowed
                            </p>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          {isOwner || isSelf ? (
                            <span className="text-xs text-[var(--text)]">
                              {isOwner ? "Protected" : "That's you"}
                            </span>
                          ) : (
                            <select
                              value={role}
                              disabled={busy}
                              onChange={(e) => changeRole(item, e.target.value)}
                              className="
                                rounded-xl
                                border
                                border-gray-200
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                outline-none
                                bg-white
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                              "
                            >
                              {ROLES.map((option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                  disabled={option.value === "admin" && role === "rider"}
                                >
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 text-xs text-[var(--text)]">
          <UserCheck size={14} className="mt-0.5 shrink-0" />
          Role changes take effect on the user&apos;s next page load, the owner
          account {ADMIN_EMAIL} can never be demoted from this page, and a rider
          cannot be given the admin role.
        </p>
      </div>
    </section>
  );
};

export default Administration;
