import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserSearch, ShieldAlert, DollarSign } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const problems = [
  {
    title: "Too many candidates",
    description: "Sorting the real contenders from the rest shouldn't eat your whole week.",
    icon: UserSearch,
  },
  {
    title: "Unreliable screening",
    description: "A resume can say a lot. It just can't prove someone can do the work.",
    icon: ShieldAlert,
  },
  {
    title: "Expensive interviews",
    description: "Every hour your engineers spend interviewing the wrong person is an hour they're not building.",
    icon: DollarSign,
  },
];

const ProblemSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5"
          >
            The Reality
          </motion.span>

          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-extrabold mb-5 text-slate-900">
            Technical hiring shouldn't feel like guesswork.
          </motion.h2>

          <motion.p variants={itemVariants} className="text-slate-600 text-lg leading-relaxed">
            You've seen it happen. A CV that reads like a dream hire. An interview that falls apart the second
            things get technical. Or worse — you make the offer, and three months in, you're back to square one.
          </motion.p>

          <motion.p variants={itemVariants} className="text-slate-900 text-lg font-semibold mt-4">
            Here's why that keeps happening:
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, index) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.3 + index * 0.15,
                duration: prefersReducedMotion ? 0.2 : 0.6,
                ease: "easeOut",
              }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={prefersReducedMotion ? undefined : { y: -6 }}
            >
              <Card className="h-full border-slate-200 overflow-hidden group transition-all duration-300 hover:shadow-lg bg-white">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-cyan-100 group-hover:scale-105">
                    <p.icon className="w-7 h-7 text-cyan-600" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 leading-relaxed">{p.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
