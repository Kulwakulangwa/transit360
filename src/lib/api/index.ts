// src/lib/api/index.ts
import { supabase } from '../supabase';
import type { Shipment, FleetUnit, Incident, ShipmentStatus } from '@/types';

// ========== Shipments ==========
export async function listShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertShipment(shipment: Shipment): Promise<Shipment> {
  const { data, error } = await supabase.from('shipments').insert(shipment).select().single();
  if (error) throw error;
  return data;
}

export async function updateShipmentStatus(id: string, status: ShipmentStatus): Promise<void> {
  const { error } = await supabase.from('shipments').update({ status }).eq('id', id);
  if (error) throw error;
}

// ✅ Add this delete function
export async function deleteShipment(id: string): Promise<void> {
  const { error } = await supabase.from('shipments').delete().eq('id', id);
  if (error) throw error;
}

// ========== Fleet ==========
export async function listFleet(): Promise<FleetUnit[]> {
  const { data, error } = await supabase.from('fleet').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function insertFleet(unit: FleetUnit): Promise<FleetUnit> {
  const { data, error } = await supabase.from('fleet').insert(unit).select().single();
  if (error) throw error;
  return data;
}

// ========== Incidents ==========
export async function listIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase.from('incidents').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function insertIncident(incident: Incident): Promise<Incident> {
  const { data, error } = await supabase.from('incidents').insert(incident).select().single();
  if (error) throw error;
  return data;
}

export async function resolveIncident(id: string): Promise<void> {
  const { error } = await supabase.from('incidents').update({ resolved: true }).eq('id', id);
  if (error) throw error;
}
