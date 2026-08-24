import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ShieldAlert, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const problems = [
  {
    title: "Too many candidates",
    description: "Sorting the real contenders from the rest shouldn't eat your whole week.",
    icon: Users,
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
  return (
    <section className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 text-slate-900">
            Technical hiring shouldn't feel like guesswork.
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            You've seen it happen. A CV that reads like a dream hire. An interview that falls apart the second
            things get technical. Or worse — you make the offer, and three months in, you're back to square one.
            Here's why that keeps happening:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, index) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-slate-200 overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-cyan-100 group-hover:scale-105">
                    <p.icon className="w-7 h-7 text-cyan-600" />
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
