import { createFileRoute } from '@tanstack/react-router';
import { Costs } from '@/pages/Costs';

export const Route = createFileRoute('/_authenticated/costs')({
  component: Costs,
});
