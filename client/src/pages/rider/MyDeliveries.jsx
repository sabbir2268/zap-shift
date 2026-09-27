import React, { useMemo, useState } from "react";
import {
  Package,
  RefreshCw,
  Search,
  X,
  User,
  MapPin,
  Phone,
  Truck,
  Scale,
  Hash,
  Ban,
  Eye,
  Clock,
  Bike,
  Loader2,
} from "lucide-react";
import useRiderDeliveries, { canCancel } from "../../hooks/useRiderDeliveries";
import StatusBadge from "../../components/StatusBadge/StatusBadge";

const MyDeliveries = () => {
  const { parcels, loading, workingId, loadDeliveries, setStatus, nextStep } =
    useRiderDeliveries();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return parcels;

    return parcels.filter((parcel) =>
      [
        parcel.parcelTitle,
        parcel._id,
        parcel.senderName,
        parcel.senderRegion,
        parcel.receiverName,
        parcel.receiverRegion,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [parcels, query]);

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              My Deliveries
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Every parcel an admin has assigned to you, and the steps you can
              take on it.
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
            placeholder="Search by parcel, id, sender, receiver or region"
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
            <Package size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No deliveries found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No deliveries match your search."
                : "Parcels an admin assigns to you will appear here."}
            </p>
          </div>
        ) : (
          <DeliveryTable
            parcels={filtered}
            workingId={workingId}
            nextStep={nextStep}
            onView={(parcel) => setSelected(parcel)}
            onAdvance={(parcel, step) => setStatus(parcel, step.status, step.label)}
            onCancel={(parcel) => setCancelTarget(parcel)}
          />
        )}
      </div>

      {selected && (
        <DeliveryModal parcel={selected} onClose={() => setSelected(null)} />
      )}

      {cancelTarget && (
        <ConfirmCancelModal
          parcel={cancelTarget}
          busy={workingId === cancelTarget._id}
          onConfirm={() =>
            setStatus(cancelTarget, "cancelled", "Delivery cancelled!")
          }
          onClose={() => setCancelTarget(null)}
        />
      )}
    </section>
  );
};

const DeliveryTable = ({
  parcels,
  workingId,
  nextStep,
  onView,
  onAdvance,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} deliver{parcels.length === 1 ? "y" : "ies"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Bike size={13} />
          Assigned to you
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Pickup
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Delivery
              </th>
              <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                Weight
              </th>
              <th className="px-4 py-3 font-semibold">Delivery Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const step = nextStep(parcel);
              const busy = workingId === parcel._id;

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Parcel */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate max-w-[200px]">
                          {parcel.parcelTitle || "Untitled"}
                        </p>

                        <p className="text-[11px] text-[var(--text)] font-mono truncate flex items-center gap-1">
                          <Hash size={10} />
                          {parcel._id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Pickup */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="font-medium truncate max-w-[160px]">
                      {parcel.senderName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[160px]">
                      {parcel.senderRegion || "—"}
                    </p>
                  </td>

                  {/* Delivery */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="font-medium truncate max-w-[160px]">
                      {parcel.receiverName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[160px]">
                      {parcel.receiverRegion || "—"}
                    </p>
                  </td>

                  {/* Weight */}
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Scale size={14} />
                      {parcel.weight ? `${parcel.weight} KG` : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge kind="delivery" value={parcel.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(parcel)}
                        title="View Details"
                        className="
                          w-9 h-9
                          rounded-lg
                          border border-gray-200
                          flex items-center justify-center
                          text-[var(--foreground)]
                          hover:bg-gray-100
                          transition
                        "
                      >
                        <Eye size={15} />
                      </button>

                      {step && (
                        <button
                          type="button"
                          onClick={() => onAdvance(parcel, step)}
                          disabled={busy}
                          title={step.label}
                          className="
                            w-9 h-9
                            rounded-lg
                            border border-blue-200
                            flex items-center justify-center
                            text-blue-600
                            hover:bg-blue-50
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {busy ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Clock size={15} />
                          )}
                        </button>
                      )}

                      {canCancel(parcel.status) && (
                        <button
                          type="button"
                          onClick={() => onCancel(parcel)}
                          disabled={busy}
                          title="Cancel Delivery"
                          className="
                            w-9 h-9
                            rounded-lg
                            border border-red-200
                            flex items-center justify-center
                            text-red-500
                            hover:bg-red-50
                            transition
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <Ban size={15} />
                        </button>
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
  );
};

const DeliveryModal = ({ parcel, onClose }) => (
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
            w-9 h-9
            rounded-full
            bg-gray-100
            flex items-center justify-center
            text-gray-500
            hover:bg-gray-200
            transition
          "
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0">
            <Package size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--foreground)] truncate">
              {parcel.parcelTitle}
            </h2>
            <p className="text-xs text-[var(--text)]">
              {parcel.createdAt
                ? new Date(parcel.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        {/* Parcel info */}
        <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
            <Package size={16} />
            <span className="font-semibold text-sm">Parcel Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow
              label="Parcel Type"
              value={
                parcel.parcelType === "document" ? "Document" : "Non-document"
              }
            />

            <DetailRow
              label="Weight"
              value={parcel.weight ? `${parcel.weight} KG` : "—"}
            />

            <DetailRow
              label="Delivery Status"
              value={<StatusBadge kind="delivery" value={parcel.status} bare />}
            />

            <DetailRow
              label="Payment Status"
              value={<StatusBadge kind="payment" value={parcel.paymentStatus} bare />}
            />
          </div>
        </div>

        {/* Pickup */}
        <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
            <User size={16} />
            <span className="font-semibold text-sm">Pickup Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow label="Name" value={parcel.senderName || "—"} />
            <DetailRow label="Contact" value={parcel.senderContact || "—"} />
            <DetailRow label="Region" value={parcel.senderRegion || "—"} />
            <DetailRow
              label="Service Center"
              value={parcel.senderServiceCenter || "—"}
            />
            <DetailRow label="Address" value={parcel.senderAddress || "—"} />
            <DetailRow
              label="Pickup Instruction"
              value={parcel.pickupInstruction || "—"}
            />
          </div>
        </div>

        {/* Receiver */}
        <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
            <Truck size={16} />
            <span className="font-semibold text-sm">Receiver Info</span>
          </div>

          <div className="p-4 space-y-3">
            <DetailRow label="Name" value={parcel.receiverName || "—"} />
            <DetailRow label="Contact" value={parcel.receiverContact || "—"} />
            <DetailRow label="Region" value={parcel.receiverRegion || "—"} />
            <DetailRow
              label="Service Center"
              value={parcel.receiverServiceCenter || "—"}
            />
            <DetailRow label="Address" value={parcel.receiverAddress || "—"} />
            <DetailRow
              label="Delivery Instruction"
              value={parcel.deliveryInstruction || "—"}
            />
            <DetailRow
              label="Contact on arrival"
              value={
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {parcel.receiverContact || "—"}
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmCancelModal = ({ parcel, busy, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
    />

    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl">
      <div className="h-2 bg-red-500 rounded-t-3xl" />

      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
            <Ban size={21} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Cancel Delivery?
            </h2>
            <p className="text-xs text-[var(--text)] truncate">
              {parcel.parcelTitle}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--text)] leading-6">
          The parcel will be marked as cancelled and an admin will see the
          status change. This cannot be undone from here.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="
              flex-1
              rounded-xl
              border
              border-gray-200
              py-2.5
              text-sm
              font-semibold
              text-[var(--foreground)]
              hover:bg-gray-100
              transition
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Keep Delivering
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="
              flex-1
              rounded-xl
              bg-red-500
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-red-600
              transition
              flex items-center justify-center gap-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
            {busy ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-sm text-[var(--text)] shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default MyDeliveries;
