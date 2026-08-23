import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

interface PreviewState {
  id: "analysis" | "confidence";
  title: string;
}

const STATES: PreviewState[] = [
  { id: "analysis", title: "Live Interview Analysis" },
  { id: "confidence", title: "Build Confidence" },
];

const ROTATE_INTERVAL_MS = 5000;

const skillSignals = [
  { label: "System Design", value: 88 },
  { label: "Algorithms", value: 76 },
  { label: "Code Quality", value: 92 },
];

const verifiedSkills = ["React", "System Design", "SQL", "API Design"];
const attentionArea = "Distributed systems depth";

const HeroProductPreview = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const panelId = useId();

  useEffect(() => {
    if (prefersReducedMotion || paused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % STATES.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, paused]);

  const goTo = useCallback((i: number) => setIndex(i), []);

  const current = STATES[index];

  const initial = prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 };
  const exit = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 };
  const transition = prefersReducedMotion
    ? { duration: 0.15 }
    : { duration: 0.5, ease: "easeOut" as const };

  return (
    <div
      className="relative w-full max-w-[520px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-950/50 backdrop-blur-md overflow-hidden">
        {/* App chrome header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>

        <div
          id={panelId}
          role="group"
          aria-roledescription="carousel"
          aria-label="InterQ product preview"
          className="relative min-h-[400px] p-6"
        >
          <AnimatePresence mode="wait">
            {current.id === "analysis" ? (
              <motion.div
                key="analysis"
                initial={initial}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={exit}
                transition={transition}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-bold text-white">
                      JS
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Jordan Singh</p>
                      <p className="text-xs text-slate-400">Senior Backend Engineer &middot; Round 2</p>
                    </div>
                  </div>
                  <Brain className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                </div>

                <h3 className="mb-1 text-lg font-bold text-white">Live Interview Analysis</h3>
                <p className="mb-5 text-xs text-slate-400">Processing candidate responses in real time&hellip;</p>

                <div className="mb-5 space-y-4">
                  {skillSignals.map((signal) => (
                    <div key={signal.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{signal.label}</span>
                        <span className="font-semibold text-cyan-300">{signal.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          initial={prefersReducedMotion ? false : { width: 0 }}
                          animate={{ width: `${signal.value}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-cyan-100">
                    AI signal: strong grasp of distributed caching trade-offs; asked for edge-case reasoning.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confidence"
                initial={initial}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={exit}
                transition={transition}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Build Confidence</h3>
                    <p className="text-xs text-slate-400">Detailed evaluation report</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Strong Hire
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                    <span className="text-xs font-medium text-slate-300">AI assessment match</span>
                  </div>
                  <span className="text-sm font-bold text-cyan-300">91%</span>
                </div>

                <div className="mb-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Verified skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {verifiedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Strengths
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Clear architecture reasoning, strong debugging instincts.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      Watch for
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">{attentionArea}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-slate-300">
                    Expert reviewer: &ldquo;Candidate reasoned through failure modes methodically &mdash;
                    comfortable recommending for the next round.&rdquo;
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* State controls */}
      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Product preview states">
        {STATES.map((state, i) => (
          <button
            key={state.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-controls={panelId}
            onClick={() => goTo(i)}
            aria-label={`Show ${state.title}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroProductPreview;
