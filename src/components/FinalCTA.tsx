import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { bookingConfig } from "@/lib/heroConfig";

const FinalCTA = () => {
  const prefersReducedMotion = useReducedMotion();

  const handleBookDemo = () => {
    if (!bookingConfig.url) {
      if (import.meta.env.DEV) {
        console.warn(
          `[FinalCTA] bookingConfig.url is not set — add the ${bookingConfig.provider} scheduling link in src/lib/heroConfig.ts.`,
        );
      }
      return;
    }
    window.open(bookingConfig.url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-24 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600" />

      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Animated shapes */}
      <motion.div
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-white/[0.06] rounded-full blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-white/[0.06] rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-10 tracking-tight leading-tight">
            Ready to make technical hiring make sense again?
          </h2>

          <Button
            onClick={handleBookDemo}
            size="lg"
            className="h-14 px-10 text-base bg-white text-cyan-600 hover:bg-white/90 shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-xl font-semibold"
          >
            Book a Demo
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
