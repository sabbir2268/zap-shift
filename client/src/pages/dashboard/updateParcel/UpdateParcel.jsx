import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Save, SquarePen } from "lucide-react";
import useTrackingUpdate from "../../../hooks/useTrackingUpdate";
import { DELIVERY_STATUS, PAYMENT_STATUS } from "../../../data/parcelStatuses";

const STATUS_OPTIONS = Object.entries(DELIVERY_STATUS).map(([value, item]) => ({
  value,
  label: item.label,
}));

const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS).map(
  ([value, item]) => ({ value, label: item.label })
);

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)] transition";

const Field = ({ label, full, children }) => (
  <label className={`block ${full ? "sm:col-span-2" : ""}`}>
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text)]">
      {label}
    </span>
    {children}
  </label>
);

const UpdateParcel = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { updateTracking } = useTrackingUpdate();

  const parcel = location.state?.parcel;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    parcelTitle: parcel?.parcelTitle || "",
    parcelType: parcel?.parcelType || "document",
    weight: parcel?.weight ?? "",
    status: parcel?.status || "pending",
    paymentStatus: parcel?.paymentStatus || "unpaid",
    senderName: parcel?.senderName || "",
    senderContact: parcel?.senderContact || "",
    senderRegion: parcel?.senderRegion || "",
    senderAddress: parcel?.senderAddress || "",
    receiverName: parcel?.receiverName || "",
    receiverContact: parcel?.receiverContact || "",
    receiverRegion: parcel?.receiverRegion || "",
    receiverAddress: parcel?.receiverAddress || "",
    pickupInstruction: parcel?.pickupInstruction || "",
    deliveryInstruction: parcel?.deliveryInstruction || "",
  }));

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await updateTracking(id, {
        ...form,
        weight: form.weight === "" ? "" : Number(form.weight),
      });
      toast.success("Parcel updated!");
      navigate("/dashboard/parcels");
    } catch (error) {
      toast.error(error.message || "Failed to update parcel");
    } finally {
      setSaving(false);
    }
  };

  if (!parcel) {
    return (
      <section className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Parcel not found
        </h1>
        <p className="mt-2 text-sm text-[var(--text)]">
          Open this page from the My Parcels list.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/parcels")}
          className="mt-6 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-[var(--secondary)] transition hover:bg-[var(--primary)] hover:text-[var(--foreground)]"
        >
          Back to My Parcels
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard/parcels")}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-[var(--text)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={16} />
        Back to My Parcels
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--foreground)]">
          <SquarePen size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] md:text-3xl">
            Update Parcel
          </h1>
          <p className="text-sm text-[var(--text)]">
            Edit the parcel details and save your changes.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-gray-200 bg-white p-5 md:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Parcel Title" full>
            <input
              className={inputClass}
              value={form.parcelTitle}
              onChange={setField("parcelTitle")}
              placeholder="Enter parcel title"
              required
            />
          </Field>

          <Field label="Parcel Type">
            <select
              className={inputClass}
              value={form.parcelType}
              onChange={setField("parcelType")}
            >
              <option value="document">Document</option>
              <option value="non-document">Non-document</option>
            </select>
          </Field>

          <Field label="Weight (KG)">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.weight}
              onChange={setField("weight")}
              placeholder="Weight in KG"
            />
          </Field>

          <Field label="Delivery Status" full>
            <select
              className={inputClass}
              value={form.status}
              onChange={setField("status")}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Payment Status" full>
            <select
              className={inputClass}
              value={form.paymentStatus}
              onChange={setField("paymentStatus")}
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sender Name">
            <input
              className={inputClass}
              value={form.senderName}
              onChange={setField("senderName")}
              required
            />
          </Field>

          <Field label="Sender Contact">
            <input
              className={inputClass}
              value={form.senderContact}
              onChange={setField("senderContact")}
              required
            />
          </Field>

          <Field label="Sender Region">
            <input
              className={inputClass}
              value={form.senderRegion}
              onChange={setField("senderRegion")}
              required
            />
          </Field>

          <Field label="Receiver Region">
            <input
              className={inputClass}
              value={form.receiverRegion}
              onChange={setField("receiverRegion")}
              required
            />
          </Field>

          <Field label="Sender Address" full>
            <textarea
              rows={2}
              className={inputClass}
              value={form.senderAddress}
              onChange={setField("senderAddress")}
              required
            />
          </Field>

          <Field label="Receiver Name">
            <input
              className={inputClass}
              value={form.receiverName}
              onChange={setField("receiverName")}
              required
            />
          </Field>

          <Field label="Receiver Contact">
            <input
              className={inputClass}
              value={form.receiverContact}
              onChange={setField("receiverContact")}
              required
            />
          </Field>

          <Field label="Receiver Address" full>
            <textarea
              rows={2}
              className={inputClass}
              value={form.receiverAddress}
              onChange={setField("receiverAddress")}
              required
            />
          </Field>

          <Field label="Pickup Instruction" full>
            <textarea
              rows={2}
              className={inputClass}
              value={form.pickupInstruction}
              onChange={setField("pickupInstruction")}
            />
          </Field>

          <Field label="Delivery Instruction" full>
            <textarea
              rows={2}
              className={inputClass}
              value={form.deliveryInstruction}
              onChange={setField("deliveryInstruction")}
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/parcels")}
            disabled={saving}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--secondary)] py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>
      </form>
    </section>
  );
};

export default UpdateParcel;
