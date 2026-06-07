import { createFileRoute } from '@tanstack/react-router';
import { Analytics } from '@/pages/Analytics';
import { useShipments } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/analytics')({
  component: () => <Analytics shipments={useShipments()} />,
});
