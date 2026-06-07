import { createFileRoute } from '@tanstack/react-router';
import { Claims } from '@/pages/Claims';

export const Route = createFileRoute('/_authenticated/claims')({
  component: Claims,
});
