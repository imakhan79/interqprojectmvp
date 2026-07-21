import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";

// Seed/demo company shown to the demo company account (no real Supabase session).
export const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

// Resolves the company the signed-in user belongs to. `user.companyId` is set
// at login from a company_members lookup (see SimpleAuthContext); this hook
// re-queries as a fallback for the moment right after CompanySignup creates
// the company_members row, before that cached value refreshes.
export function useCompanyId() {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      if (!user) {
        if (!cancelled) { setCompanyId(null); setLoading(false); }
        return;
      }
      if (user.isDemo) {
        if (!cancelled) { setCompanyId(DEMO_COMPANY_ID); setLoading(false); }
        return;
      }
      if (user.companyId) {
        if (!cancelled) { setCompanyId(user.companyId); setLoading(false); }
        return;
      }

      const { data } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setCompanyId(data?.company_id || null);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { companyId, loading, isDemo: !!user?.isDemo };
}
