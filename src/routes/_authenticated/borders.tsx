import { createFileRoute } from '@tanstack/react-router';
import { Borders } from '@/pages/Borders';

export const Route = createFileRoute('/_authenticated/borders')({
  component: Borders,
});
