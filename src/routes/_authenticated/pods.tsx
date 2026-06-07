import { createFileRoute } from '@tanstack/react-router';
import { PODs } from '@/pages/PODs';

export const Route = createFileRoute('/_authenticated/pods')({
  component: PODs,
});
