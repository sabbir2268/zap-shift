
import React from "react";
import Marquee from "react-fast-marquee";

const Brands = () => {
  const brands = [
    {
      image: "../../src/assets/brands/amazon.png",
      name: "Amazon",
    },
    {
      image: "../../src/assets/brands/amazon_vector.png",
      name: "eBay",
    },
    {
      image: "../../src/assets/brands/casio.png",
      name: "Casio",
    },
    {
      image: "../../src/assets/brands/moonstar.png",
      name: "Moonstar",
    },
    {
      image: "../../src/assets/brands/randstad.png",
      name: "Randstad",
    },
    {
      image: "../../src/assets/brands/start-people 1.png",
      name: "Start People",
    },
    {
      image: "../../src/assets/brands/start.png",
      name: "Start",
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto  py-8 lg:py-12 overflow-hidden">

      {/* Heading */}
      <div className="text-center px-4 mb-4 lg:mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 mb-3">
          Our Partners
        </p>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          We've helped thousands of sales teams
        </h2>

      </div>


      {/* Marquee */}
      <div className="w-full overflow-hidden">
        <Marquee
          speed={45}
          pauseOnHover={true}
          gradient={false}
          direction="left"
        >
          {brands.map((brand, index) => (
            <div
              key={index}
              className="
                mx-4 md:mx-8
                flex
                h-24
                items-center
                justify-center
              "
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="
                  max-h-14
                  max-w-[150px]
                  object-contain
                  grayscale
                  opacity-60
                  transition-all
                  duration-500
                  hover:grayscale-0
                  hover:opacity-100
                  hover:scale-110
                "
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default Brands;
