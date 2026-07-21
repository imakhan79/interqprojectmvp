import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseRealtimeTableOptions {
  table: string;
  filter?: string;
  enabled?: boolean;
  onChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

/**
 * Subscribes to Postgres changes on `table` (optionally filtered, e.g.
 * `company_id=eq.123`) for as long as the component is mounted. Requires the
 * table to be added to the `supabase_realtime` publication (see
 * supabase/migrations/20261211000000_ats_integration_foundation.sql).
 */
export function useRealtimeTable({ table, filter, enabled = true, onChange }: UseRealtimeTableOptions) {
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        onChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, enabled]);
}
