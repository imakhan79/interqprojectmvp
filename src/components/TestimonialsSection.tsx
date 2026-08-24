import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5">
            Social Proof
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Don't take our word for it.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto bg-white border border-dashed border-slate-300 p-10 rounded-2xl text-center"
        >
          <Quote className="w-8 h-8 text-cyan-500/40 mx-auto mb-4" aria-hidden="true" />
          <p className="font-semibold text-slate-700 mb-2">Real customer quotes and results go here</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Awaiting real customer quotes, numbers, or success stories from the client — nothing fabricated
            will be published in this space.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
