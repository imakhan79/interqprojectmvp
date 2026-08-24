import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Code, Settings, Users, BarChart3, Shield, Globe, Building2, Wallet, MessagesSquare, LineChart } from "lucide-react";


const Integrations = () => {
  const navigate = useNavigate();

  const integrationCategories = [
    {
      category: "ATS Systems",
      icon: Building2,
      description: "Sync candidates, roles, and evaluation results with your applicant tracking system.",
      examples: "e.g. Greenhouse, Lever, Workday, iCIMS",
    },
    {
      category: "HRIS Systems",
      icon: Wallet,
      description: "Keep hiring data connected to your core HR and payroll systems.",
      examples: "e.g. BambooHR, ADP, Gusto, Rippling",
    },
    {
      category: "Communication",
      icon: MessagesSquare,
      description: "Push interview updates and notifications to the tools your team already uses daily.",
      examples: "e.g. Slack, Microsoft Teams, Zoom",
    },
    {
      category: "Analytics & BI",
      icon: LineChart,
      description: "Export hiring and evaluation data into your existing reporting and analytics stack.",
      examples: "e.g. Tableau, Power BI, Google Analytics",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "One-Click Setup",
      description: "Connect your tools in minutes with our pre-built integrations"
    },
    {
      icon: Settings,
      title: "Custom Configurations",
      description: "Tailor integrations to match your specific workflow needs"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Built with encryption and access controls at every layer"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Keep everyone aligned with automated notifications and updates"
    },
    {
      icon: BarChart3,
      title: "Unified Analytics",
      description: "Consolidate data across all your tools for comprehensive insights"
    },
    {
      icon: Globe,
      title: "Global Compatibility",
      description: "Works with tools used worldwide, supporting multiple languages"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 lg:px-8 overflow-hidden hero-blue">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-30" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Seamless Integrations
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect InterQ with your existing tools and workflows. Our pre-built integrations 
              ensure smooth data flow and enhanced productivity across your entire tech stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="premium"
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
                onClick={() => navigate('/get-started')}
              >
                Request Integration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
                onClick={() => navigate('/api-docs')}
              >
                View API Docs
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 lg:px-8 section-blue-light">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Integration Benefits
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Experience the power of connected systems working together seamlessly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-primary mb-4">
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 px-4 lg:px-8 section-blue-dark">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Integration Categories
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Our open API is built to connect with the categories of tools hiring teams already rely on.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {integrationCategories.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <category.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.category}</h3>
                </div>
                <p className="text-muted-foreground mb-3">{category.description}</p>
                <p className="text-sm text-muted-foreground/70 italic">{category.examples}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 lg:px-8 section-blue-light">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Need a Custom Integration?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Our team can build custom integrations for your specific tools and workflows.
              Get in touch to discuss your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="premium"
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
                onClick={() => navigate('/contact')}
              >
                Contact Integration Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg"
                onClick={() => navigate('/api-docs')}
              >
                Build Your Own
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Integrations;
