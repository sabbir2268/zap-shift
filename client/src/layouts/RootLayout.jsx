import React from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="mx-5 lg:mx-10 pb-10">
      <section className="py-3 lg:py-5">
        <Navbar></Navbar>
      </section>
      <Outlet></Outlet>
      <Footer></Footer>
    </div>
  );
};

export default RootLayout;
