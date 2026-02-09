"use client";
import Navbar from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
/* ---------- ANIMATION VARIANTS ---------- */

import { Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function LandingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const AboutCards = [
    {
      id: 1,
      image: "/workflow.png",
      title: "Seamless Workflow Orchestration",
      desc: "Design and manage your team workflow from start to finish. TaskFlow keeps every process connected, ensuring smooth task transitions & project flow.",
    },
    {
      id: 2,
      image: "/setup.png",
      title: "Quick Setup, Zero Hassle",
      desc: "Get started in minutes - no complex onboarding or configuration. Create projects, invite teammates, and start collaborating instantly.",
    },
    {
      id: 3,
      image: "/collab.png",
      title: "Effortless Team Collaboration",
      desc: "Design and manage your team workflow from start to finish. TaskFlow keeps every process connected, ensuring smooth task transitions & project flow.",
    },
    {
      id: 4,
      image: "/productivity.png",
      title: "Organized, Scalable Productivity",
      desc: "Whether it’s a small team or a large project, TaskFlow adapts to your workflow - helping you scale operations while staying organized and efficient.",
    },
  ];

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
    <main>
      <Navbar />

      {/* ---------- HERO SECTION ---------- */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center bg-white px-6 sm:px-10 "
      >
        <div className="mx-1 my-4 w-full rounded-2xl bg-linear-to-b from-amber-100 via-orange-200 to-orange-300">
          <div className=" items-center p-20 pt-40 w-full">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="mb-10 text-center"
            >
              <motion.h3
                variants={fadeUp}
                className="text-black font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-6"
              >
                Elevate your <br className="hidden sm:block" /> projects with
                precision.
              </motion.h3>

              <motion.h6
                variants={fadeUp}
                className="mt-3 text-orange-600 text-base sm:text-lg opacity-80"
              >
                A modern platform that simplifies tasks, boosts focus, and
                drives results.
              </motion.h6>

              <motion.h6
                variants={fadeUp}
                className="text-orange-600 text-base sm:text-lg opacity-80"
              >
                Streamline smarter. Achieve faster
              </motion.h6>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.8 }}
              className="flex justify-center bg-white/40 border place-self-center border-white/60 max-w-7xl shadow-xl shadow-orange-500 p-4 rounded-4xl"
            >
              <Image
                src="/dashboard-mock.png"
                alt="Creative Team Illustration"
                width={1400}
                height={1400}
                className="w-64 sm:w-80 md:w-96 lg:w-450 rounded-3xl h-auto"
              />
            </motion.div>
            <div className="flex justify-center items-center mt-5">
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex gap-4 self-center px-5 py-4 mt-4 rounded-2xl bg-linear-to-r from-orange-500 to-orange-700 text-white text-sm sm:text-base hover:from-orange-600 hover:to-orange-800 transition duration-300"
              >
                Learn More
                <ArrowUpRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ABOUT SECTION ---------- */}
      <section
        id="about"
        className="min-h-screen flex items-center justify-center bg-white px-6 sm:px-10 md:px-20 py-12"
      >
        <div className="w-full rounded-3xl p-6 sm:p-10 md:p-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0 }}
            className="text-center mb-10"
          >
            <h4 className="text-orange-800 text-sm sm:text-base mb-3">
              See Taskflow in Action
            </h4>

            <div className="grid grid-cols-1 gap-6">
              <h2 className="text-black font-bold text-2xl sm:text-3xl md:text-4xl leading-snug">
                Empowering Teams to Stay Organized & Achieve More — Effortlessly
              </h2>

              <p className="hidden md:block text-orange-800 text-base leading-relaxed">
                From smart task management to streamlined project tracking,
                Taskflow helps your team stay productive and aligned at every
                step.
              </p>
            </div>
          </motion.div>

          <hr className="border-orange-800/40 mb-10" />

          {/* Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl place-self-center"
          >
            {AboutCards.map((card) => (
              <motion.div
                key={card.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="grid grid-rows-[2fr_1fr] bg-orange-50/40 rounded-2xl p-5 max-w-120 shadow-lg shadow-orange-100"
              >
                {/* Image */}
                <div className=" flex items-center justify-center rounded-xl p-4">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={500}
                    height={400}
                    className="w-full max-w-[18rem] h-auto"
                  />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-black font-semibold text-lg sm:text-xl mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base text-justify text-gray-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------- CONTACT SECTION ---------- */}
      <section
        id="contact"
        className="flex flex-col m-4 md:flex-row min-h-screen"
      >
        {/* Left side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="bg-orange-500 text-white flex flex-col justify-center items-center w-full md:w-1/3 rounded-4xl mr-4 px-6 sm:px-10 py-16 relative overflow-hidden"
        >
          <div className="absolute -left-24 -bottom-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full border border-white/60"></div>
          <div className="absolute top-10 left-10 w-60 sm:w-80 h-60 sm:h-80 rounded-full border-dashed border-2 border-white/60"></div>
          <div className="absolute -right-20 md:-right-32 top-1/2 w-48 sm:w-64 h-48 sm:h-64 rounded-full border border-white/60"></div>
          <div className="relative z-10 px-4 sm:px-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4">
              We’d love to hear from you
            </h2>
            <p className="text-base sm:text-lg opacity-90">
              Have a question or suggestion? Reach out and we’ll get back to you
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
          className="bg-orange-50 w-full md:w-2/3 rounded-4xl flex flex-col justify-center px-6 sm:px-10 md:px-16 py-12 sm:py-16"
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
    </main>
  );
}

/* ---------- SUBCOMPONENTS ---------- */
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
