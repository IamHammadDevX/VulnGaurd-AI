-- VulnGuard DB hardening for Supabase
-- Idempotent: safe to run multiple times.

BEGIN;

-- Keep schema reachable for Supabase roles, but lock table access to explicit grants.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Secure-by-default baseline for all current and future objects in public schema.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Ensure future objects are not accidentally exposed.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Remove broad table access from public-facing roles.
REVOKE ALL ON TABLE public.sessions FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.teams FROM anon, authenticated;
REVOKE ALL ON TABLE public.team_members FROM anon, authenticated;
REVOKE ALL ON TABLE public.api_keys FROM anon, authenticated;
REVOKE ALL ON TABLE public.scans FROM anon, authenticated;
REVOKE ALL ON TABLE public.conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.messages FROM anon, authenticated;

-- Re-grant only what is needed for RLS-governed app access.
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scans TO authenticated;

-- Internal-only tables: no direct access for anon/authenticated.
-- sessions, conversations, messages intentionally keep no grants.

-- Force RLS everywhere to avoid owner-policy bypass for non-bypass roles.
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams FORCE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members FORCE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages FORCE ROW LEVEL SECURITY;

-- Drop existing policies to keep this script repeatable and deterministic.
DROP POLICY IF EXISTS users_select_self ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;

DROP POLICY IF EXISTS teams_select_member_or_owner ON public.teams;
DROP POLICY IF EXISTS teams_insert_owner_is_self ON public.teams;
DROP POLICY IF EXISTS teams_update_owner_only ON public.teams;
DROP POLICY IF EXISTS teams_delete_owner_only ON public.teams;

DROP POLICY IF EXISTS team_members_select_member_or_owner ON public.team_members;
DROP POLICY IF EXISTS team_members_insert_owner_only ON public.team_members;
DROP POLICY IF EXISTS team_members_update_owner_only ON public.team_members;
DROP POLICY IF EXISTS team_members_delete_owner_only ON public.team_members;

DROP POLICY IF EXISTS api_keys_select_owner_or_team_owner ON public.api_keys;
DROP POLICY IF EXISTS api_keys_insert_owner_or_team_owner ON public.api_keys;
DROP POLICY IF EXISTS api_keys_update_owner_or_team_owner ON public.api_keys;
DROP POLICY IF EXISTS api_keys_delete_owner_or_team_owner ON public.api_keys;

DROP POLICY IF EXISTS scans_select_owner_or_team_member ON public.scans;
DROP POLICY IF EXISTS scans_insert_owner_or_team_member ON public.scans;
DROP POLICY IF EXISTS scans_update_owner_or_team_owner ON public.scans;
DROP POLICY IF EXISTS scans_delete_owner_or_team_owner ON public.scans;

DROP POLICY IF EXISTS sessions_deny_all ON public.sessions;
DROP POLICY IF EXISTS conversations_deny_all ON public.conversations;
DROP POLICY IF EXISTS messages_deny_all ON public.messages;

-- USERS: user can read/update only their own profile row.
CREATE POLICY users_select_self
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY users_update_self
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- TEAMS: visibility to owners and members; mutating team row limited to owner.
CREATE POLICY teams_select_member_or_owner
ON public.teams
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()::text
  OR EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()::text
  )
);

CREATE POLICY teams_insert_owner_is_self
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY teams_update_owner_only
ON public.teams
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid()::text)
WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY teams_delete_owner_only
ON public.teams
FOR DELETE
TO authenticated
USING (owner_id = auth.uid()::text);

-- TEAM MEMBERS: team visibility for members/owner; membership changes by owner only.
CREATE POLICY team_members_select_member_or_owner
ON public.team_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
  OR EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()::text
  )
);

CREATE POLICY team_members_insert_owner_only
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()::text
  )
);

CREATE POLICY team_members_update_owner_only
ON public.team_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()::text
  )
);

CREATE POLICY team_members_delete_owner_only
ON public.team_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.teams t
    WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()::text
  )
);

-- API KEYS: key owner can manage; team owner can manage team-scoped keys.
CREATE POLICY api_keys_select_owner_or_team_owner
ON public.api_keys
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = api_keys.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY api_keys_insert_owner_or_team_owner
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = api_keys.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY api_keys_update_owner_or_team_owner
ON public.api_keys
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = api_keys.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
)
WITH CHECK (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = api_keys.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY api_keys_delete_owner_or_team_owner
ON public.api_keys
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = api_keys.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

-- SCANS: user sees own scans and scans in their teams.
CREATE POLICY scans_select_owner_or_team_member
ON public.scans
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = scans.team_id
        AND tm.user_id = auth.uid()::text
    )
  )
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = scans.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY scans_insert_owner_or_team_member
ON public.scans
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  AND (
    team_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = scans.team_id
        AND tm.user_id = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = scans.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY scans_update_owner_or_team_owner
ON public.scans
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = scans.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
)
WITH CHECK (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = scans.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

CREATE POLICY scans_delete_owner_or_team_owner
ON public.scans
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()::text
  OR (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.teams t
      WHERE t.id = scans.team_id
        AND t.owner_id = auth.uid()::text
    )
  )
);

-- Internal-only tables: explicit deny-all as defense-in-depth.
CREATE POLICY sessions_deny_all
ON public.sessions
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY conversations_deny_all
ON public.conversations
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY messages_deny_all
ON public.messages
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMIT;
