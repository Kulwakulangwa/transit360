import { createFileRoute } from '@tanstack/react-router';
import { Fleet } from '@/pages/Fleet';
import { useFleet, useFleetMutations } from '@/hooks/useData';

export const Route = createFileRoute('/_authenticated/fleet')({
  component: () => <Fleet fleet={useFleet()} onAdd={useFleetMutations().addFleetUnit} />,
});
