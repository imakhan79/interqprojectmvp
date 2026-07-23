import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth, DEMO_USERS, getDashboardPath, type AccountRole } from "@/contexts/SimpleAuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Building2, Users, Briefcase, Copy, LogIn, Loader2,
  ShieldCheck, Sparkles,
} from "lucide-react";

const roleConfig: Record<AccountRole, { icon: typeof Shield; label: string; accent: string }> = {
  admin: { icon: Shield, label: "Admin", accent: "text-red-600 bg-red-50 dark:bg-red-950/30" },
  company: { icon: Building2, label: "Company", accent: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
  recruiter: { icon: Users, label: "Recruiter", accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
  jobseeker: { icon: Briefcase, label: "Job Seeker", accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
};

export default function DemoAccess() {
  const navigate = useNavigate();
  const { loginWithDemo } = useAuth();
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<AccountRole | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  const copyCredentials = (email: string, password: string, label: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    toast({ title: "Credentials copied", description: `${label} demo login copied to clipboard.` });
  };

  const handleLogin = async (role: AccountRole) => {
    setLoadingRole(role);
    const result = await loginWithDemo(role);
    if (result.success) {
      navigate(getDashboardPath(role), { replace: true });
    } else {
      toast({ title: "Demo login failed", description: result.error, variant: "destructive" });
      setLoadingRole(null);
    }
  };

  const canonicalUrl = "https://interq.com/demo-access";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Demo Access — Explore InterQ with Sample Accounts | InterQ</title>
        <meta
          name="description"
          content="Explore InterQ instantly. Sign in with approved demo accounts for Admin, Company, Recruiter, and Job Seeker roles — no signup required."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content="Demo Access — Explore InterQ with Sample Accounts" />
        <meta
          property="og:description"
          content="Sign in with approved demo accounts for Admin, Company, Recruiter, and Job Seeker roles — no signup required."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Demo Access — Explore InterQ with Sample Accounts" />
        <meta
          name="twitter:description"
          content="Sign in with approved demo accounts for Admin, Company, Recruiter, and Job Seeker roles — no signup required."
        />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Demo Access — InterQ",
            description:
              "Explore InterQ instantly with approved demo accounts for Admin, Company, Recruiter, and Job Seeker roles.",
            url: canonicalUrl,
          })}
        </script>
      </Helmet>

      <EnhancedNavigation />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <Badge variant="outline" className="mb-4 gap-1.5 px-3 py-1 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Demo Access
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Explore the Platform
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in instantly with an approved demo account for each role below — no signup, no
              waiting. Copy the credentials to try them anywhere, or jump straight in.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(roleConfig) as AccountRole[]).map((role, i) => {
              const demoUser = DEMO_USERS.find((u) => u.role === role);
              const config = roleConfig[role];
              const Icon = config.icon;
              if (!demoUser) return null;

              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Card
                    className="h-full flex flex-col border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
                    aria-label={`${config.label} demo account`}
                  >
                    <CardHeader className="space-y-3 pb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.accent}`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-card-foreground">{config.label}</h2>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">
                          {demoUser.description}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      <dl className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">Username</dt>
                            <dd className="font-mono text-xs text-foreground truncate">{demoUser.email}</dd>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                            aria-label={`Copy ${config.label} username`}
                            onClick={() => copy(demoUser.email, "Username")}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                          <div className="min-w-0">
                            <dt className="text-xs text-muted-foreground">Password</dt>
                            <dd className="font-mono text-xs text-foreground truncate">{demoUser.password}</dd>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                            aria-label={`Copy ${config.label} password`}
                            onClick={() => copy(demoUser.password, "Password")}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </dl>

                      <div className="mt-auto space-y-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => copyCredentials(demoUser.email, demoUser.password, config.label)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy Credentials
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full gap-2"
                          disabled={loadingRole !== null}
                          onClick={() => handleLogin(role)}
                        >
                          {loadingRole === role ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogIn className="w-3.5 h-3.5" />
                          )}
                          Login as {config.label}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Sandboxed demo accounts — nothing you do here affects real data.
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
