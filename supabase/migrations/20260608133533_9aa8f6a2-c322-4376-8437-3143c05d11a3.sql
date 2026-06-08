
-- Helper expression rolled into policies (use has_role calls per role)

-- =========================================================================
-- OPERATIONAL TABLES: read = any signed-in user; write = admin/manager/dispatcher
-- =========================================================================

-- shipments
DROP POLICY IF EXISTS "Authenticated users can view shipments" ON public.shipments;
DROP POLICY IF EXISTS "Authenticated users can insert shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can update own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can delete own shipments" ON public.shipments;
DROP POLICY IF EXISTS "shipments_select" ON public.shipments;
DROP POLICY IF EXISTS "shipments_insert" ON public.shipments;
DROP POLICY IF EXISTS "shipments_update" ON public.shipments;
DROP POLICY IF EXISTS "shipments_delete" ON public.shipments;

CREATE POLICY "shipments_select" ON public.shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "shipments_insert" ON public.shipments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "shipments_update" ON public.shipments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "shipments_delete" ON public.shipments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- containers
DROP POLICY IF EXISTS "Authenticated users can view containers" ON public.containers;
DROP POLICY IF EXISTS "Admins can insert containers" ON public.containers;
DROP POLICY IF EXISTS "Admins can update containers" ON public.containers;
DROP POLICY IF EXISTS "Admins can delete containers" ON public.containers;
DROP POLICY IF EXISTS "containers_select" ON public.containers;
DROP POLICY IF EXISTS "containers_insert" ON public.containers;
DROP POLICY IF EXISTS "containers_update" ON public.containers;
DROP POLICY IF EXISTS "containers_delete" ON public.containers;

CREATE POLICY "containers_select" ON public.containers FOR SELECT TO authenticated USING (true);
CREATE POLICY "containers_insert" ON public.containers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "containers_update" ON public.containers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "containers_delete" ON public.containers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- tracking_events
DROP POLICY IF EXISTS "Authenticated users can view tracking_events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can insert tracking_events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can update tracking_events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can delete tracking_events" ON public.tracking_events;
DROP POLICY IF EXISTS "tracking_events_select" ON public.tracking_events;
DROP POLICY IF EXISTS "tracking_events_insert" ON public.tracking_events;
DROP POLICY IF EXISTS "tracking_events_update" ON public.tracking_events;
DROP POLICY IF EXISTS "tracking_events_delete" ON public.tracking_events;

CREATE POLICY "tracking_events_select" ON public.tracking_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "tracking_events_insert" ON public.tracking_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "tracking_events_update" ON public.tracking_events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "tracking_events_delete" ON public.tracking_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- border_crossings
DROP POLICY IF EXISTS "Authenticated users can view border_crossings" ON public.border_crossings;
DROP POLICY IF EXISTS "Admins can insert border_crossings" ON public.border_crossings;
DROP POLICY IF EXISTS "Admins can update border_crossings" ON public.border_crossings;
DROP POLICY IF EXISTS "Admins can delete border_crossings" ON public.border_crossings;
DROP POLICY IF EXISTS "border_crossings_select" ON public.border_crossings;
DROP POLICY IF EXISTS "border_crossings_insert" ON public.border_crossings;
DROP POLICY IF EXISTS "border_crossings_update" ON public.border_crossings;
DROP POLICY IF EXISTS "border_crossings_delete" ON public.border_crossings;

CREATE POLICY "border_crossings_select" ON public.border_crossings FOR SELECT TO authenticated USING (true);
CREATE POLICY "border_crossings_insert" ON public.border_crossings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "border_crossings_update" ON public.border_crossings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "border_crossings_delete" ON public.border_crossings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- pods
DROP POLICY IF EXISTS "Authenticated users can view pods" ON public.pods;
DROP POLICY IF EXISTS "Admins can insert pods" ON public.pods;
DROP POLICY IF EXISTS "Admins can update pods" ON public.pods;
DROP POLICY IF EXISTS "Admins can delete pods" ON public.pods;
DROP POLICY IF EXISTS "pods_select" ON public.pods;
DROP POLICY IF EXISTS "pods_insert" ON public.pods;
DROP POLICY IF EXISTS "pods_update" ON public.pods;
DROP POLICY IF EXISTS "pods_delete" ON public.pods;

CREATE POLICY "pods_select" ON public.pods FOR SELECT TO authenticated USING (true);
CREATE POLICY "pods_insert" ON public.pods FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "pods_update" ON public.pods FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "pods_delete" ON public.pods FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- fleet_units
DROP POLICY IF EXISTS "Authenticated users can view fleet_units" ON public.fleet_units;
DROP POLICY IF EXISTS "Authenticated users can insert fleet_units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can update own fleet_units" ON public.fleet_units;
DROP POLICY IF EXISTS "Users can delete own fleet_units" ON public.fleet_units;
DROP POLICY IF EXISTS "fleet_units_select" ON public.fleet_units;
DROP POLICY IF EXISTS "fleet_units_insert" ON public.fleet_units;
DROP POLICY IF EXISTS "fleet_units_update" ON public.fleet_units;
DROP POLICY IF EXISTS "fleet_units_delete" ON public.fleet_units;

CREATE POLICY "fleet_units_select" ON public.fleet_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "fleet_units_insert" ON public.fleet_units FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "fleet_units_update" ON public.fleet_units FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "fleet_units_delete" ON public.fleet_units FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- incidents
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON public.incidents;
DROP POLICY IF EXISTS "Authenticated users can insert incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can delete own incidents" ON public.incidents;
DROP POLICY IF EXISTS "incidents_select" ON public.incidents;
DROP POLICY IF EXISTS "incidents_insert" ON public.incidents;
DROP POLICY IF EXISTS "incidents_update" ON public.incidents;
DROP POLICY IF EXISTS "incidents_delete" ON public.incidents;

CREATE POLICY "incidents_select" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "incidents_insert" ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "incidents_update" ON public.incidents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));
CREATE POLICY "incidents_delete" ON public.incidents FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'dispatcher'));

-- =========================================================================
-- FINANCIAL / CUSTOMER TABLES: read+write = admin/manager only
-- =========================================================================

-- costs
DROP POLICY IF EXISTS "Admins manage costs" ON public.costs;
DROP POLICY IF EXISTS "costs_all" ON public.costs;
DROP POLICY IF EXISTS "costs_select" ON public.costs;
DROP POLICY IF EXISTS "costs_insert" ON public.costs;
DROP POLICY IF EXISTS "costs_update" ON public.costs;
DROP POLICY IF EXISTS "costs_delete" ON public.costs;

CREATE POLICY "costs_select" ON public.costs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "costs_insert" ON public.costs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "costs_update" ON public.costs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "costs_delete" ON public.costs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- claims
DROP POLICY IF EXISTS "Admins manage claims" ON public.claims;
DROP POLICY IF EXISTS "claims_all" ON public.claims;
DROP POLICY IF EXISTS "claims_select" ON public.claims;
DROP POLICY IF EXISTS "claims_insert" ON public.claims;
DROP POLICY IF EXISTS "claims_update" ON public.claims;
DROP POLICY IF EXISTS "claims_delete" ON public.claims;

CREATE POLICY "claims_select" ON public.claims FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "claims_insert" ON public.claims FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "claims_update" ON public.claims FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "claims_delete" ON public.claims FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- customers
DROP POLICY IF EXISTS "Admins manage customers" ON public.customers;
DROP POLICY IF EXISTS "customers_all" ON public.customers;
DROP POLICY IF EXISTS "customers_select" ON public.customers;
DROP POLICY IF EXISTS "customers_insert" ON public.customers;
DROP POLICY IF EXISTS "customers_update" ON public.customers;
DROP POLICY IF EXISTS "customers_delete" ON public.customers;

CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- drivers
DROP POLICY IF EXISTS "Admins manage drivers" ON public.drivers;
DROP POLICY IF EXISTS "drivers_all" ON public.drivers;
DROP POLICY IF EXISTS "drivers_select" ON public.drivers;
DROP POLICY IF EXISTS "drivers_insert" ON public.drivers;
DROP POLICY IF EXISTS "drivers_update" ON public.drivers;
DROP POLICY IF EXISTS "drivers_delete" ON public.drivers;

CREATE POLICY "drivers_select" ON public.drivers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "drivers_insert" ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "drivers_update" ON public.drivers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "drivers_delete" ON public.drivers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- =========================================================================
-- USER ROLES: self-read + admin manage
-- =========================================================================

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_self_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_delete" ON public.user_roles;

CREATE POLICY "user_roles_self_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
