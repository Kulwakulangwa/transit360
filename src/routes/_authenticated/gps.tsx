import { createFileRoute } from '@tanstack/react-router';
import { GpsMonitor } from '@/pages/GpsMonitor';
import { useFleet } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/gps')({
  component: () => <GpsMonitor fleet={useFleet()} />,
});
