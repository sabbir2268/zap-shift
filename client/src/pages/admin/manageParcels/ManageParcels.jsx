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

const ManageParcels = () => {
  const api = useAxios();

  const [parcels, setParcels] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  const loadParcels = useCallback(async () => {
    setLoading(true);

    try {
      const [parcelData, riderData] = await Promise.all([
        api.get("/api/parcels"),
        api.get("/api/rider-applications").catch(() => []),
      ]);

      setParcels(Array.isArray(parcelData) ? parcelData : []);
      setRiders(Array.isArray(riderData) ? riderData : []);
    } catch (error) {
      toast.error(error.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  /* only approved riders can be put on the road */
  const approvedRiders = useMemo(
    () => riders.filter((rider) => rider.status === "approved"),
    [riders]
  );

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

  const handleAssign = async (parcel, riderID) => {
    setAssignTarget(null);

    try {
      const updated = await api.patch(`/api/parcels/${parcel._id}/rider`, {
        riderID,
      });

      setParcels((prev) =>
        prev.map((item) => (item._id === parcel._id ? updated : item))
      );
      setSelected((prev) => (prev?._id === parcel._id ? updated : prev));

      toast.success(
        riderID
          ? `Rider ${riderID} assigned to ${parcel.parcelTitle || "parcel"}!`
          : "Rider unassigned!"
      );
    } catch (error) {
      toast.error(error.message || "Failed to assign rider");
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
          <ParcelTable
            parcels={filtered}
            riderCount={approvedRiders.length}
            deletingId={deletingId}
            onView={(parcel) => setSelected(parcel)}
            onAssign={(parcel) => setAssignTarget(parcel)}
            onDelete={(parcel) => setConfirmTarget(parcel)}
          />
        )}
      </div>

      {selected && (
        <ParcelModal parcel={selected} onClose={() => setSelected(null)} />
      )}

      {assignTarget && (
        <AssignRiderModal
          parcel={assignTarget}
          riders={approvedRiders}
          onAssign={(riderID) => handleAssign(assignTarget, riderID)}
          onClose={() => setAssignTarget(null)}
        />
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

const ParcelTable = ({
  parcels,
  riderCount,
  deletingId,
  onView,
  onAssign,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} parcel{parcels.length === 1 ? "" : "s"}
        </span>

        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]">
          <Bike size={13} />
          {riderCount} approved rider{riderCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
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
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Parcel */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0">
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
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Account owner */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-[var(--text)] truncate block max-w-[180px]">
                      {parcel.userEmail || "—"}
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
                      {parcel.senderName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[150px]">
                      {parcel.senderRegion || "—"}
                    </p>
                  </td>

                  {/* Delivery */}
                  <td className="px-4 py-3">
                    <p className="font-semibold truncate max-w-[150px]">
                      {parcel.receiverName || "—"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] truncate max-w-[150px]">
                      {parcel.receiverRegion || "—"}
                    </p>
                  </td>

                  {/* Assigned rider */}
                  <td className="hidden px-4 py-3 xl:table-cell">
                    {parcel.riderID ? (
                      <>
                        <p className="font-semibold truncate max-w-[150px]">
                          {parcel.riderName || "—"}
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
                      {parcel.weight ? `${parcel.weight} KG` : "—"}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                      <ReceiptText size={14} />৳{parcel.totalCost ?? "—"}
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
                          border border-gray-200
                          flex items-center justify-center
                          text-[var(--foreground)]
                          hover:bg-gray-100
                          transition
                        "
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAssign(parcel)}
                        title={parcel.riderID ? "Change Rider" : "Assign Rider"}
                        className="
                          w-9 h-9
                          rounded-lg
                          border border-blue-200
                          flex items-center justify-center
                          text-blue-600
                          hover:bg-blue-50
                          transition
                        "
                      >
                        <Bike size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(parcel)}
                        disabled={deleting}
                        title="Delete"
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

const AssignRiderModal = ({ parcel, riders, onAssign, onClose }) => {
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
          flex flex-col
          bg-white
          rounded-3xl
          shadow-2xl
        "
      >
        <div className="h-2 bg-blue-500 rounded-t-3xl shrink-0" />

        <div className="p-6 overflow-y-auto">
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
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bike size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Assign Rider
              </h2>
              <p className="text-xs text-[var(--text)] truncate">
                {parcel.parcelTitle || "Untitled"}
              </p>
            </div>
          </div>

          {/* Route reminder */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-[var(--text)]">PICKUP</p>
              <p className="font-semibold truncate">{parcel.senderRegion}</p>
            </div>

            <Truck size={17} className="text-[var(--text)] shrink-0" />

            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] text-[var(--text)]">DELIVERY</p>
              <p className="font-semibold truncate">
                {parcel.receiverRegion}
              </p>
            </div>
          </div>

          {/* Riders */}
          <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100">
              <Bike size={16} />
              <span className="font-semibold text-sm">Approved Riders</span>

              <span className="ml-auto text-xs text-[var(--text)]">
                {riders.length}
              </span>
            </div>

            {riders.length === 0 ? (
              <p className="p-4 text-sm text-[var(--text)]">
                No approved riders available. Approve a rider application first.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {riders.map((rider) => {
                  const isCurrent = rider.riderID === parcel.riderID;

                  return (
                    <button
                      key={rider.riderID}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => onAssign(rider.riderID)}
                      className="
                        w-full
                        px-4 py-3
                        flex
                        items-center
                        gap-3
                        text-left
                        hover:bg-blue-50/60
                        transition
                        disabled:cursor-not-allowed
                        disabled:bg-blue-50
                      "
                    >
                      <div className="w-9 h-9 rounded-full bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center shrink-0 font-bold text-xs">
                        {rider.name?.[0]?.toUpperCase() || "R"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                          {rider.name}
                        </p>

                        <p className="text-[11px] text-[var(--text)] font-mono truncate">
                          {rider.riderID}
                        </p>

                        <p className="text-[11px] text-[var(--text)] truncate">
                          {[
                            rider.region,
                            rider.warehouse,
                            rider.contact,
                          ]
                            .filter(Boolean)
                            .join(" • ") || "—"}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-blue-600 shrink-0">
                        {isCurrent ? "Assigned" : "Assign"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
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
            "
          >
            Cancel
          </button>

          {parcel.riderID && (
            <button
              type="button"
              onClick={() => onAssign(null)}
              className="
                flex-1
                rounded-xl
                border
                border-red-200
                py-2.5
                text-sm
                font-semibold
                text-red-500
                hover:bg-red-50
                transition
              "
            >
              Unassign
            </button>
          )}
        </div>
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
                value={parcel.riderEmail || "—"}
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
