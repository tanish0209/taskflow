"use client";

import { useState } from "react";
import { motion } from "framer-motion";

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-orange-500 py-1 text-sm sm:text-base"
      />
    </div>
  );
}

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const res = await fetch("https://formspree.io/f/myznrqbl", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
      form.reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      className="flex flex-col m-4 md:flex-row min-h-[60vh] md:min-h-screen gap-4"
    >
      {/* Left side */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="bg-orange-500 text-white flex flex-col justify-center items-center w-full md:w-1/3 rounded-3xl md:rounded-4xl px-6 sm:px-10 py-10 sm:py-16 relative overflow-hidden"
      >
        <div className="absolute -left-24 -bottom-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-white/60"></div>
        <div className="absolute top-10 left-10 w-60 sm:w-80 h-60 sm:h-80 rounded-full border-dashed border-2 border-white/60"></div>
        <div className="absolute -right-20 md:-right-32 top-1/2 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-white/60"></div>
        <div className="relative z-10 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-semibold mb-3 sm:mb-4">
            We'd love to hear from you
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            Have a question or suggestion? Reach out and we'll get back to you
            soon.
          </p>
        </div>
      </motion.div>

      {/* Right side form */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: "easeOut", delay: 0.4 }}
        className="bg-orange-50 w-full md:w-2/3 rounded-3xl md:rounded-4xl flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16"
      >
        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 text-center md:text-left">
          Contact Us
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="FIRST NAME"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
            <Input
              label="LAST NAME"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="EMAIL"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            <Input
              label="PHONE NUMBER"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              MESSAGE
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message"
              rows={4}
              required
              className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-orange-500 py-1 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-4 inline-flex items-center justify-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all duration-200 disabled:opacity-50"
          >
            {status === "loading"
              ? "Sending..."
              : status === "success"
                ? "Message Sent ✓"
                : status === "error"
                  ? "Error! Try Again"
                  : "Submit →"}
          </button>
        </form>

        {status === "success" && (
          <p className="mt-4 text-green-600 font-semibold text-center md:text-left">
            ✅ Thank you! Your message has been sent.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-red-600 font-semibold text-center md:text-left">
            ❌ Something went wrong. Please try again.
          </p>
        )}
      </motion.div>
    </section>
  );
}
