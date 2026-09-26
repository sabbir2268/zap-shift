import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  RefreshCw,
  Search,
  Mail,
  Package,
  UserRound,
  X,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import { getDeliveryStatus } from "../../../data/parcelStatuses";

const ManageUsers = () => {
  const api = useAxios();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const loadParcels = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.get("/api/parcels");
      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  /* Users are derived from the parcels they own, grouped by account email. */
  const users = useMemo(() => {
    const map = new Map();

    parcels.forEach((parcel) => {
      const email = parcel.userEmail;
      if (!email) return;

      const existing = map.get(email) || {
        email,
        name: parcel.senderName || email.split("@")[0],
        parcelCount: 0,
        deliveredCount: 0,
        totalSpent: 0,
        lastActivity: null,
      };

      existing.parcelCount += 1;

      if (parcel.status === "delivered") existing.deliveredCount += 1;

      existing.totalSpent += Number(parcel.totalCost) || 0;

      const createdAt = parcel.createdAt ? new Date(parcel.createdAt) : null;

      if (
        createdAt &&
        (!existing.lastActivity || createdAt > existing.lastActivity)
      ) {
        existing.lastActivity = createdAt;
      }

      map.set(email, existing);
    });

    return [...map.values()].sort(
      (a, b) => b.parcelCount - a.parcelCount
    );
  }, [parcels]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) =>
      [user.email, user.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [users, query]);

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
            onClick={loadParcels}
            className="
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
            placeholder="Search by name or email"
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
              {query
                ? "No users match your search."
                : "Users appear here once they send a parcel."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((user) => {
              const initial = (user.name || user.email)?.[0]?.toUpperCase();

              return (
                <div
                  key={user.email}
                  className="bg-white rounded-3xl border border-gray-200 p-5"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="
                        w-11 h-11
                        rounded-full
                        bg-[var(--secondary)]
                        text-[var(--foreground)]
                        flex items-center justify-center shrink-0
                        font-bold
                      "
                    >
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--text)] truncate flex items-center gap-1">
                        <Mail size={12} />
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] text-[var(--text)]">PARCELS</p>
                      <p className="font-semibold text-[var(--foreground)]">
                        {user.parcelCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[var(--text)]">DELIVERED</p>
                      <p className="font-semibold text-[var(--foreground)]">
                        {user.deliveredCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[var(--text)]">SPENT</p>
                      <p className="font-semibold text-[var(--foreground)]">
                        ৳{user.totalSpent}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-[var(--text)]">
                    Last activity:{" "}
                    {user.lastActivity
                      ? user.lastActivity.toLocaleString()
                      : "—"}
                  </p>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelected(user)}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-gray-200
                        py-2
                        text-sm
                        font-semibold
                        text-[var(--foreground)]
                        flex
                        items-center
                        justify-center
                        gap-2
                        hover:bg-gray-100
                        transition
                      "
                    >
                      <UserRound size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <UserModal
          user={selected}
          parcels={parcels.filter(
            (parcel) => parcel.userEmail === selected.email
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
          bg-white
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
              bg-gray-100
              flex
              items-center
              justify-center
              text-gray-500
              hover:bg-gray-200
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
                text-[var(--foreground)]
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

          {/* Summary */}
          <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
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
          <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
              <Package size={16} />
              <span className="font-semibold text-sm">Parcels</span>
            </div>

            {parcels.length === 0 ? (
              <p className="p-4 text-sm text-[var(--text)]">
                No parcels found.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {parcels.map((parcel) => {
                  const status = getDeliveryStatus(parcel.status);

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

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
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
