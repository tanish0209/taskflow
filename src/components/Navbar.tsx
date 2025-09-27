"use client";

import Link from "next/link";
import React from "react";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="flex justify-around items-center px-8 py-4 border-b border-b-orange-500 bg-white shadow-md fixed top-0 w-full z-50 bg-opacity-95">
      <div className="flex cursor-pointer">
        <h1 className="text-3xl font-bold text-black">Taskflow</h1>
        <h1 className="text-3xl font-bold text-orange-700">.</h1>
      </div>
      <nav className="space-x-15">
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
      <nav className="space-x-6">
        <Link
          href="/login"
          className="text-gray-700 hover:text-orange-700 duration-300"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white  hover:bg-gradient-to-r hover:from-orange-600 hover:to-orange-800 transition duration-300"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
