import { motion } from "framer-motion";
import { FileText, Mail } from "lucide-react";

const PressKit = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-30" />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Press Kit
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              For press inquiries, interview requests, or brand assets, please contact our media team below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Press Assets Section — placeholder until real assets are provided */}
      <section id="assets" className="py-16 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto bg-card border border-dashed border-border rounded-xl p-10 text-center"
          >
            <FileText className="w-8 h-8 text-primary/60 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-bold mb-2">Press assets coming soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Logo files, product screenshots, and brand guidelines will be published here once finalized.
              Reach out directly if you need something in the meantime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Media Contact Section */}
      <section id="contact" className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-md mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Media Contact
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              For press inquiries, interview requests, or additional information, reach out directly.
            </p>

            <div className="bg-card border border-border rounded-xl p-6 inline-flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
              <a
                href="mailto:contact@interq.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                contact@interq.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PressKit;
