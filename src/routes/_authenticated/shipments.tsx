// src/routes/_authenticated/shipments.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Shipments } from '@/pages/Shipments';
import { useShipments, useShipmentMutations } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/shipments')({
  component: () => {
    const shipments = useShipments();   // returns array directly
    const m = useShipmentMutations();
    return (
      <Shipments
        shipments={shipments}
        onAdd={m.addShipment}
        onUpdateStatus={m.updateShipmentStatus}
        onDelete={m.deleteShipment}
      />
    );
  },
});
