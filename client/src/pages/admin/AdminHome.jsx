import React, { useCallback, useEffect, useState } from "react";
import {
  Package,
  Users,
  CreditCard,
  ClipboardList,
  Clock,
  Truck,
  PackageCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAxios from "../../hooks/useAxios";
import { getDeliveryStatus } from "../../data/parcelStatuses";

const AdminHome = () => {
  const api = useAxios();

  const [parcels, setParcels] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [parcelData, applicationData, paymentData] = await Promise.all([
        api.get("/api/parcels"),
        api.get("/api/rider-applications"),
        api.get("/api/payments"),
      ]);

      setParcels(Array.isArray(parcelData) ? parcelData : []);
      setApplications(Array.isArray(applicationData) ? applicationData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const countByStatus = (status) =>
    parcels.filter((parcel) => parcel.status === status).length;

  const pendingApplications = applications.filter(
    (application) => (application.status || "pending") === "pending"
  ).length;

  const revenue = payments.reduce(
    (total, payment) => total + (Number(payment.amount) || 0),
    0
  );

  const stats = [
    {
      label: "Total Parcels",
      value: parcels.length,
      icon: Package,
      className: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Total Users",
      value: new Set(parcels.map((parcel) => parcel.userEmail)).size,
      icon: Users,
      className: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending Riders",
      value: pendingApplications,
      icon: ClipboardList,
      className: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Revenue",
      value: `৳${revenue}`,
      icon: CreditCard,
      className: "bg-green-100 text-green-600",
    },
  ];

  const deliveryStats = [
    { label: "Pending", value: countByStatus("pending"), icon: Clock },
    { label: "In Transit", value: countByStatus("in_transit"), icon: Truck },
    { label: "Delivered", value: countByStatus("delivered"), icon: PackageCheck },
  ];

  const recentParcels = parcels.slice(0, 5);

  return (
    <section className="mx-auto max-w-6xl">
      {/* ================= WELCOME ================= */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Welcome to Admin Panel
        </h1>
        <p className="mt-1 text-[var(--text)]/70">
          Here is an overview of the whole ZapShift operation.
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

      {/* ================= DELIVERY BREAKDOWN ================= */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {deliveryStats.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <span className="font-semibold text-[var(--text)]">
              {item.label}
            </span>

            <span className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
              <item.icon size={18} />
              {item.value}
            </span>
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
            onClick={loadData}
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
        ) : recentParcels.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-10 text-center">
            <Package size={36} className="mx-auto text-[var(--text)]/40" />
            <p className="mt-3 font-semibold text-[var(--text)]">
              No parcels yet
            </p>
            <p className="mt-1 text-sm text-[var(--text)]/60">
              Parcels sent by users will appear here.
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
                </tr>
              </thead>
              <tbody>
                {recentParcels.map((parcel) => {
                  const status = getDeliveryStatus(parcel.status);

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
                        {parcel.createdAt
                          ? new Date(parcel.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Link
            to="/admin/manage-parcels"
            className="rounded-full bg-[var(--foreground)] px-5 py-2 text-sm font-semibold text-[var(--secondary)] transition hover:bg-[var(--primary)] hover:text-[var(--foreground)]"
          >
            Manage Parcels
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AdminHome;
