"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center">
      <div className="w-[95%] max-w-6xl bg-white/80 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200">
        <div className="flex justify-between items-center px-6 md:px-10 py-4">
          {/* Logo */}
          <div className="flex cursor-pointer">
            <h1 className="text-2xl font-bold text-black">Taskflow</h1>
            <h1 className="text-2xl font-bold text-orange-600">.</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {["home", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-gray-600 hover:text-orange-600 text-sm font-medium transition"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/login"
              className="text-gray-700 hover:text-orange-600 text-sm"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 px-6 py-4 space-y-4">
            {["home", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left text-gray-700 hover:text-orange-600"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}

            <div className="pt-4 space-y-3">
              <Link href="/login" className="block text-gray-700">
                Login
              </Link>
              <Link
                href="/register"
                className="block text-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
