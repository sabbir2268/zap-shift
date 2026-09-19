import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Package,
  User,
  MapPin,
  Phone,
  Scale,
  FileText,
  ChevronDown,
  X,
  CheckCircle2,
  Truck,
  ReceiptText,
  Loader2,
} from "lucide-react";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";


const SendParcel = () => {
  const api = useAxios();
  const { user } = useAuth();

  const [parcelType, setParcelType] = useState("document");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      parcelType: "document",
    },
  });

  const senderRegion = watch("senderRegion");
  const receiverRegion = watch("receiverRegion");
  const weight = watch("weight");

  // Example service centers
  const serviceCenters = {
    Dhaka: ["Dhaka Central", "Mirpur", "Uttara", "Dhanmondi", "Savar"],
    Chattogram: ["Chattogram Central", "Agrabad", "Pahartali"],
    Rajshahi: ["Rajshahi Central", "Boalia", "Motihar"],
    Khulna: ["Khulna Central", "Sonadanga", "Khalishpur"],
    Barishal: ["Barishal Central", "Kotwali"],
    Sylhet: ["Sylhet Central", "Zindabazar"],
    Rangpur: ["Rangpur Central", "Mahiganj"],
    Mymensingh: ["Mymensingh Central", "Sadar"],
  };

  const regions = Object.keys(serviceCenters);

  // DELIVERY COST CALCULATION
  const calculateDeliveryCost = () => {
    let productDeliveryCost = 60;

    // Non-document parcel
    if (parcelType === "non-document") {
      const parcelWeight = Number(weight) || 1;

      if (parcelWeight <= 1) {
        productDeliveryCost = 80;
      } else {
        productDeliveryCost = 80 + (parcelWeight - 1) * 20;
      }
    }

    // Extra charge for different regions
    if (senderRegion && receiverRegion && senderRegion !== receiverRegion) {
      productDeliveryCost += 40;
    }

    // Service charge = 10%
    const serviceCharge = Math.round(productDeliveryCost * 0.1);

    const totalCost = productDeliveryCost + serviceCharge;

    return {
      productDeliveryCost,
      serviceCharge,
      totalCost,
    };
  };

  const onSubmit = (data) => {
    const cost = calculateDeliveryCost();

    const parcelData = {
      ...data,
      parcelType,
      userEmail: user?.email,
      ...cost,
    };

    console.log("Parcel Data:", parcelData);

    setSubmittedData(parcelData);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);

    try {
      await api.post("/api/parcels", submittedData);
      toast.success("Parcel saved successfully!");
      setShowConfirmation(false);
    } catch (error) {
      toast.error(error.message || "Failed to save parcel");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="w-full bg-[var(--background)] py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* ========== HEADER ============ */}

          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Send Your Parcel
            </h1>

            <p className="mt-3 text-[var(--text)] leading-7">
              Fill in the parcel details and provide pickup and delivery
              information to send your parcel safely.
            </p>
          </div>

          {/* =========== FORM ========== */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* PARCEL INFO */}

            <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
              <SectionHeader
                icon={<Package size={21} />}
                title="Parcel Info"
                subtitle="Provide basic information about your parcel."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Parcel Type */}

                <div>
                  <label className="input-label">
                    Parcel Type <Required />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setParcelType("document")}
                      className={`
                        py-3 px-4 rounded-xl border
                        font-medium transition
                        ${
                          parcelType === "document"
                            ? "bg-[var(--foreground)] text-[var(--secondary)] border-[var(--foreground)]"
                            : "border-gray-200 hover:bg-gray-100"
                        }
                      `}
                    >
                      Document
                    </button>

                    <button
                      type="button"
                      onClick={() => setParcelType("non-document")}
                      className={`
                        py-3 px-4 rounded-xl border
                        font-medium transition
                        ${
                          parcelType === "non-document"
                            ? "bg-[var(--foreground)] text-[var(--secondary)] border-[var(--foreground)]"
                            : "border-gray-200 hover:bg-gray-100"
                        }
                      `}
                    >
                      Non-document
                    </button>
                  </div>

                  {/* Hidden RHF field */}

                  <input
                    type="hidden"
                    value={parcelType}
                    {...register("parcelType")}
                  />
                </div>

                {/* Parcel Title */}

                <InputField
                  label="Parcel Title"
                  name="parcelTitle"
                  placeholder="Enter parcel title"
                  icon={<FileText size={18} />}
                  register={register}
                  required
                  error={errors.parcelTitle}
                />

                {/* Weight */}

                <InputField
                  label="Weight"
                  name="weight"
                  type="number"
                  placeholder="Weight in KG"
                  icon={<Scale size={18} />}
                  register={register}
                  required={parcelType === "non-document"}
                  disabled={parcelType === "document"}
                  error={errors.weight}
                />
              </div>
            </div>

            {/* SENDER INFO */}

            <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
              <SectionHeader
                icon={<User size={21} />}
                title="Sender Info"
                subtitle="Tell us where the parcel should be picked up."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Sender Name */}

                <InputField
                  label="Name"
                  name="senderName"
                  placeholder="Enter sender name"
                  icon={<User size={18} />}
                  register={register}
                  required
                  error={errors.senderName}
                />

                {/* Sender Contact */}

                <InputField
                  label="Contact"
                  name="senderContact"
                  placeholder="01XXXXXXXXX"
                  icon={<Phone size={18} />}
                  register={register}
                  required
                  error={errors.senderContact}
                />

                {/* Sender Region */}

                <SelectField
                  label="Select Region"
                  name="senderRegion"
                  placeholder="Select sender region"
                  options={regions}
                  register={register}
                  required
                  error={errors.senderRegion}
                />

                {/* Sender Service Center */}

                <SelectField
                  label="Select Service Center"
                  name="senderServiceCenter"
                  placeholder={
                    senderRegion
                      ? "Select service center"
                      : "Select region first"
                  }
                  options={senderRegion ? serviceCenters[senderRegion] : []}
                  register={register}
                  required
                  disabled={!senderRegion}
                  error={errors.senderServiceCenter}
                />

                {/* Sender Address */}

                <TextAreaField
                  label="Address"
                  name="senderAddress"
                  placeholder="Enter complete pickup address"
                  icon={<MapPin size={18} />}
                  register={register}
                  required
                  error={errors.senderAddress}
                />

                {/* Pickup Instruction */}

                <TextAreaField
                  label="Pick up Instruction"
                  name="pickupInstruction"
                  placeholder="Example: Please call before pickup"
                  register={register}
                  required
                  error={errors.pickupInstruction}
                />
              </div>
            </div>

            {/* RECEIVER INFO */}

            <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
              <SectionHeader
                icon={<MapPin size={21} />}
                title="Receiver Info"
                subtitle="Tell us where the parcel should be delivered."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Receiver Name */}

                <InputField
                  label="Name"
                  name="receiverName"
                  placeholder="Enter receiver name"
                  icon={<User size={18} />}
                  register={register}
                  required
                  error={errors.receiverName}
                />

                {/* Receiver Contact */}

                <InputField
                  label="Contact"
                  name="receiverContact"
                  placeholder="01XXXXXXXXX"
                  icon={<Phone size={18} />}
                  register={register}
                  required
                  error={errors.receiverContact}
                />

                {/* Receiver Region */}

                <SelectField
                  label="Select Region"
                  name="receiverRegion"
                  placeholder="Select receiver region"
                  options={regions}
                  register={register}
                  required
                  error={errors.receiverRegion}
                />

                {/* Receiver Service Center */}

                <SelectField
                  label="Select Service Center"
                  name="receiverServiceCenter"
                  placeholder={
                    receiverRegion
                      ? "Select service center"
                      : "Select region first"
                  }
                  options={receiverRegion ? serviceCenters[receiverRegion] : []}
                  register={register}
                  required
                  disabled={!receiverRegion}
                  error={errors.receiverServiceCenter}
                />

                {/* Receiver Address */}

                <TextAreaField
                  label="Address"
                  name="receiverAddress"
                  placeholder="Enter complete delivery address"
                  icon={<MapPin size={18} />}
                  register={register}
                  required
                  error={errors.receiverAddress}
                />

                {/* Delivery Instruction */}

                <TextAreaField
                  label="Delivery Instruction"
                  name="deliveryInstruction"
                  placeholder="Example: Deliver after 5 PM"
                  register={register}
                  required
                  error={errors.deliveryInstruction}
                />
              </div>
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end">
              <button
                type="submit"
                className="
                  px-8 py-3.5
                  rounded-full
                  bg-[var(--foreground)]
                  text-[var(--secondary)]
                  font-semibold
                  transition-all duration-300
                  hover:bg-[var(--primary)]
                  hover:text-[var(--foreground)]
                  hover:-translate-y-0.5
                "
              >
                Submit Parcel
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CONFIRMATION POPUP */}

      {showConfirmation && submittedData && (
        <ParcelDetails
          setShowConfirmation={setShowConfirmation}
          submittedData={submittedData}
          submitting={submitting}
          onConfirm={handleConfirm}
        />
      )}

      {/* Popup Animation */}

      <style>
        {`
          @keyframes popup {
            0% {
              opacity: 0;
              transform: scale(0.94) translateY(10px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
};

/* SECTION HEADER*/

const SectionHeader = ({ icon, title, subtitle }) => {
  return (
    <div className="flex items-center gap-3 mb-7">
      <div
        className="
          w-11 h-11
          rounded-xl
          bg-[var(--secondary)]
          text-[var(--foreground)]
          flex items-center justify-center
        "
      >
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>

        <p className="text-sm text-[var(--text)]">{subtitle}</p>
      </div>
    </div>
  );
};

/* INPUT FIELD */

const InputField = ({
  label,
  name,
  placeholder,
  type = "text",
  icon,
  register,
  required = false,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
        {label}

        {required && <Required />}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text)]">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name, {
            required: required ? `${label} is required` : false,

            ...(type === "number" && {
              min: {
                value: 0.1,
                message: "Weight must be greater than 0",
              },
            }),
          })}
          className={`
            w-full
            rounded-xl
            border
            ${error ? "border-red-500" : "border-gray-200"}
            bg-white
            py-3 px-4
            ${icon ? "pl-11" : ""}
            outline-none
            transition
            focus:border-[var(--foreground)]
            focus:ring-2
            focus:ring-[var(--secondary)]
            disabled:bg-gray-100
            disabled:cursor-not-allowed
          `}
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

/* SELECT FIELD */

const SelectField = ({
  label,
  name,
  placeholder,
  options,
  register,
  required = false,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
        {label}

        {required && <Required />}
      </label>

      <div className="relative">
        <select
          disabled={disabled}
          {...register(name, {
            required: required ? `${label} is required` : false,
          })}
          className={`
            appearance-none
            w-full
            rounded-xl
            border
            ${error ? "border-red-500" : "border-gray-200"}
            bg-white
            px-4 py-3 pr-10
            outline-none
            transition
            focus:border-[var(--foreground)]
            focus:ring-2
            focus:ring-[var(--secondary)]
            disabled:bg-gray-100
            disabled:cursor-not-allowed
          `}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            pointer-events-none
            text-[var(--text)]
          "
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

/* TEXT AREA FIELD */

const TextAreaField = ({
  label,
  name,
  placeholder,
  icon,
  register,
  required = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
        {label}

        {required && <Required />}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-4 text-[var(--text)]">{icon}</div>
        )}

        <textarea
          placeholder={placeholder}
          rows={3}
          {...register(name, {
            required: required ? `${label} is required` : false,
          })}
          className={`
            w-full
            rounded-xl
            border
            ${error ? "border-red-500" : "border-gray-200"}
            bg-white
            px-4 py-3
            ${icon ? "pl-11" : ""}
            outline-none
            resize-none
            transition
            focus:border-[var(--foreground)]
            focus:ring-2
            focus:ring-[var(--secondary)]
          `}
        />
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

/* Parcel details with delivery charge and service charge */

const ParcelDetails = ({
  setShowConfirmation,
  submittedData,
  submitting,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* Background Overlay */}

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowConfirmation(false)}
      />

      {/* Modal */}

      <div
        className="
              relative
              w-full
              max-w-md
              max-h-[90vh]
              bg-white
              rounded-3xl
              shadow-2xl
              overflow-y-auto
              overflow-x-hidden
              animate-[popup_.25s_ease-out]
            "
      >
        {/* Top Accent */}

        <div className="h-2 bg-[var(--secondary)]" />

        <div className="p-6 md:p-7">
          {/* Close Button */}

          <button
            type="button"
            onClick={() => setShowConfirmation(false)}
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
                  hover:text-gray-800
                  transition
                "
          >
            <X size={18} />
          </button>

          {/* Success Icon */}

          <div className="flex justify-center">
            <div
              className="
                    w-16 h-16
                    rounded-full
                    bg-[var(--secondary)]
                    flex
                    items-center
                    justify-center
                    text-[var(--foreground)]
                    shadow-lg
                  "
            >
              <CheckCircle2 size={34} />
            </div>
          </div>

          {/* Heading */}

          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Parcel Details Ready!
            </h2>

            <p className="text-sm text-[var(--text)] mt-1">
              Review your delivery information and cost before confirming.
            </p>
          </div>

          {/* Parcel Summary */}

          <div className="mt-6">
            <div
              className="
                    flex
                    items-center
                    gap-3
                    bg-[var(--background)]
                    rounded-2xl
                    p-4
                    border
                    border-gray-100
                  "
            >
              <div
                className="
                      w-11 h-11
                      rounded-xl
                      bg-[var(--secondary)]
                      flex
                      items-center
                      justify-center
                      text-[var(--foreground)]
                    "
              >
                <Package size={21} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-[var(--text)]">Parcel</p>

                <p className="font-semibold text-[var(--foreground)] truncate">
                  {submittedData.parcelTitle}
                </p>
              </div>

              <span
                className="
                      ml-auto
                      shrink-0
                      text-xs
                      font-medium
                      px-3
                      py-1.5
                      rounded-full
                      bg-[var(--foreground)]
                      text-[var(--secondary)]
                    "
              >
                {submittedData.parcelType === "document"
                  ? "Document"
                  : "Package"}
              </span>
            </div>
          </div>

          {/* Sender → Receiver */}

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="text-left">
              <p className="text-[11px] text-[var(--text)]">PICKUP</p>

              <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                {submittedData.senderName}
              </p>

              <p className="text-xs text-[var(--text)] truncate">
                {submittedData.senderRegion}
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

            <div className="text-right">
              <p className="text-[11px] text-[var(--text)]">DELIVERY</p>

              <p className="font-semibold text-sm text-[var(--foreground)] truncate">
                {submittedData.receiverName}
              </p>

              <p className="text-xs text-[var(--text)] truncate">
                {submittedData.receiverRegion}
              </p>
            </div>
          </div>

          {/* Cost Breakdown */}

          <div
            className="
                  mt-5
                  rounded-2xl
                  border
                  border-gray-200
                  overflow-hidden
                "
          >
            <div
              className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-3
                    bg-gray-100
                  "
            >
              <ReceiptText size={17} />

              <span className="font-semibold text-sm">Delivery Cost</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Product Delivery Cost */}

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text)]">
                  Product Delivery Cost
                </span>

                <span className="text-sm font-medium">
                  ৳ {submittedData.productDeliveryCost}
                </span>
              </div>

              {/* Service Charge */}

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-[var(--text)]">
                    Service Charge
                  </span>

                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--foreground)]">
                    10%
                  </span>
                </div>

                <span className="text-sm font-medium">
                  ৳ {submittedData.serviceCharge}
                </span>
              </div>

              <div className="border-t border-gray-200" />

              {/* Total */}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text)]">Total Payable</p>

                  <p className="text-xl font-bold text-[var(--foreground)]">
                    Delivery Cost
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    ৳ {submittedData.totalCost}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="
                    py-3
                    rounded-full
                    border
                    border-gray-200
                    font-semibold
                    text-sm
                    hover:bg-gray-100
                    transition
                  "
            >
              Edit Details
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="
                    py-3
                    rounded-full
                    bg-[var(--foreground)]
                    text-[var(--secondary)]
                    font-semibold
                    text-sm
                    hover:bg-[var(--primary)]
                    hover:text-[var(--foreground)]
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}

              {submitting ? "Saving..." : "Confirm Parcel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* REQUIRED */

const Required = () => <span className="text-red-500 ml-1">*</span>;

export default SendParcel;
