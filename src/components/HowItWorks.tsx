import React from "react";
import { FileText, Users, Calendar, Video, FileBarChart } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: FileText, title: "Post Role", description: "Tell us what you need. We'll take it from there." },
  { icon: Users, title: "Candidate Invitations", description: "Qualified candidates, invited automatically." },
  { icon: Calendar, title: "Automated Scheduling", description: "No more email chains just to book a call." },
  { icon: Video, title: "Expert Interview", description: "A real technical expert, asking the right questions." },
  { icon: FileBarChart, title: "Detailed Report", description: "A clear answer, not a gut feeling, in your inbox within 24 hours." },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-28 bg-white relative overflow-hidden scroll-mt-24">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5">
            Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900">From job post to hire, without the black box.</h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2 z-0 hidden md:block" />
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-200 z-0 md:hidden" />

          <div className="space-y-14 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row gap-8 items-start md:items-center ${index % 2 === 0 ? "" : "md:flex-row-reverse"}`}
              >
                {/* Icon Bubble */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white ml-[9px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="text-sm">{index + 1}</span>
                </div>

                {/* Content Card */}
                <div className={`flex-1 pl-12 md:pl-0 ${index % 2 === 0 ? "md:text-right md:pr-14" : "md:text-left md:pl-14"}`}>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className={`flex items-center gap-3 mb-2.5 ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                      <step.icon className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
