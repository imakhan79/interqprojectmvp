import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, TrendingUp, Shield, CheckCircle2, Clock, Target, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatsSlideshow from "./StatsSlideshow";
import heroImg from "@/assets/hero-interview.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                </span>
                <span className="text-sm font-bold text-cyan-400 tracking-[0.15em]">AI-POWERED TECHNICAL HIRING</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] font-black leading-[1.08] tracking-tight text-white"
            >
              Hire technical talent{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  with confidence.
                </span>
                <svg className="absolute -bottom-1 left-0 w-full h-3 opacity-30" viewBox="0 0 200 12" preserveAspectRatio="none">
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

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Evaluate candidates through AI-powered assessments and expert-led technical interviews, so your hiring team can identify genuine technical ability before making a hiring decision.
            </motion.p>

            {/* Benefits List */}
            <motion.ul
              variants={itemVariants}
className="flex flex-col gap-3 text-sm sm:text-base text-glow-white w-full max-w-xl mx-auto lg:mx-0"
            >
              {[
                { text: "Reduce engineering time spent on unqualified candidates", highlight: false },
                { text: "Assess real technical ability across 50+ domains", highlight: false },
                { text: "Get detailed evaluation reports within 24 hours", highlight: false },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center mt-0.5 shrink-0 shadow-lg shadow-cyan-500/30 icon-glow-cyan">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium text-white text-glow-white">{item.text}</span>
                </li>
              ))}
            </motion.ul>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center gap-4 pt-2 pb-12 sm:pb-0 w-full sm:w-auto"
            >
              <Button
                onClick={() => navigate("/get-started")}
                size="lg"
                className="w-full sm:w-auto h-13 px-8 text-base font-bold rounded-xl shadow-xl shadow-cyan-500/25 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={() => navigate("/#how-it-works")}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/15 hover:border-white/30 hover:text-white transition-all duration-200"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="pt-2 w-full"
            >
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                {[
                  { icon: Clock, text: "40% faster hiring", color: "cyan" },
                  { icon: Users, text: "500+ teams", color: "blue" },
                  { icon: Target, text: "94% accuracy", color: "green" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      badge.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                      badge.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      <badge.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-white">{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative w-full hidden lg:flex justify-center lg:justify-end items-center"
          >
            <div className="relative w-full max-w-[540px] space-y-6">
              {/* Main Image Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/50 border border-white/10 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent z-10" />
                <img
                  src={heroImg}
                  alt="Professional technical interview session"
                  className="w-full h-[360px] object-cover"
                  loading="eager"
                />
                
                {/* Card Footer */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-slate-900 to-slate-900/80 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-white">Live Interview Analysis</p>
                      <p className="text-sm text-slate-400">Processing candidate responses…</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30 shadow-lg shadow-green-500/20">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Slideshow */}
              <StatsSlideshow />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
