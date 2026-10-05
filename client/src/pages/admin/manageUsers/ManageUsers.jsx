import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  RefreshCw,
  Search,
  Mail,
  Package,
  UserRound,
  Eye,
  Ban,
  Lock,
  Loader2,
  X,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PageLoader from "../../../components/PageLoader/PageLoader";
import { ADMIN_ROLE } from "../../../data/admin";

const ManageUsers = () => {
  const api = useAxios();

  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [selected, setSelected] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      /* the user records are the source of truth, the parcels only add stats.
         deriving users from parcels instead would hide anybody who registered
         but never sent one, and would leave no id to block them with */
      const [records, parcelList] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/parcels"),
      ]);

      setUsers(Array.isArray(records) ? records : []);
      setParcels(Array.isArray(parcelList) ? parcelList : []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const statsByEmail = useMemo(() => {
    const map = new Map();

    parcels.forEach((parcel) => {
      const email = parcel.userEmail;
      if (!email) return;

      const key = email.toLowerCase();
      const stats = map.get(key) || {
        parcelCount: 0,
        deliveredCount: 0,
        totalSpent: 0,
        lastActivity: null,
      };

      stats.parcelCount += 1;

      if (parcel.status === "delivered") stats.deliveredCount += 1;

      stats.totalSpent += Number(parcel.totalCost) || 0;

      const createdAt = parcel.createdAt ? new Date(parcel.createdAt) : null;

      if (createdAt && (!stats.lastActivity || createdAt > stats.lastActivity)) {
        stats.lastActivity = createdAt;
      }

      map.set(key, stats);
    });

    return map;
  }, [parcels]);

  const rows = useMemo(
    () =>
      users.map((user) => {
        const email = (user.email || "").toLowerCase();
        const stats = statsByEmail.get(email) || {
          parcelCount: 0,
          deliveredCount: 0,
          totalSpent: 0,
          lastActivity: null,
        };

        return {
          ...user,
          name: user.name || user.email?.split("@")[0] || "—",
          ...stats,
          accountStatus: user.blocked === true ? "blocked" : "active",
        };
      }),
    [users, statsByEmail]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return rows;

    return rows.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [rows, query]);

  /* an admin account is never blockable, the server refuses it, so the button
     is disabled rather than left to fail after the click */
  const canBlock = (user) => user.role !== ADMIN_ROLE;

  const handleBlock = async (user) => {
    const blocking = user.accountStatus !== "blocked";

    setBusyId(user._id);

    try {
      const updated = await api.patch(`/api/users/${user._id}/block`, {
        blocked: blocking,
      });

      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? { ...item, blocked: updated?.blocked === true }
            : item
        )
      );

      toast.success(
        blocking
          ? `${user.name} has been blocked`
          : `${user.name} has been unblocked`
      );
    } catch (error) {
      toast.error(error.message || "Could not update this account");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Manage User
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              View registered users and their delivery activity.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            className="
              px-6 py-3
              rounded-full
              bg-[var(--ink)]
              text-[var(--secondary)]
              font-semibold
              hover:bg-[var(--surface)]
              hover:text-[var(--foreground)]
              transition-all duration-300
              flex items-center gap-2
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>
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
            placeholder="Search by name, email or role"
            className="
              w-full
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
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
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-16 text-center">
            <Users size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No users found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No users match your search."
                : "Users appear here once they register."}
            </p>
          </div>
        ) : (
          <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      User
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Role
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Parcels
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Delivered
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Spent
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Account
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-[var(--text)]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((user) => {
                    const initial = user.name?.[0]?.toUpperCase();
                    const busy = busyId === user._id;
                    const blocked = user.accountStatus === "blocked";
                    const blockable = canBlock(user);

                    return (
                      <tr key={user._id} className="hover:bg-[var(--surface-muted)]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="
                                w-10 h-10
                                rounded-full
                                bg-[var(--secondary)]
                                text-[var(--text-on-secondary)]
                                flex items-center justify-center
                                shrink-0
                                font-bold
                              "
                            >
                              {initial}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--foreground)] truncate">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--text)] capitalize">
                          {user.role}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
                          {user.parcelCount}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
                          {user.deliveredCount}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[var(--foreground)]">
                          ৳{user.totalSpent}
                        </td>

                        {/* the column header already says Account, so the
                            badge does not repeat the kind in front of it */}
                        <td className="px-5 py-4">
                          <StatusBadge
                            kind="account"
                            value={user.accountStatus}
                            bare
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelected(user)}
                              title="View Details"
                              className="
                                w-9
                                h-9
                                rounded-lg
                                border
                                border-[var(--border)]
                                flex
                                items-center
                                justify-center
                                text-[var(--foreground)]
                                hover:bg-[var(--surface-muted)]
                                transition
                              "
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBlock(user)}
                              disabled={busy || !blockable}
                              title={
                                !blockable
                                  ? "An admin account cannot be blocked"
                                  : blocked
                                  ? "Unblock user"
                                  : "Block user"
                              }
                              className={`
                                w-9
                                h-9
                                rounded-lg
                                border
                                flex
                                items-center
                                justify-center
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                                ${
                                  blocked
                                    ? "border-green-200 dark:border-green-400/40 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-400/20"
                                    : "border-red-200 dark:border-red-400/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/20"
                                }
                              `}
                            >
                              {busy ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : blocked ? (
                                <Lock size={15} />
                              ) : (
                                <Ban size={15} />
                              )}
                            </button>
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
      </div>

      {selected && (
        <UserModal
          user={selected}
          parcels={parcels.filter(
            (parcel) =>
              (parcel.userEmail || "").toLowerCase() ===
              (selected.email || "").toLowerCase()
          )}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
};

const UserModal = ({ user, parcels, onClose }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="
          relative
          w-full
          max-w-lg
          max-h-[85vh]
          overflow-y-auto
          bg-[var(--surface)]
          rounded-3xl
          shadow-2xl
        "
      >
        <div className="h-2 bg-[var(--secondary)] rounded-t-3xl" />

        <div className="p-6">
          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-4
              top-5
              w-9
              h-9
              rounded-full
              bg-[var(--surface-muted)]
              flex
              items-center
              justify-center
              text-[var(--text-muted)]
              hover:bg-[var(--surface-hover)]
              transition
            "
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="
                w-11 h-11
                rounded-full
                bg-[var(--secondary)]
                text-[var(--text-on-secondary)]
                flex items-center justify-center
                font-bold
              "
            >
              {(user.name || user.email)?.[0]?.toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)] truncate">
                {user.name}
              </h2>
              <p className="text-xs text-[var(--text)] truncate flex items-center gap-1">
                <Mail size={12} />
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge
              kind="account"
              value={user.accountStatus}
              className="shrink-0"
            />

            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold capitalize text-[var(--text)]">
              {user.role}
            </span>

            <span className="text-xs text-[var(--text)]">
              Registered:{" "}
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "—"}
            </span>
          </div>

          {/* Summary */}
          <div className="mt-5 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <UserRound size={16} />
              <span className="font-semibold text-sm">Summary</span>
            </div>

            <div className="p-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-[11px] text-[var(--text)]">PARCELS</p>
                <p className="font-semibold">{user.parcelCount}</p>
              </div>

              <div>
                <p className="text-[11px] text-[var(--text)]">DELIVERED</p>
                <p className="font-semibold">{user.deliveredCount}</p>
              </div>

              <div>
                <p className="text-[11px] text-[var(--text)]">SPENT</p>
                <p className="font-semibold">৳{user.totalSpent}</p>
              </div>
            </div>
          </div>

          {/* Parcels */}
          <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <Package size={16} />
              <span className="font-semibold text-sm">Parcels</span>
            </div>

            {parcels.length === 0 ? (
              <p className="p-4 text-sm text-[var(--text)]">
                No parcels found.
              </p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {parcels.map((parcel) => {
                  return (
                    <div
                      key={parcel._id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {parcel.parcelTitle || "Untitled"}
                        </p>
                        <p className="text-xs text-[var(--text)]">
                          {parcel.createdAt
                            ? new Date(parcel.createdAt).toLocaleDateString()
                            : "—"}{" "}
                          — ৳{parcel.totalCost ?? "—"}
                        </p>
                      </div>

                      <StatusBadge
                        kind="delivery"
                        value={parcel.status}
                        className="shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
