
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bl_number TEXT NOT NULL,
  origin TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL DEFAULT '',
  transporter TEXT NOT NULL DEFAULT '',
  driver TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Loading',
  eta TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  containers TEXT NOT NULL DEFAULT '',
  detention_cost NUMERIC NOT NULL DEFAULT 0,
  cost_fuel NUMERIC NOT NULL DEFAULT 0,
  cost_detention NUMERIC NOT NULL DEFAULT 0,
  cost_customs NUMERIC NOT NULL DEFAULT 0,
  pod_uploaded BOOLEAN NOT NULL DEFAULT false,
  invoice_uploaded BOOLEAN NOT NULL DEFAULT false,
  customs_uploaded BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shipments" ON public.shipments FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX shipments_owner_idx ON public.shipments(owner_id, created_at DESC);

CREATE TABLE public.fleet_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  driver_name TEXT NOT NULL DEFAULT '',
  driver_initials TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  location TEXT NOT NULL DEFAULT '',
  next_maintenance TEXT NOT NULL DEFAULT '',
  gps_last_seen TEXT NOT NULL DEFAULT '',
  total_trips INT NOT NULL DEFAULT 0,
  trip_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  incidents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_units TO authenticated;
GRANT ALL ON public.fleet_units TO service_role;
ALTER TABLE public.fleet_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fleet" ON public.fleet_units FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX fleet_owner_idx ON public.fleet_units(owner_id, created_at DESC);

CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'Info',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bl_number TEXT NOT NULL DEFAULT '',
  reported_at TEXT NOT NULL DEFAULT '',
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own incidents" ON public.incidents FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE INDEX incidents_owner_idx ON public.incidents(owner_id, created_at DESC);
