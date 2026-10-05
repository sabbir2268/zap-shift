import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Mail,
  UserRound,
  Users,
  UserCheck,
  Bike,
  Lock,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import useAuth from "../../../hooks/useAuth";
import PageLoader from "../../../components/PageLoader/PageLoader";
import { ROLES } from "../../../data/admin";

/* what each role can be turned into. the rider role is absent on purpose, it is
   a one way door: nobody hands it out and nobody takes it away */
const ACTIONS_BY_ROLE = {
  [ROLES.USER]: [ROLES.ADMIN, ROLES.RIDER],
  [ROLES.ADMIN]: [ROLES.RIDER, ROLES.USER],
  [ROLES.RIDER]: [],
};

const ROLE_META = {
  [ROLES.USER]: { label: "User", icon: UserRound, className: "bg-gray-100 text-gray-700" },
  [ROLES.RIDER]: { label: "Rider", icon: Bike, className: "bg-blue-100 text-blue-700" },
  [ROLES.ADMIN]: { label: "Admin", icon: ShieldCheck, className: "bg-[var(--secondary)] text-[var(--foreground)]" },
};

const getRoleMeta = (role) => ROLE_META[role] || ROLE_META[ROLES.USER];

const Administration = () => {
  const api = useAxios();
  const { profile } = useAuth();

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

  const counts = useMemo(() => {
    const result = { all: users.length, user: 0, rider: 0, admin: 0 };

    users.forEach((item) => {
      const role = item.role || ROLES.USER;

      if (result[role] !== undefined) result[role] += 1;
    });

    return result;
  }, [users]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return users.filter((item) => {
      const role = item.role || ROLES.USER;

      if (roleFilter !== "all" && role !== roleFilter) {
        return false;
      }

      if (!term) return true;

      return item.email?.toLowerCase().includes(term);
    });
  }, [users, query, roleFilter]);

  /* hands out a role, then refreshes the row in place from the answer of the
     server, which is where the truth lives */
  const changeRole = useCallback(
    async (target, nextRole) => {
      setWorkingId(target._id);

      try {
        const updated = await api.patch(`/api/users/${target._id}/role`, {
          role: nextRole,
        });

        setUsers((prev) =>
          prev.map((item) => (item._id === target._id ? { ...item, ...updated } : item))
        );

        toast.success(
          `${target.email} is now ${getRoleMeta(nextRole).label.toLowerCase()}`
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
              Every registered account, identified by its email. Give one the
              admin or the rider role, or send an admin back to a normal user.
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
            { key: "all", label: "Total Accounts", icon: Users },
            { key: "user", label: "Users", icon: UserRound },
            { key: "rider", label: "Riders", icon: Bike },
            { key: "admin", label: "Admins", icon: ShieldCheck },
          ].map((card) => {
            const active = roleFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() =>
                  setRoleFilter(active && card.key !== "all" ? "all" : card.key)
                }
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
            placeholder="Search by email"
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
          <PageLoader className="min-h-[60vh]" />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <Users size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No users found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query || roleFilter !== "all"
                ? "No email matches your filters."
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
                    <th className="px-4 py-3 font-semibold">Current Role</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Change Role
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => {
                    const role = item.role || ROLES.USER;
                    const meta = getRoleMeta(role);
                    const busy = workingId === item._id;
                    const isSelf = item._id === profile?._id;
                    const options = ACTIONS_BY_ROLE[role] || [];
                    /* the last admin is the only way into the panel, so the
                       button is taken away instead of letting the server refuse
                       it after the click */
                    const isLastAdmin = role === ROLES.ADMIN && counts.admin <= 1;

                    return (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {/* Email only, it is the one thing that identifies an
                            account across the whole platform */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0 font-bold text-xs">
                              {item.email?.[0]?.toUpperCase() || "U"}
                            </div>

                            <p className="font-semibold text-[var(--foreground)] truncate flex items-center gap-2">
                              <Mail size={13} className="shrink-0 text-[var(--text)]" />
                              {item.email}
                            </p>
                          </div>
                        </td>

                        {/* Current Role */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                          >
                            <meta.icon size={12} />
                            {meta.label}
                          </span>

                          {isSelf && (
                            <p className="mt-1 text-[10px] text-[var(--text)]">
                              Owner of this account
                            </p>
                          )}

                          {isLastAdmin && !isSelf && (
                            <p className="mt-1 text-[10px] text-[var(--text)]">
                              The last admin
                            </p>
                          )}
                        </td>

                        {/* Change Role */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {isSelf ? (
                              <span className="text-xs text-[var(--text)]">
                                That&apos;s you
                              </span>
                            ) : options.length === 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-[var(--text)]">
                                <Lock size={12} />
                                Locked to rider
                              </span>
                            ) : (
                              options.map((nextRole) => {
                                const nextMeta = getRoleMeta(nextRole);
                                const blocked =
                                  isLastAdmin && nextRole === ROLES.USER;

                                return (
                                  <button
                                    key={nextRole}
                                    type="button"
                                    disabled={busy || blocked}
                                    onClick={() => changeRole(item, nextRole)}
                                    title={
                                      blocked
                                        ? "The last admin cannot be demoted"
                                        : `Make ${nextMeta.label.toLowerCase()}`
                                    }
                                    className="
                                      inline-flex
                                      items-center gap-2
                                      rounded-full
                                      border border-gray-200
                                      px-4 py-2
                                      text-xs
                                      font-semibold
                                      text-[var(--foreground)]
                                      hover:bg-[var(--primary)]
                                      hover:border-[var(--primary)]
                                      transition-all duration-300
                                      disabled:opacity-40
                                      disabled:cursor-not-allowed
                                      disabled:hover:bg-transparent
                                      disabled:hover:border-gray-200
                                    "
                                  >
                                    <nextMeta.icon size={14} />
                                    {nextMeta.label}
                                  </button>
                                );
                              })
                            )}
                          </div>
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
          Only accounts with the admin role can open this page or change a role.
          You cannot change your own role and the last admin cannot be demoted.
          The rider role is final, a rider is neither made an admin nor sent
          back to a normal user.
        </p>
      </div>
    </section>
  );
};

export default Administration;