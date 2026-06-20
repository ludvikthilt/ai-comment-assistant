-- ============================================================
-- FIX: "infinite recursion detected in policy for relation users"
-- Cause : la policy SELECT sur public.users interroge public.users
--         elle-même dans son propre EXISTS(...).
-- ============================================================

-- Fonction helper SECURITY DEFINER : contourne RLS pour cette lecture
-- interne uniquement. LANGUAGE plpgsql (jamais inlinée par le planner,
-- contrairement à LANGUAGE sql, qui peut casser SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE id = uid AND role = 'admin'
  );
END;
$$;

-- Remplacement de la policy récursive
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR public.is_admin(auth.uid())
    );
