import { Mail, Linkedin, Facebook, Instagram, Github, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const EnhancedFooter = () => {
  const navigate = useNavigate();

  const footerSections = {
    Product: {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Assessments", href: "/assessments" },
        { label: "AI Interviewing", href: "/ai-interview" },
        { label: "Pricing", href: "/pricing" },
        { label: "Integrations", href: "/integrations" },
      ],
    },
    Solutions: {
      title: "Solutions",
      links: [
        { label: "For TAPs", href: "/solutions/recruiters" },
        { label: "For Organizational Hiring", href: "/solutions/enterprise" },
        { label: "For SMEs", href: "/solutions/sme" },
        { label: "Industry Solutions", href: "/solutions/industry" },
      ],
    },
    Resources: {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Documentation", href: "/docs" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Help Center", href: "/help-center" },
        { label: "Guidelines", href: "/guidelines" },
      ],
    },
    Company: {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press Kit", href: "/press-kit" },
        { label: "Partners", href: "/partners" },
        { label: "Contact", href: "/contact" },
      ],
    },
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/profile.php?id=61583304695087" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/interq.interview/" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/inter-tech-lnc/?viewAsMember=true" },
    { name: "GitHub", icon: Github, href: "https://github.com/engineer1979/interqproject" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "GDPR Compliance", href: "/gdpr" },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="text-3xl font-bold mb-4">
              Inter<span className="text-cyan-400">Q</span>
            </div>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed max-w-sm">
              Redefining recruitment with AI-driven interviews and assessments across North America,
              Middle East and beyond. Empowering organizations to build exceptional teams through
              intelligent hiring solutions.
            </p>

            <div className="flex items-center gap-2 mb-6">
              <Mail className="h-4 w-4 text-cyan-400 flex-shrink-0" />
              <a href="mailto:contact@interq.com" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                contact@interq.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all duration-200"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-base mb-5 text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: "Book Demo", href: "/get-started" },
                { label: "Start Free Trial", href: "/auth" },
                { label: "Download Press Kit", href: "/press-kit/download" },
              ].map((action) => (
                <Button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="w-full justify-start h-11 px-4 text-sm rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-base mb-5 text-white">Stay Updated</h3>
            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
              Get the latest hiring insights, product updates, and industry trends delivered to your inbox.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl">
                Subscribe to Newsletter
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 pt-10 border-t border-slate-800">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-sm mb-5 text-white uppercase tracking-wider">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-2.5 text-slate-400 hover:text-cyan-400 transition-colors text-sm"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-10 text-center mb-14 border border-cyan-500/20">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Ready to Transform Your Hiring?
          </h3>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto text-sm leading-relaxed">
            Join hundreds of companies using InterQ to build exceptional teams.
            Experience the future of recruitment with AI-powered solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/get-started")}
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg"
            >
              Book Demo
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-base rounded-xl border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-semibold"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              © 2025 InterQ Technologies Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <Link key={link.label} to={link.href} className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {["SOC 2 Certified", "ISO 27001", "GDPR Compliant", "AES-256 Encryption"].map((badge) => (
              <div key={badge} className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 bg-slate-800/50 font-medium">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
