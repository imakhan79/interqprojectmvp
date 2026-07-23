-- Cross-portal hiring workflows: job posting -> company/job approval -> jobseeker
-- apply -> hiring pipeline -> interview scheduling -> offers, wired together with
-- real notifications. Additive only, same pattern as the ATS foundation migration.

-- ---------------------------------------------------------------------------
-- 1. Company approval status (new companies start pending_approval; existing/
--    demo companies default to active so nothing already live gets locked out)
-- ---------------------------------------------------------------------------
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ---------------------------------------------------------------------------
-- 2. Job approval + assessment linkage
-- ---------------------------------------------------------------------------
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assessment_id UUID;

-- ---------------------------------------------------------------------------
-- 3. Candidate interview score (may already exist from the ATS foundation
--    migration — IF NOT EXISTS makes this safe to run either way)
-- ---------------------------------------------------------------------------
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS interview_score NUMERIC;

-- ---------------------------------------------------------------------------
-- 4. Admin-bypass UPDATE policies — the existing policies only let a
--    company's own members/creator update `companies`/`jobs`; admins need to
--    approve/reject rows they don't own.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS companies_admin_update ON companies;
CREATE POLICY companies_admin_update ON companies
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS jobs_admin_update ON jobs;
CREATE POLICY jobs_admin_update ON jobs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Let admins read every company/job regardless of status (approvals queue)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS companies_admin_select ON companies;
CREATE POLICY companies_admin_select ON companies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS jobs_admin_select ON jobs;
CREATE POLICY jobs_admin_select ON jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );
