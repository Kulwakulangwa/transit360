import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shipments } from '../components/Shipments';
import type { Shipment, ShipmentStatus } from '../types';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setShipments(data);
    setLoading(false);
  };

  useEffect(() => { loadShipments(); }, []);

  const addShipment = async (newShipment: Shipment) => {
    const { data, error } = await supabase
      .from('shipments')
      .insert([newShipment])
      .select()
      .single();
    if (error) {
      alert('Add failed: ' + error.message);
      return;
    }
    setShipments(prev => [data, ...prev]);
  };

  const updateShipmentStatus = async (id: string, status: ShipmentStatus) => {
    const { error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('id', id);
    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }
    setShipments(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
  };

  const deleteShipment = async (id: string) => {
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
      return;
    }
    setShipments(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading shipments...</div>;

  return (
    <Shipments
      shipments={shipments}
      onAdd={addShipment}
      onUpdateStatus={updateShipmentStatus}
      onDelete={deleteShipment}
    />
  );
}
