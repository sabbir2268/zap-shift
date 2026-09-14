import React from "react";

const BeAMerchant = () => {
  return (
    <section className="relative w-full max-w-6xl mx-auto rounded-2xl overflow-hidden bg-[var(--foreground)] my-12">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('../../src/assets/be-a-merchant-bg.png')",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10  mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
          {/* Left Content */}
          <div className="w-full md:w-1/2 text-left text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Merchant and Customer Satisfaction is Our First Priority
            </h2>

            <p className="mt-5 text-base md:text-lg leading-8 text-[var(--secondary)]/80">
              We offer the lowest delivery charge with the highest value along
              with 100% safety of your product. Profast Courier delivers your
              parcels in every corner of Bangladesh right on time.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                className="px-7 py-3.5 rounded-full
                bg-[var(--secondary)]
                text-[var(--text)]
                border-2 border-[var(--secondary)]
                font-semibold
                hover:bg-[var(--foreground)]
                hover:text-[var(--secondary)]
                hover:border-[var(--secondary)]
                transition-all duration-300"
              >
                Become a Merchant
              </button>

              <button
                type="button"
                className="px-7 py-3.5 rounded-full
                bg-[var(--foreground)]
                text-[var(--secondary)]
                border-2 border-[var(--secondary)]
                font-semibold
                hover:bg-[var(--secondary)]
                hover:text-[var(--text)]
                hover:border-[var(--secondary)]
                transition-all duration-300"
              >
                Earn with Profast Courier
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img
              src="../../src/assets/location-merchant.png"
              alt="Become a Merchant"
              className="w-full max-w-md lg:max-w-lg object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeAMerchant;
