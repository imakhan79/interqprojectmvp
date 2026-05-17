import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "company" | "recruiter" | "jobseeker")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/auth", { replace: true });
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const roleRedirect: Record<string, string> = {
          admin: "/admin",
          company: "/company",
          recruiter: "/recruiter",
          jobseeker: "/jobseeker",
        };
        navigate(roleRedirect[user.role] || "/dashboard", { replace: true });
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.isVerified) {
      const dashboardPath = {
        admin: "/admin",
        company: "/company",
        recruiter: "/recruiter",
        jobseeker: "/jobseeker",
      }[user.role] || "/dashboard";
      navigate(dashboardPath, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
