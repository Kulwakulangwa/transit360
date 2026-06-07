import { useState, useCallback } from 'react';
import type { Shipment, FleetUnit, Incident } from './types';

export function useStore() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [fleet, setFleet] = useState<FleetUnit[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const updateShipmentStatus = useCallback((id: string, status: Shipment['status']) => {
    setShipments(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }, []);

  const addShipment = useCallback((s: Shipment) => {
    setShipments(prev => [s, ...prev]);
  }, []);

  const addFleetUnit = useCallback((u: FleetUnit) => {
    setFleet(prev => [u, ...prev]);
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
  }, []);

  const addIncident = useCallback((inc: Incident) => {
    setIncidents(prev => [inc, ...prev]);
  }, []);

  return { shipments, fleet, incidents, updateShipmentStatus, addShipment, addFleetUnit, resolveIncident, addIncident };
}
