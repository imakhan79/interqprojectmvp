-- ATS integration foundation: links candidates to real applicants, adds job_offers +
-- notifications tables, auto-provisions profiles/user_roles on signup, and turns on
-- RLS + realtime for the tables the cross-portal pipeline depends on.
--
-- Additive only: no DROP TABLE, no destructive ALTERs. Safe to run against a
-- database that may already have real rows in it.

-- ---------------------------------------------------------------------------
-- 1. Extend candidates to link to the real applicant + carry pipeline scores
-- ---------------------------------------------------------------------------
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ats_score NUMERIC;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS assessment_score NUMERIC;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_score NUMERIC;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS final_score NUMERIC;

CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);

-- ---------------------------------------------------------------------------
-- 2. Tie assessment/interview results back to a specific application
-- ---------------------------------------------------------------------------
ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS candidate_id TEXT;
CREATE INDEX IF NOT EXISTS idx_assessment_results_candidate_id ON assessment_results(candidate_id);

ALTER TABLE ai_interviews ADD COLUMN IF NOT EXISTS candidate_id TEXT;
CREATE INDEX IF NOT EXISTS idx_ai_interviews_candidate_id ON ai_interviews(candidate_id);

-- ---------------------------------------------------------------------------
-- 3. Offers table (genuinely new — didn't exist anywhere before)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS job_offers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  candidate_id TEXT REFERENCES candidates(id) ON DELETE CASCADE,
  job_id TEXT,
  company_id TEXT,
  position TEXT,
  salary TEXT,
  equity TEXT,
  bonus TEXT,
  start_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  sent_at TIMESTAMPTZ,
  response_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_candidate_id ON job_offers(candidate_id);
CREATE INDEX IF NOT EXISTS idx_offers_company_id ON job_offers(company_id);

DROP TRIGGER IF EXISTS set_offers_updated_at ON job_offers;
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON job_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 4. Generic notifications table shared by all three portals
--    (job_seeker_notifications is left as-is/deprecated, not migrated here)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  company_id TEXT,
  role TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);

-- ---------------------------------------------------------------------------
-- 5. Auto-provision profiles/user_roles on real Supabase Auth signup
--    (no equivalent trigger existed anywhere before this)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'jobseeker'),
    NEW.raw_user_meta_data->>'company_name',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id::text, COALESCE(NEW.raw_user_meta_data->>'role', 'jobseeker'))
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS candidates_select_company_or_self ON candidates;
CREATE POLICY candidates_select_company_or_self ON candidates
  FOR SELECT
  USING (
    user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = candidates.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS candidates_write_company ON candidates;
CREATE POLICY candidates_write_company ON candidates
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = candidates.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS candidates_update_company ON candidates;
CREATE POLICY candidates_update_company ON candidates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = candidates.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS jobs_select_open_or_company ON jobs;
CREATE POLICY jobs_select_open_or_company ON jobs
  FOR SELECT
  USING (
    status = 'open'
    OR EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS jobs_write_company ON jobs;
CREATE POLICY jobs_write_company ON jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = jobs.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS offers_select_company_or_candidate ON job_offers;
CREATE POLICY offers_select_company_or_candidate ON job_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = job_offers.company_id AND cm.user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = job_offers.candidate_id AND c.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS offers_write_company ON job_offers;
CREATE POLICY offers_write_company ON job_offers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = job_offers.company_id AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS offers_update_company_or_candidate_response ON job_offers;
CREATE POLICY offers_update_company_or_candidate_response ON job_offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = job_offers.company_id AND cm.user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = job_offers.candidate_id AND c.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid()::text
    OR (
      company_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM company_members cm
        WHERE cm.company_id = notifications.company_id AND cm.user_id = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS notifications_insert_authenticated ON notifications;
CREATE POLICY notifications_insert_authenticated ON notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 7. Realtime — turn on postgres_changes for the tables the pipeline needs
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'candidates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE candidates;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'job_offers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE job_offers;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
