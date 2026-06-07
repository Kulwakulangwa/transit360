import { createFileRoute } from '@tanstack/react-router';
import { Incidents } from '@/pages/Incidents';
import { useIncidents, useIncidentMutations } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/incidents')({
  component: () => {
    const m = useIncidentMutations();
    return <Incidents incidents={useIncidents()} onResolve={m.resolveIncident} onAdd={m.addIncident} />;
  },
});
