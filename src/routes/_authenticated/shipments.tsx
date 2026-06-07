import { createFileRoute } from '@tanstack/react-router';
import { Shipments } from '@/pages/Shipments';
import { useShipments, useShipmentMutations } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/shipments')({
  component: () => {
    const m = useShipmentMutations();
    return <Shipments shipments={useShipments()} onAdd={m.addShipment} onUpdateStatus={m.updateShipmentStatus} />;
  },
});
