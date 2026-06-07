import { supabase } from '@/integrations/supabase/client';
import type { Shipment, FleetUnit, Incident, ShipmentStatus } from '@/types';

// ---------- Shipments ----------
function rowToShipment(r: any): Shipment {
  return {
    id: r.id,
    blNumber: r.bl_number,
    origin: r.origin,
    destination: r.destination,
    transporter: r.transporter,
    driver: r.driver,
    status: r.status as ShipmentStatus,
    eta: r.eta,
    weight: r.weight,
    containers: r.containers,
    detentionCost: Number(r.detention_cost) || 0,
    costFuel: Number(r.cost_fuel) || 0,
    costDetention: Number(r.cost_detention) || 0,
    costCustoms: Number(r.cost_customs) || 0,
    podUploaded: r.pod_uploaded,
    invoiceUploaded: r.invoice_uploaded,
    customsUploaded: r.customs_uploaded,
    notes: r.notes ?? '',
  };
}

export async function listShipments(): Promise<Shipment[]> {
  const { data, error } = await (supabase as any)
    .from('shipments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToShipment);
}

export async function insertShipment(s: Shipment) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Not signed in');
  const { error } = await (supabase as any).from('shipments').insert({
    owner_id: u.user.id,
    bl_number: s.blNumber, origin: s.origin, destination: s.destination,
    transporter: s.transporter, driver: s.driver, status: s.status, eta: s.eta,
    weight: s.weight, containers: s.containers,
    detention_cost: s.detentionCost, cost_fuel: s.costFuel,
    cost_detention: s.costDetention, cost_customs: s.costCustoms,
    pod_uploaded: s.podUploaded, invoice_uploaded: s.invoiceUploaded,
    customs_uploaded: s.customsUploaded, notes: s.notes,
  });
  if (error) throw error;
}

export async function updateShipmentStatus(id: string, status: ShipmentStatus) {
  const { error } = await (supabase as any).from('shipments').update({ status }).eq('id', id);
  if (error) throw error;
}

// ---------- Fleet ----------
function rowToFleet(r: any): FleetUnit {
  return {
    id: r.id, unitNumber: r.unit_number, driverName: r.driver_name,
    driverInitials: r.driver_initials, status: r.status, location: r.location,
    nextMaintenance: r.next_maintenance, gpsLastSeen: r.gps_last_seen,
    totalTrips: r.total_trips, tripHistory: r.trip_history ?? [],
    incidents: r.incidents ?? [],
  };
}

export async function listFleet(): Promise<FleetUnit[]> {
  const { data, error } = await (supabase as any)
    .from('fleet_units').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToFleet);
}

export async function insertFleet(u: FleetUnit) {
  const { data: au } = await supabase.auth.getUser();
  if (!au.user) throw new Error('Not signed in');
  const { error } = await (supabase as any).from('fleet_units').insert({
    owner_id: au.user.id,
    unit_number: u.unitNumber, driver_name: u.driverName,
    driver_initials: u.driverInitials, status: u.status, location: u.location,
    next_maintenance: u.nextMaintenance, gps_last_seen: u.gpsLastSeen,
    total_trips: u.totalTrips, trip_history: u.tripHistory, incidents: u.incidents,
  });
  if (error) throw error;
}

// ---------- Incidents ----------
function rowToIncident(r: any): Incident {
  return {
    id: r.id, severity: r.severity, title: r.title, description: r.description,
    blNumber: r.bl_number, reportedAt: r.reported_at, resolved: r.resolved,
  };
}

export async function listIncidents(): Promise<Incident[]> {
  const { data, error } = await (supabase as any)
    .from('incidents').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToIncident);
}

export async function insertIncident(i: Incident) {
  const { data: au } = await supabase.auth.getUser();
  if (!au.user) throw new Error('Not signed in');
  const { error } = await (supabase as any).from('incidents').insert({
    owner_id: au.user.id,
    severity: i.severity, title: i.title, description: i.description,
    bl_number: i.blNumber, reported_at: i.reportedAt, resolved: i.resolved,
  });
  if (error) throw error;
}

export async function resolveIncident(id: string) {
  const { error } = await (supabase as any).from('incidents').update({ resolved: true }).eq('id', id);
  if (error) throw error;
}
