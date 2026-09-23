import React, { useEffect, useState } from "react";
import {
  Package,
  Clock,
  Truck,
  PackageCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import {
  getDeliveryStatus,
  getPaymentStatus,
} from "../../data/parcelStatuses";

const DashboardHome = () => {
  const api = useAxios();
  const { user } = useAuth();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadParcels = () => {
    setLoading(true);
    setError(null);

    api
      .get("/api/parcels", { params: user?.email ? { email: user.email } : {} })
      .then((data) => setParcels(data))
      .catch((err) => setError(err.message || "Failed to load parcels"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParcels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countByStatus = (status) =>
    parcels.filter((parcel) => parcel.status === status).length;

  const stats = [
    {
      label: "Total Parcels",
      value: parcels.length,
      icon: Package,
      className: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Pending",
      value: countByStatus("pending"),
      icon: Clock,
      className: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "In Transit",
      value: countByStatus("in_transit"),
      icon: Truck,
      className: "bg-purple-100 text-purple-600",
    },
    {
      label: "Delivered",
      value: countByStatus("delivered"),
      icon: PackageCheck,
      className: "bg-green-100 text-green-600",
    },
  ];

  const recentParcels = parcels.slice(0, 5);

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <section className="mx-auto max-w-6xl">
      {/* ================= WELCOME ================= */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Welcome back, {displayName}!
        </h1>
        <p className="mt-1 text-[var(--text)]/70">
          Here is an overview of your parcel activity.
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.className}`}
            >
              <stat.icon size={22} />
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text)]/60">
                {stat.label}
              </p>

              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= RECENT PARCELS ================= */}
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Recent Parcels
          </h2>

          <button
            type="button"
            onClick={loadParcels}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-gray-100"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[var(--foreground)]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-sm text-red-600">
            {error}
          </div>
        ) : recentParcels.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-10 text-center">
            <Package size={36} className="mx-auto text-[var(--text)]/40" />
            <p className="mt-3 font-semibold text-[var(--text)]">
              No parcels yet
            </p>
            <p className="mt-1 text-sm text-[var(--text)]/60">
              Send your first parcel from the Send Parcel page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
                  <th className="px-3 py-3 font-semibold">Parcel</th>
                  <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                    From
                  </th>
                  <th className="hidden px-3 py-3 font-semibold sm:table-cell">
                    To
                  </th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">
                    Date
                  </th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentParcels.map((parcel) => {
                  const status = getDeliveryStatus(parcel.status);
                  const paymentStatus = getPaymentStatus(parcel.paymentStatus);

                  return (
                    <tr
                      key={parcel._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-4 font-semibold text-[var(--foreground)]">
                        {parcel.parcelTitle || "Untitled"}
                      </td>

                      <td className="hidden px-3 py-4 sm:table-cell">
                        {parcel.senderRegion}
                      </td>

                      <td className="hidden px-3 py-4 sm:table-cell">
                        {parcel.receiverRegion}
                      </td>

                      <td className="hidden px-3 py-4 md:table-cell">
                        {new Date(parcel.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${paymentStatus.className}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardHome;