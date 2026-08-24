import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck, Server, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit with industry-standard protocols." },
  { icon: Server, title: "Secure Infrastructure", desc: "Hosted on infrastructure built for security and reliability, with continuous monitoring." },
  { icon: UserCheck, title: "Role-Based Access", desc: "Granular permissions ensure only authorized users access sensitive data." },
  { icon: FileCheck, title: "GDPR-Aligned Practices", desc: "Data handling practices designed with GDPR principles in mind." },
  { icon: Eye, title: "Confidential Interviews", desc: "Interview recordings and evaluations are treated as strictly confidential." },
  { icon: Shield, title: "Ongoing Security Review", desc: "Continuous internal review to identify and address potential risks as the platform evolves." },
];

const DataPrivacySection = () => {
  return (
    <section className="py-24 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Your Data Is Secure
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Enterprise-Grade Security & Privacy
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            InterQ is built with security at its core — protecting job seeker, company, and admin data at every level.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="font-semibold mb-2 text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/privacy-policy" className="text-cyan-600 hover:underline text-sm font-medium">
            Read our full Privacy Policy →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DataPrivacySection;
