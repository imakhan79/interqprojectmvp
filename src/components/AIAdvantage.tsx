import { motion } from "framer-motion";
import { Brain, Calendar, ShieldCheck, UserCheck, FileText, Layers } from "lucide-react";

const advantages = [
  {
    icon: Brain,
    title: "AI-Powered Skills Assessments",
    description: "Evaluate actual abilities, not just CV claims, with adaptive AI testing.",
  },
  {
    icon: Calendar,
    title: "Automated Scheduling",
    description: "No more back-and-forth emails. Seamlessly sync calendars.",
  },
  {
    icon: UserCheck,
    title: "Bias Mitigation",
    description: "Reduce unconscious bias by up to 25% in screening with standardized metrics.",
  },
  {
    icon: ShieldCheck,
    title: "Fraud Detection",
    description: "Prevent impersonation or unfair practices with advanced proctoring.",
  },
  {
    icon: FileText,
    title: "Comprehensive Profiles",
    description: "View skills, communication, and culture fit together in one report.",
  },
  {
    icon: Layers,
    title: "Seamless Integration",
    description: "Connect easily with your existing ATS and HR tools for a unified workflow.",
  },
];

const AIAdvantage = () => {
  return (
    <section className="py-24 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5">
            Why InterQ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-slate-900">
            AI does the heavy lifting.{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Humans make the call.</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Here's the thing about AI-powered hiring tools: efficiency is easy. Judgment is hard. So InterQ uses
            AI to streamline assessments and surface the signals that matter — then hands things off to real,
            experienced technical interviewers who know how to tell the difference between someone who memorized
            the answer and someone who actually understands it. Faster where speed helps. Human where it counts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 p-7 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-cyan-100 group-hover:scale-105">
                <adv.icon className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-bold mb-2.5 text-slate-900 group-hover:text-cyan-600 transition-colors duration-300">{adv.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {adv.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIAdvantage;
