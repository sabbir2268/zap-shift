import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  PackageCheck,
  CircleSlash,
  RefreshCw,
  MapPin,
  Warehouse,
  ArrowRight,
  Bike,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useRiderDeliveries from "../../hooks/useRiderDeliveries";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

const RiderHome = () => {
  const { profile } = useAuth();
  const { parcels, loading, workingId, counts, loadDeliveries, setStatus, nextStep } =
    useRiderDeliveries();

  const rider = profile?.riderInfo || {};

  const stats = [
    {
      label: "Assigned",
      value: counts.total,
      icon: Package,
      className: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Picked Up",
      value: counts.pickedUp,
      icon: Clock,
      className: "bg-blue-100 text-blue-600",
    },
    {
      label: "In Transit",
      value: counts.inTransit,
      icon: Truck,
      className: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Delivered",
      value: counts.delivered,
      icon: PackageCheck,
      className: "bg-green-100 text-green-600",
    },
  ];

  const upcoming = parcels.filter((parcel) =>
    [
      "rider_assigned",
      "pending",
      "picked_up",
      "in_transit",
      "transferred",
    ].includes(parcel.status)
  );

  return (
    <section className="mx-auto max-w-6xl">
      {/* ================= WELCOME ================= */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
              Rider Dashboard
            </h1>

            {rider.name ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-[var(--foreground)]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[11px] font-bold text-[var(--foreground)]">
                  {rider.name.charAt(0).toUpperCase()}
                </span>
                {rider.name}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-[var(--text)]/70">
            Here is what you are delivering today.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDeliveries}
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

      {/* ================= RIDER SUMMARY ================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <MapPin size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text)]/60">Region</p>
            <p className="truncate text-lg font-bold text-[var(--foreground)]">
              {rider.region || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Warehouse size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text)]/60">
              Service Center
            </p>
            <p className="truncate text-lg font-bold text-[var(--foreground)]">
              {rider.serviceCenter || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* ================= UPCOMING DELIVERIES ================= */}
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Upcoming Deliveries
            </h2>

            <p className="text-xs text-[var(--text)]/70">
              {upcoming.length} parcel{upcoming.length === 1 ? "" : "s"} left in
              your queue
            </p>
          </div>

          <Link
            to="/rider/deliveries"
            className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-gray-100"
          >
            See all
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-10 text-center">
            <PackageCheck size={36} className="mx-auto text-[var(--text)]/40" />
            <p className="mt-3 font-semibold text-[var(--text)]">
              Nothing left to deliver
            </p>
            <p className="mt-1 text-sm text-[var(--text)]/60">
              Parcels an admin assigns to you will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((parcel) => (
              <DeliveryRow
                key={parcel._id}
                parcel={parcel}
                step={nextStep(parcel)}
                busy={workingId === parcel._id}
                onAdvance={(step) => setStatus(parcel, step.status, step.label)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= CANCELLED ================= */}
      {counts.cancelled > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-3xl border border-dashed border-red-200 bg-red-50/40 p-5">
          <CircleSlash size={20} className="text-red-500 shrink-0" />

          <p className="text-sm text-[var(--text)]">
            {counts.cancelled} of your assigned parcels{" "}
            {counts.cancelled === 1 ? "was" : "were"} cancelled.
          </p>
        </div>
      )}

      {/* ================= RIDER LINK ================= */}
      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-gray-200 bg-white p-5">
        <Bike size={20} className="text-[var(--text)] shrink-0" />

        <p className="text-sm text-[var(--text)]">
          Need the full list with pickup and receiver details? Open{" "}
          <Link
            to="/rider/deliveries"
            className="font-semibold text-[var(--foreground)] underline"
          >
            My Deliveries
          </Link>
          .
        </p>
      </div>
    </section>
  );
};

const DeliveryRow = ({ parcel, step, busy, onAdvance }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center">
          <Package size={17} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            {parcel.parcelTitle || "Untitled"}
          </p>

          <p className="text-[11px] text-[var(--text)] truncate">
            {parcel.senderRegion || "—"} → {parcel.receiverRegion || "—"}
          </p>
        </div>
      </div>

      <StatusBadge kind="delivery" value={parcel.status} className="shrink-0" />

      {step && (
        <button
          type="button"
          onClick={() => onAdvance(step)}
          disabled={busy}
          className="
            shrink-0
            rounded-xl
            border border-blue-200
            px-4 py-2
            text-sm font-semibold
            text-blue-600
            hover:bg-blue-50
            transition
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {busy ? "Saving..." : step.label}
        </button>
      )}
    </div>
  );
};

export default RiderHome;
