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
    <header className="fixed top-0 left-0 w-full z-50 bg-white bg-opacity-95 shadow-md border-b border-orange-500">
      <div className="flex justify-between items-center px-6 md:px-12 py-4">
        <div className="flex cursor-pointer">
          <h1 className="text-3xl font-bold text-black">Taskflow</h1>
          <h1 className="text-3xl font-bold text-orange-700">.</h1>
        </div>

        <nav className="hidden md:flex space-x-8 items-center">
          <button
            onClick={() => scrollToSection("home")}
            className="text-gray-600 hover:text-orange-700 text-lg duration-300"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-600 hover:text-orange-700 text-lg duration-300"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-600 hover:text-orange-700 text-lg duration-300"
          >
            Contact
          </button>
        </nav>

        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="/login"
            className="text-gray-700 hover:text-orange-700 duration-300"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 rounded-full bg-linear-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 transition duration-300"
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden text-gray-700 focus:outline-none transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white bg-opacity-95 shadow-md flex flex-col items-center space-y-4 py-6 transition-all duration-600">
          <button
            onClick={() => scrollToSection("home")}
            className="text-gray-700 hover:text-orange-700 text-lg"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="text-gray-700 hover:text-orange-700 text-lg"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-700 hover:text-orange-700 text-lg"
          >
            Contact
          </button>

          <div className="w-full flex flex-col items-center space-y-3 pt-4 border-t border-gray-200">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-gray-700 hover:text-orange-700 text-lg"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 rounded-full bg-linear-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 transition duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
