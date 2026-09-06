
import React from "react";
import {
  Package,
  Banknote,
  Warehouse,
  Building2,
} from "lucide-react";

const HowItWorks = () => {
  const howItWorksData = [
    {
      title: "Booking Pick & Drop",
      description:
        "From personal packages to business shipments — we deliver on time, every time.",
      icon: Package,
    },
    {
      title: "Cash On Delivery",
      description:
        "From personal packages to business shipments — we deliver on time, every time.",
      icon: Banknote,
    },
    {
      title: "Delivery Hub",
      description:
        "From personal packages to business shipments — we deliver on time, every time.",
      icon: Warehouse,
    },
    {
      title: "Booking SME & Corporate",
      description:
        "From personal packages to business shipments — we deliver on time, every time.",
      icon: Building2,
    },
  ];

  return (
    <section className="py-10">
      <div className=" mx-auto px-4">

        {/* Section Heading */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)]">
            How It Works
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {howItWorksData.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  p-6
                  rounded-2xl
                  bg-[var(--card)]
                  border
                  border-[var(--border)]
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-xl
                  hover:border-[var(--secondary)]
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
                  "
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    text-[var(--text)]
                    opacity-70
                    leading-relaxed
                  "
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
