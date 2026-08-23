import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { bookingConfig, heroStats } from "@/lib/heroConfig";
import HeroProductPreview from "./HeroProductPreview";

const benefits = [
  "Cut the hours your engineers waste interviewing candidates who were never going to make it",
  "Get a real read on technical skill, across 50+ domains",
  "Walk away with a detailed report in 24 hours — not two weeks",
];

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.5, ease: "easeOut" as const },
    },
  };

  const handleBookDemo = () => {
    if (!bookingConfig.url) {
      if (import.meta.env.DEV) {
        console.warn(
          `[HeroSection] bookingConfig.url is not set — add the ${bookingConfig.provider} scheduling link in src/lib/heroConfig.ts.`,
        );
      }
      return;
    }
    window.open(bookingConfig.url, "_blank", "noopener,noreferrer");
  };

  const handleScrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Radial gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-cyan-500/15 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-600/10 to-transparent blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent blur-[120px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Subtle glow lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      <div className="container-width relative z-10 px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-7 text-center lg:text-left items-center lg:items-start max-w-2xl mx-auto lg:mx-0"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide text-cyan-200">
                  AI-Powered Technical Hiring
                </span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              id="hero-heading"
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-black leading-[1.08] tracking-tight text-white"
            >
              Hire technical talent{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  with confidence.
                </span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 opacity-30" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0,8 Q50,0 100,8 T200,8" stroke="url(#gradient)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee"/>
                      <stop offset="100%" stopColor="#3b82f6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Let's be honest — a CV can't tell you who can actually do the job. InterQ pairs
              AI-powered assessments with real, expert-led interviews, so you're not guessing.
              You're deciding, with the full picture in front of you.
            </motion.p>

            {/* Benefits List */}
            <motion.ul
              variants={itemVariants}
              className="flex flex-col gap-3 text-sm sm:text-base w-full max-w-xl mx-auto lg:mx-0"
            >
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-white" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-white text-left">{benefit}</span>
                </li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 pt-2 pb-12 sm:pb-0 w-full sm:w-auto"
            >
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto"
              >
                <Button
                  onClick={handleBookDemo}
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 text-base font-bold rounded-xl shadow-xl shadow-cyan-500/25 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-cyan-500/40 transition-shadow duration-200"
                >
                  Book a Demo
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleScrollToHowItWorks}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 hover:border-white/30 hover:text-white transition-colors duration-200"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" aria-hidden="true" />
                  See How It Works
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Statistics — only shown once verified by the client (see src/lib/heroConfig.ts) */}
            {heroStats.length > 0 && (
              <motion.div variants={itemVariants} className="pt-2 w-full">
                <ul className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  {heroStats.map((stat) => (
                    <li
                      key={stat.label}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
                    >
                      <span className="text-sm font-bold text-white">{stat.value}</span>
                      <span className="text-sm font-medium text-slate-300">{stat.label}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          {/* Right Content - Product Visualization */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.3 : 0.8,
              delay: prefersReducedMotion ? 0 : 0.3,
              ease: "easeOut",
            }}
            className="relative w-full hidden lg:flex justify-center lg:justify-end items-center"
          >
            <HeroProductPreview />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
};

export default HeroSection;
