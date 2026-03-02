"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

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

export default function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-10"
    >
      <div className="mx-1 my-4 w-full rounded-2xl overflow-hidden bg-linear-to-b from-amber-100 via-orange-200 to-orange-300">
        <div className="items-center px-4 py-10 pt-24 sm:px-8 sm:py-14 sm:pt-28 md:px-12 md:py-16 md:pt-32 lg:p-20 lg:pt-40 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mb-10 text-center"
          >
            <motion.h3
              variants={fadeUp}
              className="text-black font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-6"
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
            className="flex justify-center bg-white/40 border place-self-center border-white/60 max-w-7xl shadow-lg sm:shadow-xl shadow-orange-500 p-2 sm:p-4 rounded-2xl sm:rounded-4xl"
          >
            <Image
              src="/dashboard-mock.png"
              alt="Creative Team Illustration"
              width={1400}
              height={1400}
              className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-3xl rounded-xl sm:rounded-3xl h-auto"
              priority
            />
          </motion.div>
          <div className="flex justify-center items-center mt-4 sm:mt-5">
            <button
              onClick={() =>
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex gap-3 sm:gap-4 self-center px-4 py-3 sm:px-5 sm:py-4 mt-3 sm:mt-4 rounded-xl sm:rounded-lg bg-linear-to-b from-orange-500 to-orange-700 text-white text-sm sm:text-base hover:from-orange-600 hover:to-orange-800 transition duration-300"
            >
              Learn More
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
