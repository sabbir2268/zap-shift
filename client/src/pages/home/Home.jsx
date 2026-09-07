import React from "react";
import Banner from "./Banner";
import HowItWorks from "./HowItWorks";
import OurServices from "./OurServices";
import Brands from "./Brands";
import WhyUs from "./WhyUs";
import BeAMerchant from "./BeAMerchant";
import CustomerReviews from "./CustomerReviews";
import FAQ from "./FAQ";


const Home = () => {
  return (
    <div>
      <Banner />
      <HowItWorks/>
      <OurServices/>
      <Brands/>
      <WhyUs/>
      <BeAMerchant/>
      <CustomerReviews/>
      <FAQ></FAQ>
    </div>
  );
}; 

export default Home;
