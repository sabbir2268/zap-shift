import React, { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How do I send a parcel with ZapShift?",
      answer:
        "Sign in, open Send Parcel, fill in the parcel details and the sender and receiver addresses, review the calculated cost in the confirmation dialog, then confirm. The parcel appears in My Parcels straight away.",
    },
    {
      question: "How is the delivery cost calculated?",
      answer:
        "Documents are a flat 60 taka. Non-documents start at 80 taka for up to one kilo, plus 20 taka for each extra kilo. A different destination region adds 40 taka, and a 10% service charge is added on top.",
    },
    {
      question: "How can I track my parcel?",
      answer:
        "Open Track Parcel from your dashboard and enter the parcel id. You will see its current delivery status, the pickup and delivery contacts, the route and the cost.",
    },
    {
      question: "When does a rider get assigned?",
      answer:
        "An admin assigns a rider only after the parcel has been paid for. Until then it stays in the booking queue, so a delivery can never start without payment.",
    },
    {
      question: "Can I change a parcel after booking it?",
      answer:
        "Yes. Use Update Parcel from My Parcels to edit the details while the parcel is still pending. Delivery status is controlled by the platform, not by the sender.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">

          {/* Small Label */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px] bg-[var(--secondary)]"></span>

            <span className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
              FAQ
            </span>

            <span className="w-8 h-[2px] bg-[var(--secondary)]"></span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
            Frequently Asked Question
          </h2>

          {/* Description */}
          <p className="mt-5 text-base md:text-lg leading-7 text-[var(--text)]/60">
            Everything you need to know about sending, tracking and receiving
            parcels with ZapShift.
          </p>

          <div className="w-4 h-[2px] bg-[var(--secondary)] mx-auto mt-5"></div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">

          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`
                  rounded-2xl
                  border
                  overflow-hidden
                  transition-all
                  duration-300
                  ${
                    isOpen
                      ? "border-[var(--secondary)] bg-[var(--surface)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--secondary)]"
                  }
                `}
              >

                {/* Question */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between gap-5 px-5 md:px-7 py-5 text-left"
                >

                  <div className="flex items-center gap-4">

                    {/* Number */}
                    <span
                      className={`
                        flex-shrink-0
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        text-sm
                        font-bold
                        transition-all
                        duration-300
                        ${
                          isOpen
                            ? "bg-[var(--secondary)] text-[var(--text-on-secondary)]"
                            : "bg-[var(--ink)] text-[var(--text-on-ink)]"
                        }
                      `}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <span
                      className={`
                        text-base md:text-lg font-semibold
                        ${
                          isOpen
                            ? "text-[var(--foreground)]"
                            : "text-[var(--text)]"
                        }
                      `}
                    >
                      {faq.question}
                    </span>

                  </div>

                  {/* Icon */}
                  <span
                    className={`
                      flex-shrink-0
                      w-9
                      h-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      transition-all
                      duration-300
                      ${
                        isOpen
                          ? "bg-[var(--secondary)] text-[var(--text-on-secondary)]"
                          : "bg-[var(--ink)] text-[var(--text-on-ink)]"
                      }
                    `}
                  >
                    {isOpen ? (
                      <Minus size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                  </span>

                </button>

                {/* Answer */}
                <div
                  className={`
                    grid transition-all duration-300 ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">

                    <div className="px-5 md:px-7 pb-6 pl-[68px] md:pl-[76px]">
                      <div className="border-t border-dashed border-[var(--border)] pt-5">

                        <p className="text-sm md:text-base leading-7 text-[var(--text)]/60">
                          {faq.answer}
                        </p>

                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* See More FAQs */}
        <div className="flex justify-center mt-8">

          <button
            type="button"
            className="
              group
              inline-flex
              items-center
              gap-3
              px-7
              py-3.5
              rounded-full
              bg-[var(--secondary)]
              text-[var(--text-on-secondary)]
              border-2
              border-[var(--secondary)]
              font-semibold
              hover:bg-[var(--ink)]
              hover:text-[var(--secondary)]
              hover:border-[var(--secondary)]
              transition-all
              duration-300
            "
          >
            See More FAQs

            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </button>

        </div>

      </div>
    </section>
  );
};

export default FAQ;