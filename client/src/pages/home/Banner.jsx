import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

import banner1 from "../../assets/banner/banner1.png";
import banner2 from "../../assets/banner/banner2.png";
import banner3 from "../../assets/banner/banner3.png";

const Banner = () => {
  return (
    <div className="rounded-2xl overflow-hidden">
        <Carousel
      autoPlay
      infiniteLoop
      interval={3000}
      showThumbs={false}
      showStatus={false}
      showIndicators={true}
      stopOnHover={true}
      swipeable={true} 
      className="mb-3 lg:mb-5"
    >
      <div>
        <img src={banner1} alt="Banner 1" />
      </div>

      <div>
        <img src={banner2} alt="Banner 2" />
      </div>

      <div>
        <img src={banner3} alt="Banner 3" />
      </div>
    </Carousel>
    </div>
  );
};

export default Banner;