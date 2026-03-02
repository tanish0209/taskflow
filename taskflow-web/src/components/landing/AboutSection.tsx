"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";

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
    desc: "Whether it's a small team or a large project, TaskFlow adapts to your workflow - helping you scale operations while staying organized and efficient.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-12"
    >
      <div className="w-full rounded-3xl p-4 sm:p-6 md:p-10 lg:p-16">
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
            <h2 className="text-black font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug">
              Empowering Teams to Stay Organized & Achieve More — Effortlessly
            </h2>

            <p className="text-orange-800 text-sm sm:text-base leading-relaxed">
              From smart task management to streamlined project tracking,
              Taskflow helps your team stay productive and aligned at every
              step.
            </p>
          </div>
        </motion.div>

        <hr className="border-orange-800/40 mb-6 sm:mb-10" />

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto"
        >
          {AboutCards.map((card) => (
            <motion.div
              key={card.id}
              variants={fadeUp}
              whileHover={{ scale: 1.05, y: -6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="grid grid-rows-[auto_auto] sm:grid-rows-[2fr_1fr] bg-orange-50/40 rounded-2xl p-4 sm:p-5 shadow-lg shadow-orange-100"
            >
              {/* Image */}
              <div className="flex items-center justify-center rounded-xl p-2 sm:p-4">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={500}
                  height={400}
                  className="w-full max-w-[14rem] sm:max-w-[18rem] h-auto"
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
  );
}
