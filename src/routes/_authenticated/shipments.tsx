import { createFileRoute } from '@tanstack/react-router';
import ShipmentsPage from '../pages/Shipments';   // <-- change from 'ShipmentsPage' to 'Shipments'

export const Route = createFileRoute('/_authenticated/shipments')({
  component: ShipmentsPage,
});
