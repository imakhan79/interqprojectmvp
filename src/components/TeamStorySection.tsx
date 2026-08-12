import { motion } from "framer-motion";
import { Users, Target, Zap, Heart, Sparkles } from "lucide-react";

const values = [
  { icon: Target, title: "Focus on What Matters", desc: "Skills over resumes" },
  { icon: Zap, title: "Simplify Hiring", desc: "Faster, fairer process" },
  { icon: Users, title: "Build Confidence", desc: "Trust in every match" },
  { icon: Heart, title: "Human-Centered", desc: "People first approach" },
];

const TeamStorySection = () => {
  return (
    <section className="py-24 md:py-28 px-4 bg-slate-50 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800&q=80"
                alt="InterQ Team Collaboration"
                className="w-full h-80 object-cover hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5">
              <Sparkles className="w-3 h-3" />
              Our Story
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 leading-tight tracking-tight">
              Meet the Team <br /> <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Behind InterQ</span>
            </h2>
            <p className="text-xl text-slate-700 font-medium leading-relaxed mb-6">
              At InterQ, we help you hire the right people — without stress or guesswork.
            </p>
            <div className="space-y-4 text-slate-600 leading-relaxed text-base">
              <p>
                Our team of builders and problem-solvers saw how slow, unfair, and confusing hiring had become. Good candidates were getting missed, and we knew there had to be a better way.
              </p>
              <p>
                So we created InterQ to make hiring simpler, fairer, and clearer. We focus on what really matters: how someone thinks, solves problems, and performs real work.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-7 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4 group-hover:bg-cyan-100 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamStorySection;
