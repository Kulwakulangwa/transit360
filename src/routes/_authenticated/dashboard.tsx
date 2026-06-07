import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Dashboard } from '@/pages/Dashboard';
import { useShipments, useFleet, useIncidents } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: () => {
    const navigate = useNavigate();
    return <Dashboard
      shipments={useShipments()} fleet={useFleet()} incidents={useIncidents()}
      onNavigate={(id) => navigate({ to: `/${id}` as any })}
    />;
  },
});
