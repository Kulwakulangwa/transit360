export function useShipmentMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['shipments'] });
  
  const add = useMutation({ mutationFn: api.insertShipment, onSuccess: inv });
  const upd = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) =>
      api.updateShipmentStatus(id, status),
    onSuccess: inv,
  });
  // 👇 Add delete mutation
  const del = useMutation({
    mutationFn: api.deleteShipment,
    onSuccess: inv,
  });

  return {
    addShipment: (s: Shipment) => add.mutate(s),
    updateShipmentStatus: (id: string, status: ShipmentStatus) => upd.mutate({ id, status }),
    deleteShipment: (id: string) => del.mutate(id),   // 👈 new
  };
}
