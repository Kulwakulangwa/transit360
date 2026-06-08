
-- Helper: admin check
-- (public.has_role already exists)

-- =========================================================
-- SENSITIVE TABLES: admin-only full access
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['claims','costs','customers','drivers'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "auth all %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated all on %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "authenticated all %I" ON public.%I', t, t);
  END LOOP;
END $$;

-- Drop any remaining permissive policies on these tables
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('claims','costs','customers','drivers')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "admin all claims" ON public.claims FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin all costs" ON public.costs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin all customers" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin all drivers" ON public.drivers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- OPERATIONAL TABLES: authenticated read, admin-only writes
-- =========================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('border_crossings','containers','pods','tracking_events')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['border_crossings','containers','pods','tracking_events'] LOOP
    EXECUTE format('CREATE POLICY "auth read %I" ON public.%I FOR SELECT TO authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "admin write %I" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE POLICY "admin update %I" ON public.%I FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t, t);
    EXECUTE format('CREATE POLICY "admin delete %I" ON public.%I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''admin''))', t, t);
  END LOOP;
END $$;

-- =========================================================
-- DELETE bypass cleanup on owner-scoped tables
-- =========================================================
DROP POLICY IF EXISTS "auth delete shipments" ON public.shipments;
DROP POLICY IF EXISTS "auth delete fleet_units" ON public.fleet_units;
DROP POLICY IF EXISTS "auth delete incidents" ON public.incidents;

-- Allow owner OR admin to delete on these tables
CREATE POLICY "owner or admin delete shipments" ON public.shipments FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owner or admin delete fleet_units" ON public.fleet_units FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owner or admin delete incidents" ON public.incidents FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
