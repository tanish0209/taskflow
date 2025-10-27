"use client";
import Navbar from "@/components/Navbar";
import {
  ChartNoAxesCombined,
  Handshake,
  Network,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function LandingPage() {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        className="min-h-screen flex items-center justify-center bg-gray-50 px-6 sm:px-10 md:px-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 max-w-7xl w-full">
          <div className="flex flex-col gap-4 text-center lg:text-left">
            <h6 className="text-orange-600 text-base sm:text-lg opacity-80">
              Streamline smarter. Achieve faster
            </h6>
            <h3 className="text-black font-bold text-4xl sm:text-5xl md:text-6xl leading-tight">
              Elevate Your <br className="hidden sm:block" /> Projects With
              Precision.
            </h3>
            <h6 className="mt-3 text-orange-600 text-base sm:text-lg opacity-80">
              A modern platform that simplifies tasks, boosts focus, and drives
              results.
            </h6>
            <button
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="self-center lg:self-start px-5 py-3 mt-4 rounded-full bg-linear-to-r from-orange-500 to-orange-700 text-white text-sm sm:text-base hover:from-orange-600 hover:to-orange-800 transition duration-300"
            >
              Learn More
            </button>
          </div>

          <div className="flex justify-center bg-orange-400 py-4 rounded-2xl">
            <Image
              src="/creative-team-isometric-illustration.png"
              alt="Creative Team Illustration"
              width={400}
              height={400}
              className="w-64 sm:w-80 md:w-96 lg:w-[400px] h-auto"
            />
          </div>
        </div>
      </section>

      {/* ---------- ABOUT SECTION ---------- */}
      <section
        id="about"
        className="min-h-screen flex items-center justify-center bg-white px-6 sm:px-10 md:px-20 py-6"
      >
        <div className="w-full max-w-7xl bg-orange-400 rounded-3xl p-6 sm:p-10 md:p-16">
          <h4 className="text-orange-800 text-base sm:text-lg mb-4">
            See Taskflow in Action
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-6">
            <p className="text-black font-bold text-2xl sm:text-3xl md:text-3xl leading-snug">
              Empowering Teams to Stay Organized & Achieve More – Effortlessly
            </p>
            <p className="hidden md:block text-base text-orange-800">
              From smart task management to streamlined project tracking,
              Taskflow helps your team stay productive and aligned at every
              step. Watch how we simplify work and boost efficiency.
            </p>
          </div>
          <hr className="border-t border-orange-800 my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Feature
              icon={<Network className="size-10 text-orange-800" />}
              title="Seamless Workflow Orchestration"
              desc="Design and manage your team workflow from start to finish. TaskFlow keeps every process connected, ensuring smooth task transitions & project flow."
            />
            <Feature
              icon={<Settings className="size-10 text-orange-800" />}
              title="Quick Setup, Zero Hassle"
              desc="Get started in minutes - no complex onboarding or configuration. Create projects, invite teammates, and start collaborating instantly."
            />
            <Feature
              icon={<Handshake className="size-10 text-orange-800" />}
              title="Effortless Team Collaboration"
              desc="Bring your team together with shared workspaces, live task updates, and transparent progress tracking - keeping everyone aligned and productive."
            />
            <Feature
              icon={<ChartNoAxesCombined className="size-10 text-orange-800" />}
              title="Organized, Scalable Productivity"
              desc="Whether it’s a small team or a large project, TaskFlow adapts to your workflow - helping you scale operations while staying organized and efficient."
            />
          </div>
        </div>
      </section>

      {/* ---------- CONTACT SECTION ---------- */}
      <section id="contact" className="flex flex-col md:flex-row min-h-screen">
        {/* Left side */}
        <div className="bg-orange-500 text-white flex flex-col justify-center items-center w-full md:w-1/2 px-6 sm:px-10 py-16 relative overflow-hidden text-center md:text-left">
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
        </div>

        {/* Right side form */}
        <div className="bg-gray-50 w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-12 sm:py-16">
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
        </div>
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

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 sm:p-6 bg-orange-300/20 rounded-xl">
      <div className="shrink-0">{icon}</div>
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-black">
          {title}
        </h2>
        <h5 className="hidden md:block text-sm text-orange-800 mt-1">{desc}</h5>
      </div>
    </div>
  );
}
