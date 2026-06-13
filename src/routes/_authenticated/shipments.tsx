import { createFileRoute } from '@tanstack/react-router';
import ShipmentsPage from '../pages/ShipmentsPage';

export const Route = createFileRoute('/_authenticated/shipments')({
  component: ShipmentsPage,
});
