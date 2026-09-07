import React from "react";
import Logo from "../logo/Logo";

const Footer = () => {
  const links = [
    "Services",
    "Coverage",
    "About Us",
    "Pricing",
    "Blog",
    "Contact",
  ];

  return (
    <footer className="w-full bg-[var(--text)] text-[var(--primary)] rounded-2xl ">
      <div className="max-w-4xl mx-auto px-6 py-14 md:py-16">

        {/* Logo */}
        <div className="flex justify-center items-center">
          <Logo />
        </div>

        {/* Description */}
        <p className="w-full max-w-2xl mx-auto mt-5 text-center text-sm md:text-base leading-7 text-[var(--primary)]/70">
          Enjoy fast, reliable parcel delivery with real-time tracking and
          zero hassle. From personal packages to business shipments — we
          deliver on time, every time.
        </p>

        {/* Navigation */}
        <nav className="mt-8">
          <ul className="flex flex-wrap justify-center items-center gap-x-7 gap-y-4">
            {links.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="
                    block
                    text-center
                    text-sm md:text-base
                    text-[var(--primary)]/80
                    hover:text-[var(--secondary)]
                    transition-colors
                    duration-300
                  "
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="w-full border-t border-[var(--primary)]/15 mt-10"></div>

        {/* Copyright */}
        <div className="flex justify-center items-center mt-7 text-center">
          <p className="text-sm text-[var(--primary)]/50">
            © {new Date().getFullYear()} Profast Courier. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;