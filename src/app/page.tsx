"use client";
import Navbar from "@/components/Navbar";
import {
  ChartNoAxesCombined,
  Handshake,
  Network,
  Settings,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
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
                className="bg-orange-500 text-white px-4 py-2 rounded-full mt-4 hover:scale-105 duration-200"
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
        <div className="my-15 mx-15 bg-orange-400 px-5 py-15  rounded-4xl">
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
            <div className="flex gap-6 p-8">
              <Network className=" size-10 scale-150 text-orange-800" />
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Seamless Workflow Orchestration
                </h2>
                <h5 className="text-md font-medium text-orange-800">
                  Design and manage your team's workflow from start to finish.
                  TaskFlow keeps every process connected, ensuring smooth task
                  transitions & project flow.
                </h5>
              </div>
            </div>
            <div className="flex gap-6 p-8">
              <Settings className=" size-10 scale-150 text-orange-800" />
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Quick Setup, Zero Hassle
                </h2>
                <h5 className="text-md font-medium text-orange-800">
                  Get started in minutes - no complex onboarding or
                  configuration. Create projects, invite teammates, and start
                  collaborating instantly.
                </h5>
              </div>
            </div>
            <div className="flex gap-6 p-8">
              <Handshake className=" size-10 scale-150 text-orange-800" />
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Effortless Team Collaboration
                </h2>
                <h5 className="text-md font-medium text-orange-800">
                  Bring your team together with shared workspaces, live task
                  updates, and transparent progress tracking - keeping everyone
                  aligned and productive.
                </h5>
              </div>
            </div>
            <div className="flex gap-6 p-8">
              <ChartNoAxesCombined className=" size-10 scale-150 text-orange-800" />
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Organized, Scalable Productivity
                </h2>
                <h5 className="text-md font-medium text-orange-800">
                  Whether it’s a small team or a large project, TaskFlow adapts
                  to your workflow - helping you scale operations while staying
                  organized and efficient.
                </h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="h-screen flex items-center justify-center bg-gray-200"
      >
        <h2 className="text-3xl font-semibold">Contact Us</h2>
      </section>
    </main>
  );
}
