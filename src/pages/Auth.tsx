import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth, DEMO_USERS, AccountRole } from "@/contexts/SimpleAuthContext";
import { 
  Mail, Lock, User, Eye, EyeOff, Shield, Building2, Users, Briefcase, 
  CheckCircle, Loader2, ArrowRight, Sparkles, Zap, Clock, FileText, Star,
  ArrowLeft, MessageSquare, Calendar, TrendingUp, UserCheck, AlertCircle, Home
} from "lucide-react";

const roleConfig = {
  admin: { icon: Shield, color: "bg-red-500", label: "Admin", gradient: "from-red-500 to-rose-600" },
  company: { icon: Building2, color: "bg-blue-500", label: "Company", gradient: "from-blue-500 to-indigo-600" },
  recruiter: { icon: Users, color: "bg-green-500", label: "Recruiter", gradient: "from-green-500 to-emerald-600" },
  jobseeker: { icon: Briefcase, color: "bg-purple-500", label: "Job Seeker", gradient: "from-purple-500 to-violet-600" },
};

const Auth = () => {
  const { login, signup, loginWithDemo, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AccountRole>("jobseeker");
  const [companyName, setCompanyName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoSection, setShowDemoSection] = useState(false);

  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (location.pathname !== "/auth") {
      setHistory(prev => [...prev, location.pathname]);
    }
  }, [location.pathname]);

  const handleBack = useCallback(() => {
    if (history.length > 0) {
      const previousPath = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      navigate(previousPath);
    } else {
      navigate("/");
    }
  }, [history, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    const result = await login(email, password);
    
    if (result.success) {
      if (result.needsVerification) {
        navigate("/verify-email");
      }
      // Navigation is handled by useEffect in SimpleAuthProvider
    } else {
      setError(result.error || "Login failed");
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (role: AccountRole) => {
    setError("");
    setIsSubmitting(true);
    
    const result = await loginWithDemo(role);
    
    if (result.success) {
      // Navigation is handled by useEffect in SimpleAuthProvider
    } else {
      setError(result.error || "Demo login failed");
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    const result = await signup({
      email,
      password,
      name,
      role: selectedRole,
      companyName: selectedRole === "company" ? companyName : undefined,
    });
    
    if (result.success) {
      if (result.needsVerification) {
        navigate("/verify-email");
      }
      // Otherwise navigation is handled by useEffect in SimpleAuthProvider
    } else {
      setError(result.error || "Signup failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src="/interq-logo.png" alt="InterQ Logo" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold text-white">InterQ</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            The Complete<br />
            Recruitment Platform
          </h1>
          
          <p className="text-xl text-white/80 mb-12 max-w-lg">
            Connect top talent with great opportunities. Streamline your hiring process with our modern, integrated recruitment solution.
          </p>

          <div className="space-y-6">
            {[
              { icon: Users, text: "50,000+ Active Candidates" },
              { icon: Building2, text: "1,200+ Companies Hiring" },
              { icon: Briefcase, text: "10,000+ Interviews Conducted" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg text-white font-medium">{stat.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="flex items-start gap-4">
              <img src="/api/placeholder/48/48" alt="User" className="w-12 h-12 rounded-full bg-white/20" />
              <div>
                <p className="text-white font-medium">"InterQ transformed our hiring process. We hired 50% faster!"</p>
                <p className="text-white/70 text-sm mt-1">- Sarah Chen, HR Director at TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Back Button */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <div className="p-1 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Back</span>
            </button>
            
            <div className="h-4 w-px bg-gray-200" />
            
            <a
              href="/"
              className="group inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <div className="p-1 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <span>Home</span>
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/interq-logo.png" alt="InterQ Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-gray-900">InterQ</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={showDemoSection ? "demo" : "form"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {showDemoSection ? (
                <Card className="border-0 shadow-2xl">
                  <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Demo Mode Available
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold">Try InterQ Free</CardTitle>
                    <CardDescription>
                      Explore InterQ instantly with pre-configured demo accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3">
                      {(["jobseeker", "company", "recruiter", "admin"] as AccountRole[]).map((role) => {
                        const config = roleConfig[role];
                        const Icon = config.icon;
                        const demoUser = DEMO_USERS.find(u => u.role === role);
                        
                        return (
                          <button
                            key={role}
                            onClick={() => handleDemoLogin(role)}
                            disabled={isSubmitting}
                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 capitalize">{config.label} Demo</span>
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                  Demo Account
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{demoUser?.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                          </button>
                        );
                      })}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => setShowDemoSection(false)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Create New Account or Sign In
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-2xl">
                  <CardHeader className="space-y-1 pb-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-fit -ml-2 mb-2" 
                      onClick={() => setShowDemoSection(true)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to Demo
                    </Button>
                    <CardTitle className="text-2xl font-bold">
                      {activeTab === "signin" ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription>
                      {activeTab === "signin" 
                        ? "Sign in to access your InterQ account" 
                        : "Join thousands of professionals using InterQ"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>

                      <TabsContent value="signin" className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password">Password</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                                onClick={() => navigate("/reset-password")}
                              >
                                Forgot password?
                              </Button>
                            </div>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="remember"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                          </div>

                          {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {error}
                            </div>
                          )}

                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <ArrowRight className="w-4 h-4 mr-2" />
                            )}
                            Sign In
                          </Button>
                        </form>
                      </TabsContent>

                      <TabsContent value="signup" className="space-y-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                          <div className="space-y-2">
                            <Label>I am a...</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {(["jobseeker", "company", "recruiter"] as AccountRole[]).map((role) => {
                                const config = roleConfig[role];
                                const Icon = config.icon;

                                return (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => setSelectedRole(role)}
                                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                      selectedRole === role
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-100 hover:border-gray-200"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center`}>
                                      <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-medium capitalize">{role === "jobseeker" ? "Job Seeker" : role === "recruiter" ? "Recruiter" : "Company"}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {selectedRole === "company" && (
                            <div className="space-y-2">
                              <Label htmlFor="companyName">Company Name</Label>
                              <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                  id="companyName"
                                  placeholder="Your company name"
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="signupName">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                id="signupName"
                                placeholder="John Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signupEmail">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                id="signupEmail"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signupPassword">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                id="signupPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              {error}
                            </div>
                          )}

                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <ArrowRight className="w-4 h-4 mr-2" />
                            )}
                            Create Account
                          </Button>

                          <p className="text-xs text-center text-gray-500">
                            By signing up, you agree to our{" "}
                            <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                              Terms of Service
                            </Button>{" "}
                            and{" "}
                            <Button variant="link" className="h-auto p-0 text-xs text-blue-600">
                              Privacy Policy
                            </Button>
                          </p>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Auth;
