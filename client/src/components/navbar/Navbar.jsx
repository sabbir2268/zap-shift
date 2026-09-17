import React, { useEffect, useRef, useState } from "react";
import { Menu, X, User, ArrowUpRight } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "./../../hooks/useAuth";
import { LoginButton, RegisterButton, LogoutButton } from "../Buttons/Buttons";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile navigation
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        (!mobileDropdownRef.current ||
          !mobileDropdownRef.current.contains(event.target))
      ) {
        setIsMenuOpen(false);
      }

      // Close user dropdown
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const links = [
    { path: "/service", title: "Service" },
    { path: "/coverage", title: "Coverage" },
    { path: "/be_a_rider", title: "Be a Rider" },
  ];

  return (
    <nav className="relative w-full bg-[var(--primary)] text-[var(--text)] shadow-sm rounded-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* ================= NAVBAR ================= */}
        <div className="h-16 flex items-center justify-between">
          {/* ================= LEFT ================= */}
          <div ref={mobileMenuRef} className="relative flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                lg:hidden
                p-2
                rounded-lg
                text-[var(--text)]
                hover:text-[var(--secondary)]
                hover:bg-[var(--foreground)]
                transition-all
                duration-200
              "
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo + Name */}
            <NavLink to="/" className="relative flex items-center group">
              <img src={logo} alt="Logo" className="w-9 h-9" />

              <span
                className="
                  absolute
                  left-6
                  top-3
                  text-xl
                  font-bold
                  text-[var(--text)]
                  group-hover:text-[var(--foreground)]
                  transition-colors
                  duration-200
                "
              >
                ZapShift
              </span>
            </NavLink>
          </div>

          {/* ================= CENTER ================= */}
          <div className="hidden lg:flex items-center">
            <ul className="flex items-center gap-2">
              {links.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `
                      px-4
                      py-2
                      rounded-lg
                      font-medium
                      text-[var(--text)]
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? `
                            text-white
                            bg-[var(--foreground)]
                          `
                          : `
                            hover:text-[var(--secondary)]
                            hover:bg-[var(--foreground)]
                          `
                      }
                      `
                    }
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex items-center">
            {/* Desktop Login/Register/User */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <LogoutButton />

                  <Link
                    to="/dashboard/profile"
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-black
                      text-white
                      flex
                      items-center
                      justify-center
                      hover:bg-[var(--secondary)]
                      hover:text-black
                      transition-all
                      duration-200
                    "
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  <LoginButton />
                  <RegisterButton />
                </>
              )}
            </div>

            {/* Mobile User + Arrow */}
            <div className="lg:hidden flex items-center gap-2">
              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsMenuOpen(false);
                  }}
                  className="
                      p-2
                      rounded-lg
                      text-[var(--text)]
                      hover:text-[var(--secondary)]
                      hover:bg-[var(--foreground)]
                      transition-all
                      duration-200
                    "
                >
                  <User className="w-6 h-6" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="
                        absolute
                        right-0
                        top-10
                        z-50
                        w-56
                        p-2
                        bg-[var(--card)]
                        rounded-xl
                        shadow-xl
                        border
                        border-[var(--border)]
                      "
                  >
                    <div className="flex flex-col gap-1">
                      {user ? (
                        <LogoutButton />
                      ) : (
                        <>
                          <LoginButton />
                          <RegisterButton />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow Button */}
              {user && (
                <Link
                  to="/dashboard/profile"
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-black
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-[var(--secondary)]
                    hover:text-black
                    transition-all
                    duration-200
                  "
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {isMenuOpen && (
          <div
            ref={mobileDropdownRef}
            className="
              lg:hidden
              absolute
              left-4
              top-16
              z-50
              w-48
              p-2
              bg-[var(--card)]
              rounded-xl
              shadow-xl
              border
              border-[var(--border)]
            "
          >
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `
                      px-4
                      py-3
                      rounded-lg
                      font-medium
                      text-[var(--text)]
                      transition-all
                      duration-200
                      block

                      ${
                        isActive
                          ? `
                            text-white
                            bg-[var(--foreground)]
                          `
                          : `
                            hover:text-[var(--secondary)]
                            hover:bg-[var(--foreground)]
                          `
                      }
                      `
                    }
                  >
                    {link.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
