import { createFileRoute } from '@tanstack/react-router';
import { Tracking } from '@/pages/Tracking';

export const Route = createFileRoute('/_authenticated/tracking')({
  component: Tracking,
});
