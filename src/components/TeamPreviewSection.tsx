import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const team = [
  { name: "Saima Huma", role: "CEO & Founder", image: "/saima-huma-ceo.png" },
  { name: "Sohana Akter", role: "Chief Operating Officer", image: "/sohana-akter.png" },
  { name: "Muhammad Jalal", role: "Chief Information Officer", image: "/muhammad-jalal.png" },
  { name: "Abdul Qadir", role: "Director of Marketing & Tech", image: "/abdul-qadir.png" },
  { name: "Atikur Rahman", role: "Director of Operations", image: "/atikur-rahman.png" },
];

const TeamPreviewSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5"
          >
            <Sparkles className="w-3 h-3" aria-hidden="true" />
            The People Behind InterQ
          </motion.span>

          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5">
            Built by technical experts who understand hiring.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-slate-600 text-lg leading-relaxed">
            Meet the people combining technical expertise, recruitment insight, and AI to make technical hiring
            make sense again.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 mb-12"
        >
          {team.map((member) => (
            <motion.div key={member.name} variants={itemVariants} className="flex flex-col items-center w-28 text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-[3px] ring-cyan-500/20 ring-offset-2 ring-offset-white shadow-sm mb-3">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
              <p className="text-xs text-slate-500 leading-snug mt-0.5">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-cyan-600 font-semibold hover:text-cyan-700 transition-colors duration-200 group"
          >
            Meet Our Team
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamPreviewSection;
