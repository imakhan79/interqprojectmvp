-- Let companies read test results of candidates who applied to their jobs,
-- and let admins read all results. Candidates keep reading only their own rows.

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assessment_results_company_select ON assessment_results;
CREATE POLICY assessment_results_company_select ON assessment_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM candidates c
      JOIN company_members cm ON cm.company_id = c.company_id
      WHERE c.user_id = assessment_results.user_id::text
        AND cm.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS assessment_results_admin_select ON assessment_results;
CREATE POLICY assessment_results_admin_select ON assessment_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::text AND role = 'admin'
    )
  );
