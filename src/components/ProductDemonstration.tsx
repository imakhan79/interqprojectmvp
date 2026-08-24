import React from "react";
import { ImageIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ProductDemonstration: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 md:py-28 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl relative z-10">
        <motion.p
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.5, ease: "easeOut" }}
          className="text-center text-2xl md:text-3xl font-bold text-slate-900 mb-10"
        >
          See what your hiring team sees.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: "easeOut", delay: prefersReducedMotion ? 0 : 0.1 }}
          className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white"
        >
          {/* App chrome bar */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-5 py-3" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>

          {/* Placeholder — replace with the real InterQ product screenshot or video */}
          <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-cyan-600" aria-hidden="true" />
            </div>
            <p className="font-semibold text-slate-700">Real InterQ product screenshot or video goes here</p>
            <p className="text-sm text-slate-500 max-w-md">
              Awaiting an authentic screenshot or short recording of the InterQ dashboard or evaluation report
              from the design team — no stock imagery.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDemonstration;
