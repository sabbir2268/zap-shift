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
} from "lucide-react";
import useAxios from "../../../hooks/useAxios";
import {
  getDeliveryStatus,
  getPaymentStatus,
} from "../../../data/parcelStatuses";

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
            placeholder="Search by title, sender, receiver or region"
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
              No parcels found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              {query
                ? "No parcels match your search."
                : "Parcels sent by users will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((parcel) => {
              const status = getDeliveryStatus(parcel.status);
              const paymentStatus = getPaymentStatus(parcel.paymentStatus);

              return (
                <div
                  key={parcel._id}
                  className="bg-white rounded-3xl border border-gray-200 p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="
                          w-11 h-11
                          rounded-xl
                          bg-[var(--secondary)]
                          text-[var(--foreground)]
                          flex items-center justify-center shrink-0
                        "
                      >
                        <Package size={21} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--foreground)] truncate flex items-center gap-1.5">
                          <span className="truncate">
                            {parcel.parcelTitle || "Untitled"}
                          </span>
                          <span className="text-[10px] font-normal text-[var(--text)] bg-gray-100 rounded px-1.5 py-0.5 shrink-0 flex items-center gap-0.5">
                            <Hash size={10} />
                            {parcel._id}
                          </span>
                        </p>

                        <p className="text-xs text-[var(--text)] truncate">
                          {parcel.createdAt
                            ? new Date(parcel.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`
                          text-xs
                          font-medium
                          px-3
                          py-1.5
                          rounded-full
                          ${status.className}
                        `}
                      >
                        {status.label}
                      </span>

                      <span
                        className={`
                          text-xs
                          font-medium
                          px-3
                          py-1.5
                          rounded-full
                          ${paymentStatus.className}
                        `}
                      >
                        {paymentStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Account owner */}
                  {parcel.userEmail && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text)]">
                      <User size={13} />
                      <span className="truncate">{parcel.userEmail}</span>
                    </div>
                  )}

                  {/* Route */}
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="text-left min-w-0">
                      <p className="text-[11px] text-[var(--text)]">PICKUP</p>
                      <p className="font-semibold text-sm truncate">
                        {parcel.senderName}
                      </p>
                      <p className="text-xs text-[var(--text)] truncate">
                        {parcel.senderRegion}
                      </p>
                    </div>

                    <div
                      className="
                        w-9 h-9
                        rounded-full
                        bg-[var(--secondary)]
                        flex
                        items-center
                        justify-center
                        text-[var(--foreground)]
                      "
                    >
                      <Truck size={17} />
                    </div>

                    <div className="text-right min-w-0">
                      <p className="text-[11px] text-[var(--text)]">DELIVERY</p>
                      <p className="font-semibold text-sm truncate">
                        {parcel.receiverName}
                      </p>
                      <p className="text-xs text-[var(--text)] truncate">
                        {parcel.receiverRegion}
                      </p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-[var(--text)]">
                    <span className="flex items-center gap-1">
                      <Scale size={14} />
                      {parcel.weight ? `${parcel.weight} KG` : "—"}
                    </span>

                    <span className="flex items-center gap-1">
                      <ReceiptText size={14} />
                      ৳{parcel.totalCost}
                    </span>

                    <span className="capitalize">
                      {parcel.parcelType === "document"
                        ? "Document"
                        : "Non-document"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(parcel)}
                      className="
                        flex-1
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
                      <Eye size={16} />
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmTarget(parcel)}
                      disabled={deletingId === parcel._id}
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-red-200
                        py-2
                        text-sm
                        font-semibold
                        text-red-500
                        flex
                        items-center
                        justify-center
                        gap-2
                        hover:bg-red-50
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <Ban size={16} />
                      {deletingId === parcel._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                rounded-xl
                bg-[var(--secondary)]
                text-[var(--foreground)]
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
                  parcel.parcelType === "document"
                    ? "Document"
                    : "Non-document"
                }
              />

              <DetailRow
                label="Weight"
                value={parcel.weight ? `${parcel.weight} KG` : "—"}
              />

              <DetailRow
                label="Delivery Status"
                value={
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getDeliveryStatus(parcel.status).className}`}
                  >
                    {getDeliveryStatus(parcel.status).label}
                  </span>
                }
              />

              <DetailRow
                label="Payment Status"
                value={
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatus(parcel.paymentStatus).className}`}
                  >
                    {getPaymentStatus(parcel.paymentStatus).label}
                  </span>
                }
              />

              <DetailRow
                label="Delivery Cost"
                value={`৳ ${parcel.productDeliveryCost ?? "—"}`}
              />

              <DetailRow
                label="Service Charge"
                value={`৳ ${parcel.serviceCharge ?? "—"}`}
              />

              <DetailRow
                label="Total Cost"
                value={`৳ ${parcel.totalCost ?? "—"}`}
              />
            </div>
          </div>

          {/* Sender */}
          <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
              <User size={16} />
              <span className="font-semibold text-sm">Sender Info</span>
            </div>

            <div className="p-4 space-y-3">
              <DetailRow label="Account" value={parcel.userEmail || "—"} />

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
                value={parcel.receiverServiceCenter || "—"}
              />

              <DetailRow
                label="Address"
                value={parcel.receiverAddress || "—"}
              />

              <DetailRow
                label="Delivery Instruction"
                value={parcel.deliveryInstruction || "—"}
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

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl">
        <div className="h-2 bg-red-500 rounded-t-3xl" />

        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
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
