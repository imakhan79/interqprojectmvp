import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyRole } from "@/lib/notifications";
import { Building2, ArrowRight, ArrowLeft, Shield, CheckCircle, Loader2, AlertCircle, Briefcase, Users, Globe, MapPin } from "lucide-react";
import interqLogo from "/interq-logo.png";

const industries = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-Commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "legal", label: "Legal Services" },
  { value: "real_estate", label: "Real Estate" },
  { value: "telecom", label: "Telecommunications" },
  { value: "pharma", label: "Pharmaceuticals" },
  { value: "other", label: "Other" },
];

const companySizes = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

interface FormData {
  companyName: string;
  companyEmail: string;
  website: string;
  location: string;
  industry: string;
  companySize: string;
  description: string;
  adminName: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

interface FormErrors {
  companyName?: string;
  companyEmail?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  adminName?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
}

export default function CompanySignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isDemo } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState<FormData>({
    companyName: "",
    companyEmail: "",
    website: "",
    location: "",
    industry: "",
    companySize: "",
    description: "",
    adminName: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  // Check if user already has a company
  useEffect(() => {
    const checkExistingCompany = async () => {
      if (!user) {
        setCheckingExisting(false);
        return;
      }

      // Demo users cannot create companies
      if (isDemo) {
        toast({
          title: "Demo Account",
          description: "Demo accounts cannot create companies. Please sign up with a real account.",
          variant: "destructive",
        });
        setCheckingExisting(false);
        return;
      }

      try {
        const { data: membership } = await supabase
          .from("company_members")
          .select("company_id, companies(id, name)")
          .eq("user_id", user.id)
          .limit(1)
          .single();

        if (membership?.companies) {
          setHasExistingCompany(true);
        }
      } catch (error) {
        console.error("Error checking existing company:", error);
      }
      
      setCheckingExisting(false);
    };

    checkExistingCompany();
  }, [user, isDemo, toast]);

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.adminName.trim()) {
      newErrors.adminName = "Admin name is required";
    } else if (form.adminName.trim().length < 2) {
      newErrors.adminName = "Name must be at least 2 characters";
    }

    if (!form.companyEmail.trim()) {
      newErrors.companyEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)) {
      newErrors.companyEmail = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!form.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (form.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    if (!form.industry) {
      newErrors.industry = "Please select an industry";
    }

    if (!form.companySize) {
      newErrors.companySize = "Please select company size";
    }

    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      newErrors.website = "Please enter a valid URL (starting with http:// or https://)";
    }

    if (!form.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // If we are already logged in as a demo user, just bypass and go to dashboard
      if (user?.isDemo) {
        toast({
          title: "Demo Mode Active",
          description: "Creating your trial workspace... (Simulated)",
        });
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate("/company");
        return;
      }

      let userId = user?.id;

      // If not logged in, create new user
      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.companyEmail.trim(),
          password: form.password,
          options: {
            data: { full_name: form.adminName.trim(), role: "company" },
          },
        });

        if (authError) {
          if (authError.message.includes("already registered")) {
            toast({
              title: "Email already registered",
              description: "Please sign in with your existing account.",
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }
          throw authError;
        }

        userId = authData.user?.id;
        if (!userId) throw new Error("User creation failed. Please try again.");
        
        // Wait a small moment for database triggers (like profiles) to complete 
        // to avoid foreign key constraint violations in the next step
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Create company — starts pending admin approval, not immediately live
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: form.companyName.trim(),
          email: form.companyEmail.trim(),
          website: form.website || null,
          industry: form.industry || null,
          company_size: form.companySize || null,
          location: form.location || null,
          description: form.description || null,
          created_by: userId,
          status: "pending_approval",
        })
        .select("id")
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
        
        // Check if it's a table not found error
        if (companyError.message.includes("companies") || 
            companyError.code === "42P01" ||
            companyError.details?.includes("companies")) {
          toast({
            title: "Database setup required",
            description: "The companies table doesn't exist. Please run the database migration first.",
            variant: "destructive",
          });
          return;
        }
        
        if (companyError.message.includes("duplicate")) {
          toast({
            title: "Company exists",
            description: "A company with this name may already exist.",
            variant: "destructive",
          });
          return;
        }
        
        if (companyError.message.includes("foreign key")) {
          toast({
            title: "Setup incomplete",
            description: "Please complete your profile setup before creating a company.",
            variant: "destructive",
          });
          return;
        }
        
        throw companyError;
      }

      // Add user as admin member
      const { error: memberError } = await supabase.from("company_members").insert({
        company_id: company.id,
        user_id: userId,
        role: "admin",
      });

      if (memberError) throw memberError;

      // Set user role
      await supabase.from("user_roles").upsert({
        user_id: userId,
        role: "company",
      }, { onConflict: "user_id" });

      // Create profile if doesn't exist
      await supabase.from("profiles").upsert({
        id: userId,
        email: form.companyEmail.trim(),
        full_name: form.adminName.trim(),
        role: "company",
        company_name: form.companyName.trim(),
      }, { onConflict: "id" });

      // Log audit
      await supabase.from("audit_logs").insert({
        company_id: company.id,
        user_id: userId,
        action: "company_created",
        entity_type: "company",
        entity_id: company.id,
        details: { company_name: form.companyName },
      });

      await notifyRole("admin", {
        type: "company.pending_approval",
        title: "New company awaiting approval",
        message: `${form.companyName.trim()} signed up and needs review.`,
        link: "/admin/approvals",
      });

      toast({
        title: "Company created!",
        description: "Your workspace is ready — an admin will review and approve it shortly.",
      });

      // Redirect to company dashboard
      navigate("/company", { replace: true });
    } catch (err: any) {
      console.error("Company creation error:", err);
      toast({
        title: "Creation failed",
        description: err.message || "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (hasExistingCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Company Already Exists</h2>
            <p className="text-muted-foreground mb-6">
              You already have a company workspace. Navigate to your dashboard to manage it.
            </p>
            <Button onClick={() => navigate("/company")} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Demo Account</h2>
            <p className="text-muted-foreground mb-6">
              Demo accounts cannot create companies. Please sign up with a real email address to create your company workspace.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign In with Real Account
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={interqLogo} alt="InterQ" className="h-12 mx-auto" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Create Your Company Workspace</h1>
          <p className="text-muted-foreground mt-2">Set up your hiring command center in minutes</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Account
                </span>
              </div>
              <div className="flex-1 h-1 mx-4 rounded bg-muted">
                <div 
                  className="h-full rounded bg-primary transition-all" 
                  style={{ width: `${step * 50}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Company
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Account Details */}
            {step === 1 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Admin Full Name *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminName"
                        placeholder="John Smith"
                        value={form.adminName}
                        onChange={(e) => updateForm("adminName", e.target.value)}
                        className={`pl-10 ${errors.adminName ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.adminName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.adminName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Work Email *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyEmail"
                        type="email"
                        placeholder="john@yourcompany.com"
                        value={form.companyEmail}
                        onChange={(e) => updateForm("companyEmail", e.target.value)}
                        className={`pl-10 ${errors.companyEmail ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.companyEmail && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.companyEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Must contain uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={(e) => updateForm("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                >
                  Continue to Company Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" /> Your data is encrypted and secure
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/auth" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: Company Details */}
            {step === 2 && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Acme Corporation"
                        value={form.companyName}
                        onChange={(e) => updateForm("companyName", e.target.value)}
                        className={`pl-10 ${errors.companyName ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.companyName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Industry *</Label>
                      <Select value={form.industry} onValueChange={(v) => updateForm("industry", v)}>
                        <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind.value} value={ind.value}>
                              {ind.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.industry}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Company Size *</Label>
                      <Select value={form.companySize} onValueChange={(v) => updateForm("companySize", v)}>
                        <SelectTrigger className={errors.companySize ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.companySize && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.companySize}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="San Francisco, CA"
                          value={form.location}
                          onChange={(e) => updateForm("location", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          placeholder="www.yourcompany.com"
                          value={form.website}
                          onChange={(e) => updateForm("website", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of your company..."
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                    />
                  </div>

                  <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.termsAccepted ? 'bg-red-50 border border-red-200' : 'bg-muted/50'}`}>
                    <Checkbox
                      id="terms"
                      checked={form.termsAccepted}
                      onCheckedChange={(v) => updateForm("termsAccepted", !!v)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                    </label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.termsAccepted}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Workspace
                        <Building2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" /> Your data is encrypted and secure
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
