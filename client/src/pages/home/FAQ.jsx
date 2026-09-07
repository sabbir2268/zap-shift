import React, { useState } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How does this posture corrector work?",
      answer:
        "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day. Here’s how it typically functions: A posture corrector works by providing support and gentle alignment to your shoulders.",
    },
    {
      question: "Is it suitable for all ages and body types?",
      answer:
        "Yes, the posture corrector is designed to accommodate different body types and can be adjusted for a comfortable fit. However, users with specific medical conditions should consult a healthcare professional before using one.",
    },
    {
      question: "Does it really help with back pain and posture improvement?",
      answer:
        "A posture corrector can help remind you to maintain proper alignment and develop better posture habits. Results can vary depending on the individual and how consistently it is used.",
    },
    {
      question: "Does it have smart features like vibration alerts?",
      answer:
        "Some smart posture correctors include vibration alerts that gently remind you whenever your posture starts to become incorrect.",
    },
    {
      question: "How will I be notified when the product is back in stock?",
      answer:
        "You can subscribe to our stock notifications. Once the product becomes available again, we will notify you through your registered contact information.",
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
            Enhance posture, mobility, and well-being effortlessly with
            Posture Pro. Achieve proper alignment, reduce pain, and strengthen
            your body with ease!
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
                      ? "border-[var(--secondary)] bg-[var(--card)] shadow-sm"
                      : "border-black/10 bg-[var(--card)] hover:border-[var(--secondary)]"
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
                            ? "bg-[var(--secondary)] text-[var(--text)]"
                            : "bg-[var(--foreground)] text-[var(--primary)]"
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
                          ? "bg-[var(--secondary)] text-[var(--text)]"
                          : "bg-[var(--background)] text-[var(--foreground)]"
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
              text-[var(--text)]
              border-2
              border-[var(--secondary)]
              font-semibold
              hover:bg-[var(--foreground)]
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