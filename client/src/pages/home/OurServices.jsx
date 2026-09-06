
import React from "react";
import {
  Truck,
  MapPin,
  PackageCheck,
  Banknote,
  Building2,
  RotateCcw,
} from "lucide-react";

const OurServices = () => {
  const services = [
    {
      title: "Express & Standard Delivery",
      description:
        "We deliver parcels within 24–72 hours in Dhaka, Chittagong, Sylhet, Khulna, and Rajshahi. Express delivery is available in Dhaka within 4–6 hours from pick-up to drop-off.",
      icon: Truck,
    },
    {
      title: "Nationwide Delivery",
      description:
        "We deliver parcels nationwide with home delivery in every district, ensuring your products reach customers within 48–72 hours.",
      icon: MapPin,
    },
    {
      title: "Fulfillment Solution",
      description:
        "We also offer customized service with inventory management support, online order processing, packaging, and after-sales support.",
      icon: PackageCheck,
    },
    {
      title: "Cash on Home Delivery",
      description:
        "100% cash on delivery anywhere in Bangladesh with guaranteed safety of your product.",
      icon: Banknote,
    },
    {
      title: "Corporate Service / Contract In Logistics",
      description:
        "Customized corporate services which includes warehouse and inventory management support.",
      icon: Building2,
    },
    {
      title: "Parcel Return",
      description:
        "Through our reverse logistics facility we allow end customers to return or exchange their products with online business merchants.",
      icon: RotateCcw,
    },
  ];

  return (
    <section className="bg-[var(--foreground)] py-10 md:py-15 rounded-2xl mb-5 lg:mb-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Section Header */}
        <div className="max-w-2xl mb-10 md:mb-14 items-center text-center mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-4">
            Our Services
          </h2>

          <p className="text-[var(--primary)]/70 leading-relaxed">
            Enjoy fast, reliable parcel delivery with real-time tracking and
            zero hassle. From personal packages to business shipments — we
            deliver on time, every time.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="
                  group
                  p-6
                  rounded-2xl
                  bg-[var(--primary)]
                  border
                  border-[var(--border)]
                  transition-all
                  duration-300
                  hover:bg-[var(--secondary)]
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >
                {/* Icon */}
                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                    bg-[var(--foreground)]
                    text-[var(--secondary)]
                    mb-5
                    transition-all
                    duration-300
                    group-hover:bg-[var(--primary)]
                    group-hover:text-[var(--foreground)]
                    group-hover:scale-110
                  "
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3
                  className="
                    text-xl
                    font-bold
                    text-[var(--text)]
                    mb-3
                    transition-colors
                    duration-300
                    group-hover:text-[var(--foreground)]
                  "
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    text-[var(--text)]/70
                    leading-relaxed
                    transition-colors
                    duration-300
                    group-hover:text-[var(--foreground)]/80
                  "
                >
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default OurServices;