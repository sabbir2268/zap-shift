
import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  MapPin,
  Banknote,
  RotateCcw,
  PackageCheck,
  Warehouse,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

const Service = () => {
  const services = [
    {
      icon: Zap,
      title: "Express Delivery",
      description:
        "Get your parcels delivered quickly with our priority delivery service for urgent shipments.",
    },
    {
      icon: MapPin,
      title: "Nationwide Delivery",
      description:
        "Send parcels anywhere in Bangladesh with reliable door-to-door delivery across all districts.",
    },
    // {
    //   icon: Banknote,
    //   title: "Cash on Delivery",
    //   description:
    //     "Collect payment from your customers safely and conveniently when the parcel is delivered.",
    // },
    // {
    //   icon: PackageCheck,
    //   title: "Live Parcel Tracking",
    //   description:
    //     "Track your parcel in real time and stay updated from pickup to final delivery.",
    // },
    // {
    //   icon: RotateCcw,
    //   title: "Easy Parcel Return",
    //   description:
    //     "Make product returns and exchanges simple with our convenient reverse logistics service.",
    // },
    // {
    //   icon: Warehouse,
    //   title: "Fulfillment Solution",
    //   description:
    //     "Manage inventory, packaging, order processing and delivery from one complete solution.",
    // },
  ];

  return (
    <section className="w-full bg-[var(--background)] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-[var(--secondary)] text-[var(--foreground)] text-sm font-semibold mb-4">
            Our Services
          </span>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)]">
            Delivery Solutions Built
            <span className="text-[var(--primary)]"> For You</span>
          </h1>

          <p className="mt-4 text-[var(--text)] leading-relaxed">
            From personal packages to growing businesses, we provide fast,
            secure and reliable delivery solutions designed to make shipping
            simple.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="
                  group
                  bg-[var(--card)]
                  rounded-2xl
                  p-6
                  border border-[var(--border)]
                  transition-all duration-300
                  hover:bg-[var(--secondary)]
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >
                {/* Icon */}
                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    flex items-center justify-center
                    bg-[var(--primary)]
                    text-[var(--foreground)]
                    mb-5
                    transition-all duration-300
                    group-hover:bg-[var(--foreground)]
                    group-hover:text-[var(--secondary)]
                  "
                >
                  <Icon size={24} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">
                  {service.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-[var(--text)] leading-6">
                  {service.description}
                </p>

                {/* Learn More */}
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <span>Learn More</span>

                  <ArrowUpRight
                    size={17}
                    className="
                      transition-transform duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="
            mt-12
            rounded-3xl
            bg-[var(--foreground)]
            px-6 py-8 md:px-10 md:py-10
            flex flex-col md:flex-row
            items-center
            justify-between
            gap-6
          "
        >
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <ShieldCheck
                size={20}
                className="text-[var(--primary)]"
              />

              <span className="text-sm font-semibold text-[var(--primary)]">
                Safe & Reliable Delivery
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[var(--secondary)]">
              Ready to send your parcel?
            </h2>

            <p className="text-[var(--secondary)]/70 mt-2 text-sm">
              Book a delivery today and let us handle the rest.
            </p>
          </div>

          <Link
            to="/dashboard/send-parcel"
            className="
              group
              flex items-center gap-3
              bg-[var(--primary)]
              text-[var(--foreground)]
              px-6 py-3
              rounded-full
              font-semibold
              whitespace-nowrap
              transition-all duration-300
              hover:bg-[var(--secondary)]
              hover:text-[var(--foreground)]
              hover:shadow-lg
            "
          >
            Send Parcel

            <span
              className="
                w-8 h-8
                rounded-full
                bg-[var(--foreground)]
                text-[var(--primary)]
                flex items-center justify-center
                transition-transform duration-300
                group-hover:rotate-45
              "
            >
              <ArrowUpRight size={17} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Service;
