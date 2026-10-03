import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Package,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Eye,
  X,
  Truck,
  ReceiptText,
  Scale,
  Hash,
  Ban,
  SquarePen,
  Save,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";

import useParcels from "../../../api/parcels";
import useAuth from "../../../hooks/useAuth";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const MyParcels = () => {
  const { getParcels, deleteParcel } = useParcels();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const loadParcels = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getParcels(user?.email);
      setParcels(data);
    } catch (error) {
      toast.error(error.message || "Failed to load parcels");
    } finally {
      setLoading(false);
    }
  }, [getParcels, user?.email]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const handleCancel = async (parcel) => {
    setDeletingId(parcel._id);

    try {
      await deleteParcel(parcel._id);
      toast.success("Parcel cancelled!");
      setParcels((prev) => prev.filter((p) => p._id !== parcel._id));
      if (selected?._id === parcel._id) setSelected(null);
      setConfirmTarget(null);
    } catch (error) {
      toast.error(error.message || "Failed to cancel parcel");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="w-full bg-[var(--background)] py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              My Parcels
            </h1>
            <p className="mt-3 text-[var(--text)] leading-7">
              View all your sent parcels and their current delivery status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadParcels}
            className="
              px-4 sm:px-6
              py-2 sm:py-3
              rounded-full
              bg-[var(--foreground)]
              text-[var(--secondary)]
              font-semibold
              hover:bg-[var(--primary)]
              hover:text-[var(--foreground)]
              transition-all duration-300
              flex items-center gap-2
              shrink-0
            "
            title="Refresh parcels"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
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
          <ParcelTable
            parcels={parcels}
            deletingId={deletingId}
            onView={setSelected}
            onPay={(parcel) =>
              navigate(`/dashboard/payment/${parcel._id}`, {
                state: { parcel },
              })
            }
            onCancel={setConfirmTarget}
          />
        )}
      </div>

      {selected && (
        <ParcelModal
          parcel={selected}
          onClose={() => setSelected(null)}
          onSaved={(updated) => {
            /* the row and the open modal share one record, so both take the
               answer of the server and the details never show a stale value */
            setSelected(updated);
            setParcels((prev) =>
              prev.map((item) => (item._id === updated._id ? updated : item))
            );
          }}
        />
      )}

      {confirmTarget && (
        <ConfirmCancelModal
          parcel={confirmTarget}
          deleting={deletingId === confirmTarget._id}
          onConfirm={() => handleCancel(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
        />
      )}

    </section>
  );
};

/*
 * A row action keeps its icon at every width and only grows a label once there
 * is room for one, so a phone gets four reachable buttons instead of a row of
 * wrapped text. The title carries the meaning either way.
 *
 * Each button fills its cell, so a short label like "Paid" never leaves the
 * widest one in the row ragged.
 */
const ACTION_TONES = {
  plain: "border-gray-200 text-[var(--foreground)] hover:bg-gray-100",
  solid:
    "border-transparent bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--primary)]",
  danger: "border-red-200 text-red-500 hover:bg-red-50",
};

const RowAction = ({ icon, label, tone = "plain", ...rest }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={`
      w-full
      inline-flex items-center justify-center gap-2
      rounded-xl border py-2 px-2 lg:px-3
      text-sm font-semibold
      transition
      disabled:cursor-not-allowed disabled:opacity-60
      ${ACTION_TONES[tone]}
    `}
    {...rest}
  >
    {icon}
    <span className="hidden lg:inline whitespace-nowrap">{label}</span>
  </button>
);

const ParcelTable = ({
  parcels,
  deletingId,
  onView,
  onPay,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
        <span className="text-xs font-semibold text-[var(--text)]">
          {parcels.length} parcel{parcels.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-[var(--text)]/50">
              <th className="px-4 py-3 font-semibold">Parcel</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Load
              </th>
              <th className="px-4 py-3 font-semibold">Cost</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {parcels.map((parcel) => {
              const busy = deletingId === parcel._id;
              const paid = parcel.paymentStatus === "paid";

              return (
                <tr
                  key={parcel._id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {/* Parcel cell: icon, title, id and when it was sent */}
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
                          {formatDate(parcel.createdAt)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Route: the only other thing worth a column */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[120px]">
                          {parcel.senderName || "—"}
                        </p>
                        <p className="text-[11px] text-[var(--text)] truncate max-w-[120px]">
                          {parcel.senderRegion || "—"}
                        </p>
                      </div>

                      <ArrowRight
                        size={14}
                        className="shrink-0 text-[var(--text)]/50"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[120px]">
                          {parcel.receiverName || "—"}
                        </p>
                        <p className="text-[11px] text-[var(--text)] truncate max-w-[120px]">
                          {parcel.receiverRegion || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type and weight, which the detail modal already spells out */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <p className="whitespace-nowrap">
                      {parcel.parcelType === "document"
                        ? "Document"
                        : "Non-document"}
                    </p>
                    <p className="text-[11px] text-[var(--text)] flex items-center gap-1">
                      <Scale size={12} />
                      {parcel.weight ? `${parcel.weight} KG` : "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 whitespace-nowrap font-medium">
                      <ReceiptText size={14} />৳{parcel.totalCost ?? "—"}
                    </span>
                  </td>

                  {/* Both badges are bare, the column header already names them */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge kind="delivery" value={parcel.status} bare />
                      <StatusBadge
                        kind="payment"
                        value={parcel.paymentStatus}
                        bare
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="grid grid-cols-3 items-center gap-2">
                      {/* the details modal carries the edit option, so the row
                          only opens it */}
                      <RowAction
                        icon={<Eye size={16} />}
                        label="View Details"
                        onClick={() => onView(parcel)}
                      />

                      <RowAction
                        icon={<CreditCard size={16} />}
                        label={paid ? "Paid" : "Payment"}
                        tone="solid"
                        disabled={paid}
                        onClick={() => onPay(parcel)}
                      />

                      <RowAction
                        icon={
                          busy ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Ban size={16} />
                          )
                        }
                        label="Cancel Parcel"
                        tone="danger"
                        disabled={busy}
                        onClick={() => onCancel(parcel)}
                      />
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

/* the fields the customer owns and is therefore allowed to change. the statuses
   and the money are decided by the server and an admin, so they stay out of the
   editable form on purpose */
const buildForm = (parcel) => ({
  parcelTitle: parcel.parcelTitle || "",
  parcelType: parcel.parcelType === "non-document" ? "non-document" : "document",
  weight: parcel.weight ?? "",
  senderName: parcel.senderName || "",
  senderContact: parcel.senderContact || "",
  senderRegion: parcel.senderRegion || "",
  senderAddress: parcel.senderAddress || "",
  pickupInstruction: parcel.pickupInstruction || "",
  receiverName: parcel.receiverName || "",
  receiverContact: parcel.receiverContact || "",
  receiverRegion: parcel.receiverRegion || "",
  receiverAddress: parcel.receiverAddress || "",
  deliveryInstruction: parcel.deliveryInstruction || "",
});

const editClass =
  "w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-right outline-none focus:border-[var(--foreground)] transition";

const EditField = ({ label, children, className = "" }) => (
  <div className={`flex items-start justify-between gap-3 ${className}`}>
    <span className="text-sm text-[var(--text)] shrink-0 pt-1.5">{label}</span>
    <div className="min-w-0 flex-1 max-w-[60%]">{children}</div>
  </div>
);

/*
 * The details modal doubles as the edit form, so opening a parcel and changing
 * it are the same screen. Editing only swaps the read only rows for inputs and
 * reveals the save bar, nothing about the layout moves.
 */
const ParcelModal = ({ parcel, onClose, onSaved }) => {
  const { updateParcel } = useParcels();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => buildForm(parcel));

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const startEditing = () => {
    setForm(buildForm(parcel));
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const updated = await updateParcel(parcel._id, {
        ...form,
        weight: form.weight === "" ? "" : Number(form.weight),
      });

      onSaved(updated);
      setEditing(false);
      toast.success("Parcel updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update parcel");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
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

            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-bold text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition"
                  value={form.parcelTitle}
                  onChange={setField("parcelTitle")}
                  placeholder="Parcel title"
                />
              ) : (
                <h2 className="text-xl font-bold text-[var(--foreground)] truncate">
                  {parcel.parcelTitle}
                </h2>
              )}

              <p className="text-xs text-[var(--text)]">
                {new Date(parcel.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Parcel info */}
          <DetailSection icon={<Package size={16} />} title="Parcel Info">
            {editing ? (
              <>
                <EditField label="Parcel Type">
                  <select
                    className={editClass}
                    value={form.parcelType}
                    onChange={setField("parcelType")}
                  >
                    <option value="document">Document</option>
                    <option value="non-document">Non-document</option>
                  </select>
                </EditField>

                <EditField label="Weight">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={editClass}
                    value={form.weight}
                    onChange={setField("weight")}
                    placeholder="KG"
                  />
                </EditField>
              </>
            ) : (
              <>
                <DetailRow label="Parcel Type" value={parcel.parcelType === "document" ? "Document" : "Non-document"} />
                <DetailRow label="Weight" value={parcel.weight ? `${parcel.weight} KG` : "—"} />
              </>
            )}

            {/* the statuses and the money are not the customer's to set */}
            <DetailRow
              label="Delivery Status"
              value={<StatusBadge kind="delivery" value={parcel.status} bare />}
            />
            <DetailRow
              label="Payment Status"
              value={<StatusBadge kind="payment" value={parcel.paymentStatus} bare />}
            />
            <DetailRow label="Delivery Cost" value={`৳ ${parcel.productDeliveryCost}`} />
            <DetailRow label="Service Charge" value={`৳ ${parcel.serviceCharge}`} />
            <DetailRow label="Total Cost" value={`৳ ${parcel.totalCost}`} />
          </DetailSection>

          {/* Sender */}
          <DetailSection icon={<User size={16} />} title="Sender Info">
            {editing ? (
              <>
                <EditField label="Name">
                  <input className={editClass} value={form.senderName} onChange={setField("senderName")} />
                </EditField>

                <EditField label="Contact">
                  <input className={editClass} value={form.senderContact} onChange={setField("senderContact")} />
                </EditField>

                <EditField label="Region">
                  <input className={editClass} value={form.senderRegion} onChange={setField("senderRegion")} />
                </EditField>
              </>
            ) : (
              <>
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
              </>
            )}

            <DetailRow label="Service Center" value={parcel.senderServiceCenter} />

            {editing ? (
              <>
                <EditField label="Address">
                  <textarea rows={2} className={`${editClass} text-left`} value={form.senderAddress} onChange={setField("senderAddress")} />
                </EditField>

                <EditField label="Pickup Instruction">
                  <textarea rows={2} className={`${editClass} text-left`} value={form.pickupInstruction} onChange={setField("pickupInstruction")} />
                </EditField>
              </>
            ) : (
              <>
                <DetailRow label="Address" value={parcel.senderAddress} />
                <DetailRow label="Pickup Instruction" value={parcel.pickupInstruction} />
              </>
            )}
          </DetailSection>

          {/* Receiver */}
          <DetailSection icon={<Truck size={16} />} title="Receiver Info">
            {editing ? (
              <>
                <EditField label="Name">
                  <input className={editClass} value={form.receiverName} onChange={setField("receiverName")} />
                </EditField>

                <EditField label="Contact">
                  <input className={editClass} value={form.receiverContact} onChange={setField("receiverContact")} />
                </EditField>

                <EditField label="Region">
                  <input className={editClass} value={form.receiverRegion} onChange={setField("receiverRegion")} />
                </EditField>
              </>
            ) : (
              <>
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
              </>
            )}

            <DetailRow label="Service Center" value={parcel.receiverServiceCenter} />

            {editing ? (
              <>
                <EditField label="Address">
                  <textarea rows={2} className={`${editClass} text-left`} value={form.receiverAddress} onChange={setField("receiverAddress")} />
                </EditField>

                <EditField label="Delivery Instruction">
                  <textarea rows={2} className={`${editClass} text-left`} value={form.deliveryInstruction} onChange={setField("deliveryInstruction")} />
                </EditField>
              </>
            ) : (
              <>
                <DetailRow label="Address" value={parcel.receiverAddress} />
                <DetailRow label="Delivery Instruction" value={parcel.deliveryInstruction} />
              </>
            )}
          </DetailSection>

          {/* the save bar only exists while editing, the same slot holds the
              edit button the rest of the time */}
          <div className="mt-6 flex items-center gap-3">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="
                    flex-1
                    rounded-xl
                    border border-gray-200
                    py-2.5
                    text-sm font-semibold
                    text-[var(--foreground)]
                    hover:bg-gray-100
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    flex-1
                    rounded-xl
                    bg-[var(--secondary)]
                    py-2.5
                    text-sm font-semibold
                    text-[var(--foreground)]
                    hover:bg-[var(--primary)]
                    transition
                    flex items-center justify-center gap-2
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="
                  w-full
                  rounded-xl
                  bg-[var(--secondary)]
                  py-2.5
                  text-sm font-semibold
                  text-[var(--foreground)]
                  hover:bg-[var(--primary)]
                  transition
                  flex items-center justify-center gap-2
                "
              >
                <SquarePen size={16} />
                Edit Parcel Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmCancelModal = ({ parcel, deleting, onConfirm, onClose }) => {
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
                Cancel Parcel?
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
              {deleting ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
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

export default MyParcels;
