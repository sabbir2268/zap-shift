import React from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

const AuthLayout = () => {
  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto flex min-h-screen flex-col">
        <Link
          to="/"
          className="w-fit flex items-end px-8 py-4 font-extrabold absolute"
        >
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h1 className="absolute left-14">ZapShift</h1>
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
