import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  UserRound,
  CalendarDays,
  Mail,
  MapPin,
  ChevronDown,
  IdCard,
  Phone,
  Warehouse,
  Send,
} from "lucide-react";
import { createRiderApplication } from "../../api/riders";

const regions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const warehouses = [
  "Dhaka Central",
  "Mirpur Hub",
  "Uttara Hub",
  "Dhanmondi Center",
  "Savar Hub",
  "Chattogram Central",
  "Agrabad Hub",
  "Rajshahi Central",
  "Khulna Central",
  "Sylhet Central",
  "Rangpur Central",
  "Mymensingh Central",
];

const BeARider = () => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setSubmitting(true);

    createRiderApplication(data)
      .then(() => {
        toast.success("Rider application submitted!");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to submit application");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <section className="w-full bg-[var(--background)] py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
            Be a Rider
          </h1>

          <p className="mt-3 text-[var(--text)] leading-7">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments — we
            deliver on time, every time.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* ABOUT YOU */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
            <SectionHeader
              icon={<UserRound size={21} />}
              title="Tell us about yourself"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Your Name"
                name="name"
                placeholder="Enter your name"
                icon={<UserRound size={18} />}
                register={register}
                required
                error={errors.name}
              />

              <InputField
                label="Your Age"
                name="age"
                type="number"
                placeholder="Enter your age"
                icon={<CalendarDays size={18} />}
                register={register}
                required
                error={errors.age}
              />

              <InputField
                label="Your Email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                icon={<Mail size={18} />}
                register={register}
                required
                error={errors.email}
              />

              <SelectField
                label="Your Region"
                name="region"
                placeholder="Select your region"
                options={regions}
                register={register}
                required
                error={errors.region}
              />
            </div>
          </div>

          {/* IDENTITY */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
            <SectionHeader
              icon={<IdCard size={21} />}
              title="Identity Details"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="NID No"
                name="nid"
                placeholder="Enter NID number"
                icon={<IdCard size={18} />}
                register={register}
                required
                error={errors.nid}
              />

              <InputField
                label="Contact"
                name="contact"
                placeholder="01XXXXXXXXX"
                icon={<Phone size={18} />}
                register={register}
                required
                error={errors.contact}
              />
            </div>
          </div>

          {/* WORK PREFERENCE */}
          <div className="bg-white rounded-3xl border border-gray-200 p-5 md:p-8">
            <SectionHeader
              icon={<Warehouse size={21} />}
              title="Work Preference"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField
                label="Which warehouse you want to work?"
                name="warehouse"
                placeholder="Select warehouse"
                options={warehouses}
                register={register}
                required
                error={errors.warehouse}
              />

              <InputField
                label="Subscribe"
                name="subscribeEmail"
                type="email"
                placeholder="Enter your email address"
                icon={<Mail size={18} />}
                register={register}
                error={errors.subscribeEmail}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="
                px-8 py-3.5
                rounded-full
                bg-[var(--foreground)]
                text-[var(--secondary)]
                font-semibold
                transition-all
                duration-300
                hover:bg-[var(--primary)]
                hover:text-[var(--foreground)]
                hover:-translate-y-0.5
                disabled:opacity-60
                disabled:cursor-not-allowed
                flex
                items-center
                gap-2
              "
            >
              <Send
                size={18}
                className={submitting ? "animate-pulse" : ""}
              />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

/* SECTION HEADER */
const SectionHeader = ({ icon, title }) => {
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
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
          {...register(name, {
            required: required ? `${label} is required` : false,
            ...(type === "email" && {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            }),
            ...(type === "number" && {
              min: {
                value: 16,
                message: "Age must be at least 16",
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
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <select
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

export default BeARider;