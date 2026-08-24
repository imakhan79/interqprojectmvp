import { motion } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { HelpCircle, Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How does InterQ evaluate candidates?",
    a: "Candidates go through a structured process: an AI-powered technical assessment, followed by a live expert-led interview. InterQ combines automated performance signals with human judgment from real technical interviewers to produce a detailed evaluation report.",
  },
  {
    q: "Who conducts the technical interviews?",
    a: "Interviews are conducted by vetted, experienced technical experts across 50+ domains — not automated bots. Each interviewer is matched to the relevant role and technology stack.",
  },
  {
    q: "What types of technical roles can InterQ assess?",
    a: "InterQ supports a wide range of technical roles, including software engineering, data, DevOps, QA, and other specialized technical positions.",
  },
  {
    q: "Can assessments be customized for our roles?",
    a: "Yes. Assessments can be tailored to your specific role requirements, tech stack, and seniority level.",
  },
  {
    q: "How does InterQ prevent cheating?",
    a: "InterQ uses a combination of live proctoring signals, structured live interviews, and expert evaluation to verify that candidate performance reflects genuine ability.",
  },
  {
    q: "How long does an assessment take?",
    a: "Most assessments take between 45–90 minutes, depending on role complexity, with results and reports typically available within 24 hours.",
  },
  {
    q: "Can InterQ integrate with our existing hiring process?",
    a: "Yes, InterQ is designed to slot into your existing pipeline, working alongside your applicant tracking system and interview workflow.",
  },
  {
    q: "How is candidate data protected?",
    a: "Candidate data is handled securely with strict access controls and retention policies, in line with applicable data privacy regulations.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 md:py-28 bg-slate-50" id="faq">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Got questions? Good. Here are the honest answers.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <AccordionPrimitive.Root type="single" collapsible defaultValue="faq-0" className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionPrimitive.Item
                key={i}
                value={`faq-${i}`}
                className="bg-white border border-slate-200 rounded-xl px-6 shadow-sm hover:shadow-md transition-all"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between gap-4 py-5 text-left font-semibold text-base text-slate-900">
                    {faq.q}
                    <span className="relative h-4 w-4 shrink-0 text-cyan-600">
                      <Plus className="absolute inset-0 h-4 w-4 transition-opacity duration-200 [[data-state=open]_&]:opacity-0" aria-hidden="true" />
                      <Minus className="absolute inset-0 h-4 w-4 opacity-0 transition-opacity duration-200 [[data-state=open]_&]:opacity-100" aria-hidden="true" />
                    </span>
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="text-slate-500 leading-relaxed pb-5">{faq.a}</p>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
