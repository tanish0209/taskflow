"use client";
import Navbar from "@/components/Navbar";
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
        <div className="my-15 mx-15 bg-orange-400 px-5 py-20  rounded-4xl">
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
