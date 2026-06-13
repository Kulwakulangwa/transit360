// src/hooks/useData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type { Shipment, FleetUnit, Incident, ShipmentStatus } from '@/types';

const empty: never[] = [];

export function useShipments() {
  const q = useQuery({ queryKey: ['shipments'], queryFn: api.listShipments });
  return (q.data ?? empty) as Shipment[];
}

export function useFleet() {
  const q = useQuery({ queryKey: ['fleet'], queryFn: api.listFleet });
  return (q.data ?? empty) as FleetUnit[];
}

export function useIncidents() {
  const q = useQuery({ queryKey: ['incidents'], queryFn: api.listIncidents });
  return (q.data ?? empty) as Incident[];
}

export function useShipmentMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['shipments'] });

  const add = useMutation({ mutationFn: api.insertShipment, onSuccess: inv });
  const upd = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) =>
      api.updateShipmentStatus(id, status),
    onSuccess: inv,
  });
  // ✅ Add delete mutation
  const del = useMutation({
    mutationFn: api.deleteShipment,
    onSuccess: inv,
  });

  return {
    addShipment: (s: Shipment) => add.mutate(s),
    updateShipmentStatus: (id: string, status: ShipmentStatus) => upd.mutate({ id, status }),
    deleteShipment: (id: string) => del.mutate(id), // 👈 new
  };
}

export function useFleetMutations() {
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: api.insertFleet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fleet'] }),
  });
  return { addFleetUnit: (u: FleetUnit) => add.mutate(u) };
}

export function useIncidentMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['incidents'] });
  const add = useMutation({ mutationFn: api.insertIncident, onSuccess: inv });
  const resolve = useMutation({ mutationFn: api.resolveIncident, onSuccess: inv });
  return {
    addIncident: (i: Incident) => add.mutate(i),
    resolveIncident: (id: string) => resolve.mutate(id),
  };
}
