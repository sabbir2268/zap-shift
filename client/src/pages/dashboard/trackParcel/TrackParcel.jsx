import React, { useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Phone,
  CalendarDays,
  ReceiptText,
  Loader2,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import useAuth from "../../../hooks/useAuth";
import {
  getDeliveryStatus,
  getPaymentStatus,
} from "../../../data/parcelStatuses";

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

  const status = parcel ? getDeliveryStatus(parcel.status) : null;
  const paymentStatus = parcel ? getPaymentStatus(parcel.paymentStatus) : null;

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

        {searched && !loading && parcel && status && (
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
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${paymentStatus.className}`}
                >
                  {paymentStatus.label}
                </span>
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
          </div>
        )}
      </div>
    </section>
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