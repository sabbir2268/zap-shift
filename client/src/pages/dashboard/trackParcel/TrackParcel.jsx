import React, { useState } from "react";
import {
  Search,
  Package,
  PackageCheck,
  CheckCheck,
  MapPin,
  Phone,
  CalendarDays,
  ReceiptText,
  Loader2,
  CalendarClock,
  Clock,
  Hourglass,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import useAuth from "../../../hooks/useAuth";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import {
  getPickedUpAt,
  getDeliveredAt,
  formatDateTime,
} from "../../../data/deliveryTimes";

/*
 * A promised window per status rather than a real arrival date, which the
 * backend has no schedule to calculate. Anything unrecognised falls back to the
 * waiting window so the card is never left without an answer.
 */
const ETA = {
  pending: {
    window: "2 to 4 business days",
    note: "Counted from the day a rider is assigned to this parcel",
  },
  picked_up: {
    window: "Within 24 hours",
    note: "Counted from the pickup scan",
  },
  in_transit: {
    window: "Today, before 8:00 PM",
    note: "On the way to the receiver",
  },
  delivered: {
    window: "Delivered",
    note: "This parcel has already reached the receiver",
  },
  cancelled: {
    window: "Cancelled",
    note: "This parcel is no longer being delivered",
  },
};

const getEta = (status) => ETA[status] || ETA.pending;

const TrackParcel = () => {
  const api = useAxios();
  const { user } = useAuth();

  const [parcelId, setParcelId] = useState("");
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();

    const id = parcelId.trim();
    if (!id) return;

    setLoading(true);
    setError(null);
    setParcel(null);
    setSearched(true);

    api
      .get(`/api/parcels/${id}`, {
        params: user?.email ? { email: user.email } : {},
      })
      .then((data) => setParcel(data))
      .catch((err) => setError(err.message || "Parcel not found"))
      .finally(() => setLoading(false));
  };

  return (
    <section className="mx-auto max-w-2xl">
      {/* ================= HEADING ================= */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          Track Your Parcel
        </h1>

        <p className="mt-1 text-[var(--text)]/70">
          Enter your parcel ID to see the latest delivery status.
        </p>
      </div>

      {/* ================= SEARCH ================= */}
      <form
        onSubmit={handleTrack}
        className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]/40"
          />

          <input
            type="text"
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            placeholder="Enter parcel ID (e.g. 665f3c9d...) "
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--secondary)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !parcelId.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-6 py-3 font-semibold text-[var(--secondary)] transition hover:bg-[var(--primary)] hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {/* ================= RESULT ================= */}
      <div className="mt-6">
        {searched && loading && (
          <div className="flex justify-center rounded-3xl border border-gray-200 bg-white py-16">
            <Loader2 size={28} className="animate-spin text-[var(--foreground)]" />
          </div>
        )}

        {searched && !loading && error && (
          <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-white py-14 text-center">
            <Package size={40} className="text-[var(--text)]/30" />
            <p className="mt-4 font-semibold text-[var(--text)]">
              Parcel not found
            </p>
            <p className="mt-1 text-sm text-[var(--text)]/60">{error}</p>
          </div>
        )}

        {searched && !loading && parcel && (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {/* Status header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--foreground)]">
                  <Package size={22} />
                </div>

                <div>
                  <p className="text-xs text-[var(--text)]/60">Parcel</p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {parcel.parcelTitle || "Untitled"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge kind="delivery" value={parcel.status} />
                <StatusBadge kind="payment" value={parcel.paymentStatus} />
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 px-6 py-5 sm:grid-cols-2">
              <DetailRow
                icon={<MapPin size={17} />}
                label="Pickup"
                value={`${parcel.senderRegion}${
                  parcel.senderServiceCenter
                    ? ` - ${parcel.senderServiceCenter}`
                    : ""
                }`}
              />

              <DetailRow
                icon={<MapPin size={17} />}
                label="Delivery"
                value={`${parcel.receiverRegion}${
                  parcel.receiverServiceCenter
                    ? ` - ${parcel.receiverServiceCenter}`
                    : ""
                }`}
              />

              <DetailRow
                icon={<Phone size={17} />}
                label="Sender Contact"
                value={parcel.senderContact}
              />

              <DetailRow
                icon={<Phone size={17} />}
                label="Receiver Contact"
                value={parcel.receiverContact}
              />

              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Created"
                value={new Date(parcel.createdAt).toLocaleString()}
              />

              <DetailRow
                icon={<ReceiptText size={17} />}
                label="Total Cost"
                value={`৳ ${parcel.totalCost}`}
              />
            </div>

            {/* the times the parcel actually moved, as the rider marked them */}
            <DeliveryTimes parcel={parcel} />

            {/* Delivery agent, and the status that agent has reached */}
            <DeliveryAgent parcel={parcel} />

            {/* Estimated delivery, a static window for the current status */}
            <EstimatedDelivery parcel={parcel} />
          </div>
        )}
      </div>
    </section>
  );
};

const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text)]/50">
    {children}
  </p>
);

/* the rider name and id the admin wrote onto the parcel, or the honest answer
   that nobody has taken it yet */
const DeliveryAgent = ({ parcel }) => (
  <div className="border-t border-gray-100 px-6 py-5">
    <SectionTitle>Delivery Agent</SectionTitle>

    {parcel.riderID ? (
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] font-bold text-[var(--foreground)]">
          {(parcel.riderName || parcel.riderID)[0].toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--foreground)]">
            {parcel.riderName || parcel.riderID}
          </p>
          <p className="text-xs text-[var(--text)]/60">
            {parcel.riderID}
            {parcel.assignedAt
              ? ` · assigned ${new Date(parcel.assignedAt).toLocaleDateString()}`
              : ""}
          </p>
        </div>

        {/* the section names the kind, so the badge stays bare */}
        <StatusBadge
          kind="delivery"
          value={parcel.status}
          bare
          className="shrink-0"
        />
      </div>
    ) : (
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3">
        <Hourglass size={18} className="shrink-0 text-[var(--text)]/50" />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            No rider assigned yet
          </p>
          <p className="text-xs text-[var(--text)]/60">
            An admin assigns an approved rider once this parcel is ready to
            move.
          </p>
        </div>
      </div>
    )}
  </div>
);

/* when the parcel was picked up and when it reached the receiver. both are
   stamped by the server the moment the rider marks that step, so they are the
   real times. a parcel that has not got there yet says so rather than guessing */
const DeliveryTimes = ({ parcel }) => {
  const pickedUpAt = getPickedUpAt(parcel);
  const deliveredAt = getDeliveredAt(parcel);

  return (
    <div className="border-t border-gray-100 px-6 py-5">
      <SectionTitle>Delivery Times</SectionTitle>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailRow
          icon={<PackageCheck size={17} />}
          label="Picked Up"
          value={
            pickedUpAt ? formatDateTime(pickedUpAt) : "Not picked up yet"
          }
        />

        <DetailRow
          icon={<CheckCheck size={17} />}
          label="Delivered"
          value={deliveredAt ? formatDateTime(deliveredAt) : "Not delivered yet"}
        />
      </div>
    </div>
  );
};

const EstimatedDelivery = ({ parcel }) => {
  const eta = getEta(parcel.status);
  const paused = !parcel.riderID && parcel.status !== "cancelled";

  return (
    <div className="border-t border-gray-100 px-6 py-5">
      <SectionTitle>Estimated Delivery</SectionTitle>

      <div className="mt-3 flex items-start gap-3">
        <CalendarClock
          size={17}
          className="mt-0.5 shrink-0 text-[var(--text)]/50"
        />

        <div className="min-w-0">
          <p className="font-semibold text-[var(--foreground)]">
            {eta.window}
          </p>
          <p className="text-xs text-[var(--text)]/60">{eta.note}</p>

          {/* the window only starts counting once a rider holds the parcel */}
          {paused && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
              <Clock size={13} />
              Paused until a rider is assigned
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-[var(--text)]/50">{icon}</div>

    <div className="min-w-0">
      <p className="text-xs text-[var(--text)]/60">{label}</p>
      <p className="font-medium text-[var(--foreground)] break-words">
        {value}
      </p>
    </div>
  </div>
);

export default TrackParcel;