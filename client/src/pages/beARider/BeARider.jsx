import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import riderImage from "../../assets/big-deliveryman.png";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";
import {
  SERVICE_CENTER_REGIONS,
  getServiceCentersByRegion,
} from "../../data/serviceCenters.js";

const BeARider = () => {
  const api = useAxios();
  const { user, profile, loadProfile } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const selectedRegion = watch("region");
  const centers = selectedRegion
    ? getServiceCentersByRegion(selectedRegion)
    : [];

  /* a service center from the previous region must not survive a region change.
     the center decides what the rider is paid on every parcel, so a stale one
     would pay them against the wrong region */
  useEffect(() => {
    setValue("serviceCenter", "");
  }, [selectedRegion, setValue]);

  /* a signup saves its record behind the redirect, and the auth profile is read
     the moment the account appears, so that first read can land before the
     record exists and come back with no name at all. ask once more. */
  const retriedProfile = useRef(false);

  useEffect(() => {
    if (user?.displayName || profile?.name || retriedProfile.current) return;

    retriedProfile.current = true;
    loadProfile();
  }, [user, profile, loadProfile]);

  /* the account is the only source of a name, and an email signup can leave
     firebase without a displayName, so the address is the last resort */
  const accountName =
    user?.displayName?.trim() ||
    profile?.name?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "";

  const onSubmit = (data) => {
    const riderData = {
      ...data,
      uid: user?.uid,
      /* the name field is read only and mirrors the account */
      name: accountName,
      email: user?.email,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    setSubmitting(true);

    api.post("/api/rider-applications", riderData)
      .then(() => {
        toast.success("Rider application submitted!");
        reset();
      })
      .catch((error) => {
        toast.error(error.message || "Failed to submit application");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Be a Rider</h1>

        <p className="text-[var(--text-muted)] text-base md:text-lg max-w-2xl">
          Enjoy fast, reliable parcel delivery with real-time tracking and zero
          hassle. From personal packages to business shipments — we deliver on
          time, every time.
        </p>
      </div>

      {/* Shared Background Container */}
      <div className="bg-[var(--surface)] shadow-xl rounded-2xl p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Side - Form */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Tell us about yourself
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block mb-2 font-medium">Your Name</label>

                <input
                  type="text"
                  value={accountName}
                  readOnly
                  required
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 bg-[var(--surface-muted)] cursor-not-allowed text-[var(--text-muted)]"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block mb-2 font-medium">Your Age</label>

                <input
                  type="number"
                  placeholder="Enter your age"
                  required
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  {...register("age", { required: true })}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 font-medium">Your Email</label>

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  required
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 bg-[var(--surface-muted)] cursor-not-allowed text-[var(--text-muted)]"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block mb-2 font-medium">Your Region</label>

                <select
                  required
                  defaultValue=""
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 outline-none"
                  {...register("region", { required: true })}
                >
                  <option value="" disabled>
                    Select your region
                  </option>

                  {SERVICE_CENTER_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* NID */}
              <div>
                <label className="block mb-2 font-medium">NID No</label>

                <input
                  type="text"
                  placeholder="Enter your NID number"
                  required
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 outline-none"
                  {...register("nid", { required: true })}
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block mb-2 font-medium">Contact</label>

                <input
                  type="tel"
                  placeholder="Enter your contact number"
                  required
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 outline-none"
                  {...register("contact", { required: true })}
                />
              </div>

              {/* Service Center, the hub the rider works out of. it decides
                  what they are paid on every parcel they deliver */}
              <div>
                <label className="block mb-2 font-medium">
                  Which service center do you want to work at?
                </label>

                <select
                  required
                  defaultValue=""
                  className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-3 outline-none"
                  {...register("serviceCenter", { required: true })}
                >
                  <option value="" disabled>
                    {selectedRegion
                      ? "Select service center"
                      : "Select your region first"}
                  </option>

                  {centers.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center items-end h-full min-h-[500px]">
            <img
              src={riderImage}
              alt="Be a Rider"
              className="w-[75%] max-w-md h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeARider;
