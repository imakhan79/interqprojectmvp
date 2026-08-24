import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const benefits = [
  "Spend less time interviewing candidates who were never going to work out",
  "Spot real technical ability earlier — before it costs you a bad hire",
  "Run a consistent process, every time, for every role",
  "Scale your hiring without scaling your engineers' calendars",
];

const BenefitsSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center"
        >
          <div className="text-center lg:text-left">
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5"
            >
              The Payoff
            </motion.span>

            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight"
            >
              Hire better. Hire faster. Hire like you mean it.
            </motion.h2>
          </div>

          <ul className="flex flex-col">
            {benefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                variants={itemVariants}
                whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                className={`flex items-start gap-4 py-6 group ${
                  index !== 0 ? "border-t border-slate-200" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg md:text-xl font-semibold text-slate-900 leading-snug pt-1">
                  {benefit}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
