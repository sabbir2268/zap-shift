import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Package,
  RefreshCw,
  Trash2,
  User,
  MapPin,
  Phone,
  Eye,
  X,
  Truck,
  ReceiptText,
  Scale,
} from "lucide-react";

import { deleteParcel, getParcels, updateParcel } from "../../api/parcels";

const STATUS = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  picked_up: { label: "Picked Up", className: "bg-blue-100 text-blue-800" },
  in_transit: { label: "In Transit", className: "bg-purple-100 text-purple-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};

const AdminParcels = () => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadParcels = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getParcels();
      setParcels(data);
    } catch (error) {
      toast.error(error.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const handleStatusChange = async (parcel, newStatus) => {
    setUpdatingId(parcel._id);

    try {
      await updateParcel(parcel._id, { ...parcel, status: newStatus });
      toast.success("Parcel status updated!");
      loadParcels();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (parcel) => {
    setDeletingId(parcel._id);

    try {
      await deleteParcel(parcel._id);
      toast.success("Parcel deleted!");
      if (selected?._id === parcel._id) setSelected(null);
      loadParcels();
    } catch (error) {
      toast.error(error.message || "Failed to delete parcel");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  return (
    <section className="w-full bg-[var(--background)] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Parcel Backend
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              Manage all registered parcels. Update status or remove entries.
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

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center">
            <Package size={48} className="mx-auto text-[var(--text)]" />
            <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
              No parcels found
            </h2>
            <p className="mt-2 text-sm text-[var(--text)]">
              Parcels confirmed from the Send Parcel page will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parcels.map((parcel) => {
              const status = STATUS[parcel.status] || STATUS.pending;

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
                        <p className="font-semibold text-[var(--foreground)] truncate">
                          {parcel.parcelTitle}
                        </p>
                        <p className="text-xs text-[var(--text)]">
                          {formatDate(parcel.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                        shrink-0
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
                  </div>

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
                    <select
                      value={parcel.status || "pending"}
                      disabled={updatingId === parcel._id}
                      onChange={(e) =>
                        handleStatusChange(parcel, e.target.value)
                      }
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        px-3
                        py-2
                        text-sm
                        outline-none
                        focus:border-[var(--foreground)]
                        disabled:opacity-60
                      "
                    >
                      {Object.entries(STATUS).map(([value, status]) => (
                        <option key={value} value={value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setSelected(parcel)}
                      className="
                        w-9 h-9
                        rounded-xl
                        border
                        border-gray-200
                        flex
                        items-center
                        justify-center
                        text-[var(--text)]
                        hover:bg-gray-100
                        transition
                      "
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(parcel)}
                      disabled={deletingId === parcel._id}
                      className="
                        w-9 h-9
                        rounded-xl
                        border
                        border-red-200
                        flex
                        items-center
                        justify-center
                        text-red-500
                        hover:bg-red-50
                        transition
                        disabled:opacity-60
                      "
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && <ParcelModal parcel={selected} onClose={() => setSelected(null)} />}
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
                {new Date(parcel.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Parcel info */}
          <DetailSection icon={<Package size={16} />} title="Parcel Info">
            <DetailRow label="Parcel Type" value={parcel.parcelType === "document" ? "Document" : "Non-document"} />
            <DetailRow label="Weight" value={parcel.weight ? `${parcel.weight} KG` : "—"} />
            <DetailRow label="Delivery Cost" value={`৳ ${parcel.productDeliveryCost}`} />
            <DetailRow label="Service Charge" value={`৳ ${parcel.serviceCharge}`} />
            <DetailRow label="Total Cost" value={`৳ ${parcel.totalCost}`} />
          </DetailSection>

          {/* Sender */}
          <DetailSection icon={<User size={16} />} title="Sender Info">
            <DetailRow
              label="Name"
              value={<span className="flex items-center gap-1"><User size={13} /> {parcel.senderName}</span>}
            />
            <DetailRow
              label="Contact"
              value={<span className="flex items-center gap-1"><Phone size={13} /> {parcel.senderContact}</span>}
            />
            <DetailRow
              label="Region"
              value={<span className="flex items-center gap-1"><MapPin size={13} /> {parcel.senderRegion}</span>}
            />
            <DetailRow label="Service Center" value={parcel.senderServiceCenter} />
            <DetailRow label="Address" value={parcel.senderAddress} />
            <DetailRow label="Pickup Instruction" value={parcel.pickupInstruction} />
          </DetailSection>

          {/* Receiver */}
          <DetailSection icon={<Truck size={16} />} title="Receiver Info">
            <DetailRow
              label="Name"
              value={<span className="flex items-center gap-1"><User size={13} /> {parcel.receiverName}</span>}
            />
            <DetailRow
              label="Contact"
              value={<span className="flex items-center gap-1"><Phone size={13} /> {parcel.receiverContact}</span>}
            />
            <DetailRow
              label="Region"
              value={<span className="flex items-center gap-1"><MapPin size={13} /> {parcel.receiverRegion}</span>}
            />
            <DetailRow label="Service Center" value={parcel.receiverServiceCenter} />
            <DetailRow label="Address" value={parcel.receiverAddress} />
            <DetailRow label="Delivery Instruction" value={parcel.deliveryInstruction} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

const DetailSection = ({ icon, title, children }) => (
  <div className="mt-5 rounded-2xl border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
      {icon}
      <span className="font-semibold text-sm">{title}</span>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-sm text-[var(--text)] shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
);

export default AdminParcels;