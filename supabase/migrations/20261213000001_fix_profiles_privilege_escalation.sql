-- Same vulnerability class as 20261213000000, on the sibling table.
-- "Users can manage their own profile" had no WITH CHECK, so a user could
-- set profiles.role = 'admin' on their own row. That value doesn't gate
-- any real data access (user_roles does, and that's fixed already), but
-- it IS what SimpleAuthContext.buildUserFromSupabase() reads client-side
-- (src/contexts/SimpleAuthContext.tsx:158-164), which is what
-- ProtectedRoute uses to decide whether to route someone into /admin.
-- Left open, a user could still get routed into the admin UI shell even
-- though their real writes would now correctly fail RLS.

DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Self-service insert (first login/profile bootstrap): own row only,
-- and only into a non-privileged role.
CREATE POLICY profiles_insert_own_safe_role ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = id
    AND (role IS NULL OR role IN ('jobseeker', 'job_seeker', 'company', 'recruiter'))
  );

-- Self-service update: full_name/avatar_url/phone/location/company_name
-- etc. remain freely editable on your own row; role cannot be pushed to
-- 'admin' through this path.
CREATE POLICY profiles_update_own_safe_role ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (
    auth.uid()::text = id
    AND (role IS NULL OR role IN ('jobseeker', 'job_seeker', 'company', 'recruiter'))
  );

-- Admin bypass: a verified admin (per user_roles, not per profiles) can
-- still manage any profile, including deliberately granting admin.
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles
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
