// src/lib/api/index.ts
import { supabase } from '../supabase';
import type { Shipment, FleetUnit, Incident, ShipmentStatus } from '@/types';

// ... existing exports (listShipments, insertShipment, etc.)

// ✅ Add this delete function
export async function deleteShipment(id: string) {
  const { error } = await supabase.from('shipments').delete().eq('id', id);
  if (error) throw error;
}

// Make sure other functions like listShipments, insertShipment etc. are also exported.
