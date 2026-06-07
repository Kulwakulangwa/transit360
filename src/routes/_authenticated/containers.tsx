import { createFileRoute } from '@tanstack/react-router';
import { Containers } from '@/pages/Containers';

export const Route = createFileRoute('/_authenticated/containers')({
  component: Containers,
});
