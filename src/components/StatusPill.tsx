import type { ShipmentStatus, IncidentSeverity } from '../types';

const SHIP_COLORS: Record<ShipmentStatus, string> = {
  'In Transit': 'bg-blue-50 text-blue-700',
  'Delayed': 'bg-red-50 text-red-700',
  'Border Hold': 'bg-amber-50 text-amber-700',
  'Delivered': 'bg-green-50 text-green-700',
  'Loading': 'bg-purple-50 text-purple-700',
};

const INC_COLORS: Record<IncidentSeverity, string> = {
  Critical: 'bg-red-50 text-red-700',
  Warning: 'bg-amber-50 text-amber-700',
  Info: 'bg-blue-50 text-blue-700',
};

export function StatusPill({ status }: { status: ShipmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SHIP_COLORS[status]}`}>
      {status}
    </span>
  );
}

export function SeverityPill({ severity }: { severity: IncidentSeverity }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INC_COLORS[severity]}`}>
      {severity}
    </span>
  );
}
