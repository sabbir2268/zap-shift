import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Quote, User } from "lucide-react";
const CustomerReviews = () => {
const reviews = [
  {
    name: "Awlad Hossin",
    designation: "Senior Product Designer",
    review:
      "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.",
  },
  {
    name: "Rasel Ahamed",
    designation: "CTO",
    review:
      "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.",
  },
  {
    name: "Nasir Uddin",
    designation: "CEO",
    review:
      "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.",
  },
  {
    name: "Awlad Hossin",
    designation: "Senior Product Designer",
    review:
      "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.",
  },
  {
    name: "Rasel Ahamed",
    designation: "Senior Product Designer",
    review:
      "A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.",
  },
];

  const infiniteReviews = [...reviews, ...reviews, ...reviews];

  const middleStart = reviews.length;

  const [activeIndex, setActiveIndex] = useState(middleStart);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextReview = () => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  };

  const previousReview = () => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev - 1);
  };

  const goToReview = (index) => {
    setIsTransitioning(true);
    setActiveIndex(middleStart + index);
  };


  useEffect(() => {
    if (activeIndex >= reviews.length * 2) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(activeIndex - reviews.length);
      }, 500);

      return () => clearTimeout(timer);
    }

    if (activeIndex < reviews.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setActiveIndex(activeIndex + reviews.length);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [activeIndex, reviews.length]);

  const currentDot = activeIndex % reviews.length;

  return (
    <section className="w-full overflow-hidden  py-16 md:py-20">

      <div className="text-center px-4">

        {/* Illustration */}
        <div className="flex justify-center mb-4">
          <img
            src="../../src/assets/customer-top.png"
            alt="Customer reviews"
            className="w-32 h-20 object-contain"
          />
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)]">
          What our customers are saying
        </h2>

        {/* Description */}
        <p className="max-w-3xl mx-auto mt-5 text-sm md:text-base leading-6 text-gray-500">
          Enhance posture, mobility, and well-being effortlessly with Posture
          Pro. Achieve proper alignment, reduce pain, and strengthen your body
          with ease!
        </p>

      </div>

      {/* =========================
          CAROUSEL
      ========================== */}
      <div className="relative w-full overflow-hidden mt-16">

        <div
          className={`flex items-center gap-5 ${
            isTransitioning
              ? "transition-transform duration-500 ease-in-out"
              : ""
          }`}
          style={{
            transform: `translateX(calc(50% - ${
              activeIndex * 340 + 160
            }px))`,
          }}
        >
          {infiniteReviews.map((review, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={index}
                className={`
                  flex-shrink-0
                  w-[320px]
                  rounded-2xl
                  p-6 md:p-7
                  mt-8
                  transition-all
                  duration-500
                  ease-in-out

                  ${
                    isActive
                      ? `
                        bg-white
                        shadow-lg
                        opacity-100
                        translate-y-[-20px]
                        scale-100
                      `
                      : `
                        bg-white/70
                        shadow-sm
                        opacity-25
                        translate-y-0
                        scale-[0.95]
                      `
                  }
                `}
              >

                {/* Quote Icon */}
                <Quote
                  size={38}
                  strokeWidth={3}
                  className="text-[var(--foreground)] fill-cyan-100 mb-4"
                />

                {/* Review */}
                <p className="text-sm leading-6 text-gray-600">
                  {review.review}
                </p>

                {/* Dashed Divider */}
                <div className="border-t border-dashed border-gray-400 my-5"></div>

                {/* Customer */}
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[var(--foreground)] flex items-center justify-center flex-shrink-0">
                    <User
                      size={24}
                      strokeWidth={2}
                      className="text-[var(--secondary)]"
                    />
                  </div>

                  {/* Name + Designation */}
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      {review.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {review.designation}
                    </p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}
      <div className="flex items-center justify-center gap-5 mt-2">

        {/* Previous Button */}
        <button
          onClick={previousReview}
          type="button"
          aria-label="Previous review"
          className="
            w-10
            h-10
            rounded-full
            bg-white
            flex
            items-center
            justify-center
            text-[var(--foreground)]
            shadow-sm
            hover:bg-[var(--foreground)]
            hover:text-white
            transition-all
            duration-300
          "
        >
          <ArrowLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {reviews.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToReview(index)}
              aria-label={`Go to review ${index + 1}`}
              className={`
                rounded-full
                transition-all
                duration-300

                ${
                  index === currentDot
                    ? "w-7 h-2 bg-[var(--foreground)]"
                    : "w-2 h-2 bg-cyan-300"
                }
              `}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextReview}
          type="button"
          aria-label="Next review"
          className="
            w-10
            h-10
            rounded-full
            bg-[var(--secondary)]
            flex
            items-center
            justify-center
            text-[var(--text)]
            hover:bg-[var(--foreground)]
            hover:text-[var(--secondary)]
            transition-all
            duration-300
          "
        >
          <ArrowRight size={18} />
        </button>

      </div>
    </section>
  );
};

export default CustomerReviews;