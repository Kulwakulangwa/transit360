
-- ============ CONTAINERS ============
CREATE TABLE public.containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '20ft',
  status TEXT NOT NULL DEFAULT 'Available',
  location TEXT NOT NULL DEFAULT '',
  bl_number TEXT NOT NULL DEFAULT '',
  arrival_date TEXT NOT NULL DEFAULT '',
  departure_date TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  seal_number TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.containers TO authenticated;
GRANT ALL ON public.containers TO service_role;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all containers" ON public.containers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ DRIVERS ============
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL DEFAULT '',
  license_number TEXT NOT NULL DEFAULT '',
  license_expiry TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  nationality TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  current_assignment TEXT NOT NULL DEFAULT '',
  current_location TEXT NOT NULL DEFAULT '',
  total_trips INTEGER NOT NULL DEFAULT 0,
  medical_expiry TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all drivers" ON public.drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ TRACKING EVENTS ============
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl_number TEXT NOT NULL DEFAULT '',
  shipment_ref TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT 'Update',
  location TEXT NOT NULL DEFAULT '',
  latitude NUMERIC,
  longitude NUMERIC,
  description TEXT NOT NULL DEFAULT '',
  driver_name TEXT NOT NULL DEFAULT '',
  truck_unit TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_events TO authenticated;
GRANT ALL ON public.tracking_events TO service_role;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all tracking_events" ON public.tracking_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ BORDER CROSSINGS ============
CREATE TABLE public.border_crossings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl_number TEXT NOT NULL DEFAULT '',
  border_point TEXT NOT NULL DEFAULT '',
  direction TEXT NOT NULL DEFAULT 'Export',
  status TEXT NOT NULL DEFAULT 'Pending',
  crossing_date TEXT NOT NULL DEFAULT '',
  clearance_date TEXT NOT NULL DEFAULT '',
  truck_unit TEXT NOT NULL DEFAULT '',
  driver_name TEXT NOT NULL DEFAULT '',
  customs_agent TEXT NOT NULL DEFAULT '',
  documents TEXT NOT NULL DEFAULT '',
  fees NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  hold_reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.border_crossings TO authenticated;
GRANT ALL ON public.border_crossings TO service_role;
ALTER TABLE public.border_crossings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all border_crossings" ON public.border_crossings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ PODS ============
CREATE TABLE public.pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl_number TEXT NOT NULL DEFAULT '',
  shipment_ref TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  delivery_date TEXT NOT NULL DEFAULT '',
  pod_status TEXT NOT NULL DEFAULT 'Pending',
  uploaded_by TEXT NOT NULL DEFAULT '',
  uploaded_at TEXT NOT NULL DEFAULT '',
  verified_by TEXT NOT NULL DEFAULT '',
  verified_at TEXT NOT NULL DEFAULT '',
  file_reference TEXT NOT NULL DEFAULT '',
  recipient_name TEXT NOT NULL DEFAULT '',
  recipient_signature TEXT NOT NULL DEFAULT '',
  condition_notes TEXT NOT NULL DEFAULT '',
  rejection_reason TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pods TO authenticated;
GRANT ALL ON public.pods TO service_role;
ALTER TABLE public.pods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all pods" ON public.pods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ COSTS ============
CREATE TABLE public.costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl_number TEXT NOT NULL DEFAULT '',
  cost_type TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  vendor TEXT NOT NULL DEFAULT '',
  vendor_invoice TEXT NOT NULL DEFAULT '',
  paid_by TEXT NOT NULL DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  payment_date TEXT NOT NULL DEFAULT '',
  payment_reference TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.costs TO authenticated;
GRANT ALL ON public.costs TO service_role;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all costs" ON public.costs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ CLAIMS ============
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL DEFAULT '',
  bl_number TEXT NOT NULL DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  claim_type TEXT NOT NULL DEFAULT 'Other',
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  incident_date TEXT NOT NULL DEFAULT '',
  reported_date TEXT NOT NULL DEFAULT '',
  resolved_date TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  claim_amount NUMERIC NOT NULL DEFAULT 0,
  settled_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  assigned_to TEXT NOT NULL DEFAULT '',
  resolution_notes TEXT NOT NULL DEFAULT '',
  documents TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.claims TO authenticated;
GRANT ALL ON public.claims TO service_role;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all claims" ON public.claims FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  customer_type TEXT NOT NULL DEFAULT 'Regular',
  payment_terms TEXT NOT NULL DEFAULT '',
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  total_shipments INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth all customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ EXTEND existing tables: shared team-wide visibility & delete ============
CREATE POLICY "auth view shipments" ON public.shipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth delete shipments" ON public.shipments FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth view fleet_units" ON public.fleet_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth delete fleet_units" ON public.fleet_units FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth view incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth delete incidents" ON public.incidents FOR DELETE TO authenticated USING (true);
