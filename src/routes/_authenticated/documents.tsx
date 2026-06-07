import { createFileRoute } from '@tanstack/react-router';
import { Documents } from '@/pages/Documents';

export const Route = createFileRoute('/_authenticated/documents')({
  component: Documents,
});
