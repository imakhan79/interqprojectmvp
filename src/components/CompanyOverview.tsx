import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Quote, Sparkles } from "lucide-react";

const CompanyOverview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-semibold tracking-wider uppercase mb-5">
            <Sparkles className="w-3 h-3" />
            About Us
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 text-slate-900">
            About <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">InterQ Technologies Inc.</span>
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Leading the transformation of recruitment through innovative AI technology
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full mb-8 space-y-4">
            {[
              {
                value: "products",
                title: "InterQ Products",
                content: "InterQ designs and delivers intelligent digital solutions that help businesses operate smarter and scale faster. Our product offerings include data-driven platforms, workflow automation tools, analytics dashboards, and custom technology solutions tailored to modern business needs. Each product is built with performance, scalability, and user experience at its core.",
              },
              {
                value: "industries",
                title: "Industries We Serve",
                content: "We serve startups, growing organizational hiring teams, and established organizations across multiple industries including technology, finance, retail, and professional services. InterQ partners with forward-thinking teams that value innovation, efficiency, and long-term digital growth.",
              },
              {
                value: "values",
                title: "Our Core Values",
                content: null,
                customContent: (
                  <div className="space-y-5">
                    {[
                      { name: "Integrity", desc: "We operate with honesty, transparency, and accountability, building trust with our clients, partners, and team members." },
                      { name: "Innovation", desc: "We embrace creativity and continuous improvement, always seeking better ways to solve problems and deliver value." },
                      { name: "Collaboration", desc: "We believe the best results come from working together—across teams, with clients, and through open communication." },
                    ].map((v) => (
                      <div key={v.name}>
                        <h4 className="font-bold text-slate-900 mb-1.5">{v.name}</h4>
                        <p className="text-slate-600">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                value: "team",
                title: "Meet the Team",
                content: "Our team is made up of passionate strategists, designers, engineers, and problem-solvers who share a common goal: delivering exceptional digital solutions. At InterQ, we value diversity of thought, continuous learning, and collaboration. Every team member brings unique expertise and a commitment to excellence in everything they do.",
              },
            ].map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6 px-8 text-slate-900">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed pb-8 px-8">
                  {item.customContent || item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CEO Section - Redesigned */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                  <Quote className="w-4 h-4" />
                </span>
                Message from Leadership
              </h3>
            </div>
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* CEO Image - Smaller & Proportionate */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <div className="relative w-40 lg:w-48">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100">
                      <img 
                        src="/saima-huma-ceo.png" 
                        alt="Saima Huma, CEO" 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    {/* Elegant Badge */}
                    <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">CEO</span>
                    </div>
                  </div>
                </div>
                
                {/* CEO Message - Clean & Readable */}
                <div className="flex-1 pt-4 lg:pt-2">
                  {/* Subtle label */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-6">
                    <Sparkles className="w-3 h-3" />
                    Founder&apos;s Vision
                  </div>
                  
                  {/* Quote with elegant styling */}
                  <blockquote className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-light mb-8 relative">
                    <span className="text-6xl text-cyan-400/30 absolute -top-4 -left-2 font-serif">&ldquo;</span>
                    <p className="pl-6">
                      At InterQ, our mission has always been to create meaningful technology that drives real impact. We believe in building long-term partnerships, staying curious, and pushing boundaries to help our clients succeed in a rapidly evolving digital world.
                    </p>
                  </blockquote>
                  
                  {/* Signature */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="h-px w-12 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                    <div>
                      <div className="font-bold text-lg text-slate-900 tracking-tight">Saima Huma</div>
                      <div className="text-sm text-slate-500 font-medium">Founder & CEO, InterQ Technologies Inc.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mt-8 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Our Values</h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {[
                { value: "innovation", title: "Innovation", desc: "We continuously explore new ideas, technologies, and approaches to deliver smarter and more effective solutions. Innovation drives everything we build." },
                { value: "integrity", title: "Integrity", desc: "We operate with honesty, transparency, and accountability, building trust with our clients, partners, and team members." },
                { value: "collaboration", title: "Collaboration", desc: "We believe the best results come from working together—across teams, with clients, and through open communication." },
                { value: "excellence", title: "Excellence", desc: "We are committed to delivering the highest quality in everything we do, from our products to our partnerships." },
              ].map((v, i) => (
                <AccordionItem key={v.value} value={v.value} className={i < 3 ? "border-b border-slate-100" : "border-none"}>
                  <AccordionTrigger className="text-base font-medium hover:no-underline text-slate-900">{v.title}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-base pb-4">{v.desc}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyOverview;
