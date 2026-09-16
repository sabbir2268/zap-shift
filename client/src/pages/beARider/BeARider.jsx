import React, { useState } from "react";
import toast from "react-hot-toast";
import riderImage from "../../assets/big-deliveryman.png";
import { createRiderApplication } from "../../api/riders";

const BeARider = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;

    const riderData = {
      name: form.name.value,
      age: form.age.value,
      email: form.email.value,
      region: form.region.value,
      nid: form.nid.value,
      contact: form.contact.value,
      warehouse: form.warehouse.value,
    };

    setSubmitting(true);

    createRiderApplication(riderData)
      .then(() => {
        toast.success("Rider application submitted!");
        form.reset();
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block mb-2 font-medium">Your Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block mb-2 font-medium">Your Age</label>

                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 font-medium">Your Email</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block mb-2 font-medium">Your Region</label>

                <select
                  name="region"
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
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
                  name="nid"
                  placeholder="Enter your NID number"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block mb-2 font-medium">Contact</label>

                <input
                  type="tel"
                  name="contact"
                  placeholder="Enter your contact number"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                />
              </div>

              {/* Warehouse */}
              <div>
                <label className="block mb-2 font-medium">
                  Which warehouse do you want to work at?
                </label>

                <select
                  name="warehouse"
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none"
                >
                  <option value="" disabled>
                    Select warehouse
                  </option>

                  <option value="Dhaka Warehouse">Dhaka Warehouse</option>

                  <option value="Chattogram Warehouse">
                    Chattogram Warehouse
                  </option>

                  <option value="Khulna Warehouse">Khulna Warehouse</option>
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
