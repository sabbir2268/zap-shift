import React from "react";

const WhyUs = () => {
  const whyUsData = [
    {
      title: "Live Parcel Tracking",
      description:
        "Stay updated in real-time with our live parcel tracking feature. From pick-up to delivery, monitor your shipment's journey and get instant status updates for complete peace of mind.",
      image: "../../src/assets/live-tracking.png",
    },
    {
      title: "100% Safe Delivery",
      description:
        "We ensure your parcels are handled with the utmost care and delivered securely to their destination. Our reliable process guarantees safe and damage-free delivery every time.",
      image: "../../src/assets/tiny-deliveryman.png",
    },
    {
      title: "24/7 Call Center Support",
      description:
        "Our dedicated support team is available around the clock to assist you with any questions, updates, or delivery concerns—anytime you need us.",
      image: "../../src/assets/safe-delivery.png",
    },
  ];

  return (
    <section className="w-full py-16">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose Us
          </h2>

          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            We make parcel delivery simple, secure, and reliable with services
            designed around your needs.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-6">
          {whyUsData.map((item) => (
            <div
              key={item.title}
              className="w-full flex flex-col md:flex-row items-center rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Image */}
              <div className="w-full md:w-40 flex-shrink-0 flex justify-center items-center p-6 md:p-8">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-32 h-32 md:w-36 md:h-36 object-contain"
                />
              </div>

              {/* Dashed Separator */}
              <div className="hidden md:block h-24 border-r-2 border-dashed border-gray-300"></div>

              {/* Text */}
              <div className="flex-1 p-6 md:p-8 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600 leading-7">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
