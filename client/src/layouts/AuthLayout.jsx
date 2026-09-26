import React from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

const AuthLayout = () => {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="flex w-full flex-1 flex-col">
        <Link
          to="/"
          className="flex w-fit shrink-0 items-center gap-3 px-6 py-4 font-extrabold sm:px-8"
        >
          <img src={logo} alt="Logo" className="h-9 w-auto sm:h-12" />
          <span className="text-xl sm:text-2xl">ZapShift</span>
        </Link>
        <div className="flex flex-1 items-stretch justify-center">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
