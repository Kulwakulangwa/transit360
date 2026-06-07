import { createFileRoute } from '@tanstack/react-router';
import { Drivers } from '@/pages/Drivers';

export const Route = createFileRoute('/_authenticated/drivers')({
  component: Drivers,
});
