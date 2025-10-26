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
      <section
        id="home"
        className="h-screen flex items-center justify-center bg-gray-50"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex items-center px-20">
            <div>
              <h6 className="text-orange-600 text-lg opacity-80 mb-5">
                Streamline smarter. Achieve faster
              </h6>
              <h3 className="text-black font-bold text-5xl">
                Elevate Your <br />
                Projects With Precision.
              </h3>
              <h6 className="mt-5 text-orange-600 text-lg opacity-80">
                A modern platform that simplifies tasks, boosts focus, and
                drives results.
              </h6>
              <button
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-3 py-2 mt-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 text-white hover:from-orange-600 hover:to-orange-800 transition duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="flex place-self-center justify-center bg-orange-400 py-10 px-15 rounded-4xl">
            <Image
              src="/creative-team-isometric-illustration.png"
              alt="Creative Team Illustration"
              width={400}
              height={400}
            />
          </div>
        </div>
      </section>
      <section
        id="about"
        className="h-screen flex items-center justify-center bg-white"
      >
        <div className="my-15 mx-15 bg-orange-400 px-5 py-15 rounded-4xl">
          <h4 className="text-orange-800 text-lg">See Taskflow in Action</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <p className="text-black font-bold text-4xl">
              Empowering Teams to Stay Organized & Achieve More – Effortlessly
            </p>
            <p className="text-lg text-orange-800">
              From smart task management to streamlined project tracking,
              Taskflow helps your team stay productive and aligned at every
              step. Watch how we simplify work and boost efficiency.
            </p>
          </div>
          <hr className="border-t border-orange-800 my-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <Feature
              icon={<Network className="size-10 scale-150 text-orange-800" />}
              title="Seamless Workflow Orchestration"
              desc="Design and manage your team workflow from start to finish. TaskFlow keeps every process connected, ensuring smooth task transitions & project flow."
            />
            <Feature
              icon={<Settings className="size-10 scale-150 text-orange-800" />}
              title="Quick Setup, Zero Hassle"
              desc="Get started in minutes - no complex onboarding or configuration. Create projects, invite teammates, and start collaborating instantly."
            />
            <Feature
              icon={<Handshake className="size-10 scale-150 text-orange-800" />}
              title="Effortless Team Collaboration"
              desc="Bring your team together with shared workspaces, live task updates, and transparent progress tracking - keeping everyone aligned and productive."
            />
            <Feature
              icon={
                <ChartNoAxesCombined className="size-10 scale-150 text-orange-800" />
              }
              title="Organized, Scalable Productivity"
              desc="Whether it’s a small team or a large project, TaskFlow adapts to your workflow - helping you scale operations while staying organized and efficient."
            />
          </div>
        </div>
      </section>
      <section id="contact" className="flex flex-col md:flex-row min-h-screen">
        <div className="bg-orange-500 text-white flex flex-col justify-center items-center w-full md:w-1/2 px-10 py-16 relative overflow-hidden">
          <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full border border-white/60"></div>
          <div className="absolute top-10 left-10 w-80 h-80 rounded-full border-dashed border-2 border-white/60"></div>
          <div className="absolute -right-32 top-1/2 w-64 h-64 rounded-full border border-white/60"></div>
          <div className="relative text-center z-10">
            <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-4">
              We’d love to hear from you
            </h2>
            <p className="text-lg opacity-90">
              Have a question or suggestion? Reach out and we’ll get back to you
              soon.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-16">
          <h3 className="text-3xl font-semibold text-gray-800 mb-8">
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
              className="mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all duration-200 disabled:opacity-50"
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
            <p className="mt-4 text-green-600 font-semibold">
              ✅ Thank you! Your message has been sent.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-red-600 font-semibold">
              ❌ Something went wrong. Please try again.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

// Input subcomponent for clean form UI
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
        className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-orange-500 py-1"
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
    <div className="flex gap-6 p-8">
      {icon}
      <div>
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        <h5 className="text-md font-medium text-orange-800">{desc}</h5>
      </div>
    </div>
  );
}
