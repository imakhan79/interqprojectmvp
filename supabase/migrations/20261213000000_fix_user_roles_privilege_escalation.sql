-- Fixes the self-service admin escalation hole flagged in the production
-- readiness audit: the "Users can manage their own role" policy on
-- user_roles had no WITH CHECK, so any authenticated user could upsert
-- role: 'admin' on their own row and be trusted by every admin-bypass
-- policy in the schema (companies_admin_update, jobs_admin_update, etc).
--
-- Closing that alone isn't enough: handle_new_user() (added in
-- 20261211000000_ats_integration_foundation.sql) inserts user_roles.role
-- straight from client-supplied signup metadata via SECURITY DEFINER,
-- which bypasses RLS entirely. Both paths are fixed here together —
-- patching only the policy would leave signup-time escalation wide open.

-- ---------------------------------------------------------------------------
-- 1. Replace the single unguarded "FOR ALL" policy with separate, scoped
--    INSERT/UPDATE policies. Self-service is limited to the non-privileged
--    account types the app actually offers at signup; 'admin' can never be
--    set through these.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage their own role" ON user_roles;

CREATE POLICY user_roles_insert_own_safe_role ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = user_id
    AND role IN ('jobseeker', 'job_seeker', 'company', 'recruiter')
  );

CREATE POLICY user_roles_update_own_safe_role ON user_roles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (
    auth.uid()::text = user_id
    AND role IN ('jobseeker', 'job_seeker', 'company', 'recruiter')
  );

-- ---------------------------------------------------------------------------
-- 2. Admin bypass: a verified admin can still manage any row (including
--    granting the admin role deliberately), the same pattern already used
--    for companies_admin_update / jobs_admin_update.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS user_roles_admin_all ON user_roles;
CREATE POLICY user_roles_admin_all ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()::text AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()::text AND ur.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Sanitize the signup trigger so 'admin' can never arrive via
--    auth.signUp({ options: { data: { role: 'admin' } } }) either — this
--    function runs SECURITY DEFINER and bypasses RLS, so it needs its own
--    check independent of the policies above.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_role TEXT := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'jobseeker'));
BEGIN
  IF safe_role NOT IN ('jobseeker', 'job_seeker', 'company', 'recruiter') THEN
    safe_role := 'jobseeker';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, company_name, created_at, updated_at)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    safe_role,
    NEW.raw_user_meta_data->>'company_name',
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id::text, safe_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
END;
$$;
