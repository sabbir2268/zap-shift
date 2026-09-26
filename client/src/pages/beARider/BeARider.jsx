import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import riderImage from "../../assets/big-deliveryman.png";
import useAxios from "../../hooks/useAxios";
import useAuth from "../../hooks/useAuth";

/* Warehouses a rider can pick, grouped by the region they belong to */
const REGION_WAREHOUSES = {
  Dhaka: ["Dhaka Warehouse", "Gazipur Warehouse", "Savar Warehouse"],
  Chattogram: ["Chattogram Warehouse", "Cox's Bazar Warehouse"],
  Khulna: ["Khulna Warehouse", "Jessore Warehouse"],
  Rajshahi: ["Rajshahi Warehouse", "Rangpur Warehouse"],
  Sylhet: ["Sylhet Warehouse", "Moulvibazar Warehouse"],
};

const BeARider = () => {
  const api = useAxios();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const selectedRegion = watch("region");
  const warehouses = selectedRegion ? REGION_WAREHOUSES[selectedRegion] || [] : [];

  /* a warehouse from the previous region must not survive a region change */
  useEffect(() => {
    setValue("warehouse", "");
  }, [selectedRegion, setValue]);

  const onSubmit = (data) => {
    const riderData = {
      ...data,
      uid: user?.uid,
      name: user?.displayName,
      email: user?.email,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    console.log("riderData", riderData);

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

        <p className="text-gray-600 text-base md:text-lg max-w-2xl">
          Enjoy fast, reliable parcel delivery with real-time tracking and zero
          hassle. From personal packages to business shipments — we deliver on
          time, every time.
        </p>
      </div>

      {/* Shared Background Container */}
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-10">
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
                  value={user?.displayName || ""}
                  readOnly
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-600"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block mb-2 font-medium">Your Age</label>

                <input
                  type="number"
                  placeholder="Enter your age"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed text-gray-600"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block mb-2 font-medium">Your Region</label>

                <select
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                  {...register("region", { required: true })}
                >
                  <option value="" disabled>
                    Select your region
                  </option>

                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Sylhet">Sylhet</option>
                </select>
              </div>

              {/* NID */}
              <div>
                <label className="block mb-2 font-medium">NID No</label>

                <input
                  type="text"
                  placeholder="Enter your NID number"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                  {...register("contact", { required: true })}
                />
              </div>

              {/* Warehouse */}
              <div>
                <label className="block mb-2 font-medium">
                  Which warehouse do you want to work at?
                </label>

                <select
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                  {...register("warehouse", { required: true })}
                >
                  <option value="" disabled>
                    {selectedRegion
                      ? "Select warehouse"
                      : "Select your region first"}
                  </option>

                  {warehouses.map((warehouse) => (
                    <option key={warehouse} value={warehouse}>
                      {warehouse}
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
