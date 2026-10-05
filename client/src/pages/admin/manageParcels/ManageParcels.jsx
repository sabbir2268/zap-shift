import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Package,
  RefreshCw,
  X,
  User,
  MapPin,
  Phone,
  Truck,
  ReceiptText,
  Scale,
  Hash,
  Ban,
  Eye,
  Search,
  Bike,
  Loader2,
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import PageLoader from "../../../components/PageLoader/PageLoader";

const ManageParcels = () => {
  const api = useAxios();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  const loadParcels = useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.get("/api/parcels");

      setParcels(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) return parcels;

    return parcels.filter((parcel) =>
      [
        parcel.parcelTitle,
        parcel.senderName,
        parcel.receiverName,
        parcel.senderRegion,
        parcel.receiverRegion,
        parcel.userEmail,
        parcel.riderID,
        parcel.riderName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [parcels, query]);

  const handleDelete = async (parcel) => {
    setDeletingId(parcel._id);

    try {
      await api.delete(`/api/parcels/${parcel._id}`);
      toast.success("Parcel deleted!");
      setParcels((prev) => prev.filter((p) => p._id !== parcel._id));
      if (selected?._id === parcel._id) setSelected(null);
      setConfirmTarget(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete parcel");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Manage Parcel
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              View and manage every parcel sent across the platform.
            </p>
          </div>

          <button
            type="button"
            onClick={loadParcels}
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
            placeholder="Search by title, sender, receiver or region"
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
            <Package size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No parcels found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No parcels match your search."
                : "Parcels sent by users will appear here."}
            </p>
          </div>
        ) : (
          <ParcelTable
            parcels={filtered}
            deletingId={deletingId}
            onView={(parcel) => setSelected(parcel)}
            onDelete={(parcel) => setConfirmTarget(parcel)}
          />
        )}
      </div>

      {selected && (
        <ParcelModal parcel={selected} onClose={() => setSelected(null)} />
      )}

      {confirmTarget && (
        <ConfirmDeleteModal
          parcel={confirmTarget}
          deleting={deletingId === confirmTarget._id}
          onConfirm={() => handleDelete(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </section>
  );
};

const ParcelTable = ({ parcels, deletingId, onView, onDelete }) => {
  return (
    <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} parcel{parcels.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Account
              </th>
              <th className="px-4 py-3 font-semibold">Pickup</th>
              <th className="px-4 py-3 font-semibold">Delivery</th>
              <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                Rider
              </th>
              <th className="hidden px-4 py-3 font-semibold xl:table-cell">
                Weight
              </th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">
                Delivery &amp; Payment
              </th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const deleting = deletingId === parcel._id;

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]/60 transition-colors"
                >
                  {/* Parcel */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--text-on-secondary)] flex items-center justify-center shrink-0">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate">
                          {parcel.parcelTitle || "Untitled"}
                        </p>

                        <p className="text-[11px] text-[var(--text)] truncate flex items-center gap-1">
                          <Hash size={10} />
                          {parcel._id}
                        </p>

                        <p className="text-[11px] text-[var(--text)] truncate">
                          {parcel.createdAt
                            ? new Date(parcel.createdAt).toLocaleString()
                            : "â€”"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Account owner */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-[var(--text)] truncate block max-w-[180px]">
                      {parcel.userEmail || "â€”"}
                    </span>

                    <span className="text-[11px] text-[var(--text)]/70">
                      {parcel.parcelType === "document"
                        ? "Document"
                        : "Non-document"}
                    </span>
                  </td>

                  {/* Pickup */}
                  <td className="px-4 py-3">
                    <p className="font-semibold truncate max-w-[150px]">
                      {parcel.senderName || "â€”"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[150px]">
                      {parcel.senderRegion || "â€”"}
                    </p>
                  </td>

                  {/* Delivery */}
                  <td className="px-4 py-3">
                    <p className="font-semibold truncate max-w-[150px]">
                      {parcel.receiverName || "â€”"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[150px]">
                      {parcel.receiverRegion || "â€”"}
                    </p>
                  </td>

                  {/* Assigned rider */}
                  <td className="hidden px-4 py-3 xl:table-cell">
                    {parcel.riderID ? (
                      <>
                        <p className="font-semibold truncate max-w-[150px]">
                          {parcel.riderName || "â€”"}
                        </p>
                        <p className="text-[11px] text-[var(--text)] font-mono truncate max-w-[150px]">
                          {parcel.riderID}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--text)]/60">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Weight */}
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Scale size={14} />
                      {parcel.weight ? `${parcel.weight} KG` : "â€”"}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                      <ReceiptText size={14} />à§³{parcel.totalCost ?? "â€”"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge
                        kind="delivery"
                        value={parcel.status}
                        bare
                      />
                      <StatusBadge
                        kind="payment"
                        value={parcel.paymentStatus}
                        bare
                      />
                    </div>
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
                          border border-[var(--border)]
                          flex items-center justify-center
                          text-[var(--foreground)]
                          hover:bg-[var(--surface-muted)]
                          transition
                        "
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(parcel)}
                        disabled={deleting}
                        title="Delete"
                        className="
                          w-9 h-9
                          rounded-lg
                          border border-red-200 dark:border-red-400/40
                          flex items-center justify-center
                          text-red-500 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-400/20
                          transition
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        {deleting ? (
                          <Loader2 size={15} className="animate-spin" />
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
  );
};

const ParcelModal = ({ parcel, onClose }) => {
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
                rounded-xl
                bg-[var(--secondary)]
                text-[var(--text-on-secondary)]
                flex items-center justify-center
              "
            >
              <Package size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {parcel.parcelTitle}
              </h2>
              <p className="text-xs text-[var(--text)]">
                {parcel.createdAt
                  ? new Date(parcel.createdAt).toLocaleString()
                  : "â€”"}
              </p>
            </div>
          </div>

          {/* Parcel info */}
          <div className="mt-5 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <Package size={16} />
              <span className="font-semibold text-sm">Parcel Info</span>
            </div>

            <div className="p-4 space-y-3">
              <DetailRow
                label="Parcel Type"
                value={
                  parcel.parcelType === "document"
                    ? "Document"
                    : "Non-document"
                }
              />

              <DetailRow
                label="Weight"
                value={parcel.weight ? `${parcel.weight} KG` : "â€”"}
              />

              <DetailRow
                label="Delivery Status"
                value={
                  <StatusBadge
                    kind="delivery"
                    value={parcel.status}
                    bare
                  />
                }
              />

              <DetailRow
                label="Payment Status"
                value={
                  <StatusBadge
                    kind="payment"
                    value={parcel.paymentStatus}
                    bare
                  />
                }
              />

              <DetailRow
                label="Delivery Cost"
                value={`à§³ ${parcel.productDeliveryCost ?? "â€”"}`}
              />

              <DetailRow
                label="Service Charge"
                value={`à§³ ${parcel.serviceCharge ?? "â€”"}`}
              />

              <DetailRow
                label="Total Cost"
                value={`à§³ ${parcel.totalCost ?? "â€”"}`}
              />

              <DetailRow
                label="Assigned Rider"
                value={
                  parcel.riderID ? (
                    <span className="flex items-center gap-1">
                      <Bike size={13} />
                      {parcel.riderName || parcel.riderID}
                      <span className="font-mono text-xs text-[var(--text)]">
                        ({parcel.riderID})
                      </span>
                    </span>
                  ) : (
                    "Unassigned"
                  )
                }
              />

              <DetailRow
                label="Rider Contact"
                value={parcel.riderEmail || "â€”"}
              />
            </div>
          </div>

          {/* Sender */}
          <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <User size={16} />
              <span className="font-semibold text-sm">Sender Info</span>
            </div>

            <div className="p-4 space-y-3">
              <DetailRow label="Account" value={parcel.userEmail || "â€”"} />

              <DetailRow
                label="Name"
                value={
                  <span className="flex items-center gap-1">
                    <User size={13} /> {parcel.senderName}
                  </span>
                }
              />

              <DetailRow
                label="Contact"
                value={
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {parcel.senderContact}
                  </span>
                }
              />

              <DetailRow
                label="Region"
                value={
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {parcel.senderRegion}
                  </span>
                }
              />

              <DetailRow
                label="Service Center"
                value={parcel.senderServiceCenter || "â€”"}
              />

              <DetailRow label="Address" value={parcel.senderAddress || "â€”"} />

              <DetailRow
                label="Pickup Instruction"
                value={parcel.pickupInstruction || "â€”"}
              />
            </div>
          </div>

          {/* Receiver */}
          <div className="mt-4 rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--surface-muted)]">
              <Truck size={16} />
              <span className="font-semibold text-sm">Receiver Info</span>
            </div>

            <div className="p-4 space-y-3">
              <DetailRow
                label="Name"
                value={
                  <span className="flex items-center gap-1">
                    <User size={13} /> {parcel.receiverName}
                  </span>
                }
              />

              <DetailRow
                label="Contact"
                value={
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {parcel.receiverContact}
                  </span>
                }
              />

              <DetailRow
                label="Region"
                value={
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {parcel.receiverRegion}
                  </span>
                }
              />

              <DetailRow
                label="Service Center"
                value={parcel.receiverServiceCenter || "â€”"}
              />

              <DetailRow
                label="Address"
                value={parcel.receiverAddress || "â€”"}
              />

              <DetailRow
                label="Delivery Instruction"
                value={parcel.deliveryInstruction || "â€”"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmDeleteModal = ({ parcel, deleting, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
      />

      <div className="relative w-full max-w-md bg-[var(--surface)] rounded-3xl shadow-2xl">
        <div className="h-2 bg-red-500 rounded-t-3xl" />

        <div className="p-6">
          <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-400/15 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
              <Ban size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Delete Parcel?
              </h2>
              <p className="text-xs text-[var(--text)] truncate">
                {parcel.parcelTitle}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--text)] leading-6">
            This will permanently delete the parcel record from the backend and
            MongoDB. This action cannot be undone.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="
                flex-1
                rounded-xl
                border
                border-[var(--border)]
                py-2.5
                text-sm
                font-semibold
                text-[var(--foreground)]
                hover:bg-[var(--surface-muted)]
                transition
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              Keep Parcel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
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
                flex
                items-center
                justify-center
                gap-2
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Ban size={16} />
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-sm text-[var(--text)] shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default ManageParcels;
