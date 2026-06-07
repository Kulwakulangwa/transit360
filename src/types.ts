export type ShipmentStatus = 'In Transit' | 'Delayed' | 'Border Hold' | 'Delivered' | 'Loading';
export type IncidentSeverity = 'Critical' | 'Warning' | 'Info';
export type FleetStatus = 'Active' | 'Maintenance' | 'Offline';

export interface Shipment {
  id: string;
  blNumber: string;
  origin: string;
  destination: string;
  transporter: string;
  driver: string;
  status: ShipmentStatus;
  eta: string;
  weight: string;
  containers: string;
  detentionCost: number;
  costFuel: number;
  costDetention: number;
  costCustoms: number;
  podUploaded: boolean;
  invoiceUploaded: boolean;
  customsUploaded: boolean;
  notes: string;
}

export interface TripRecord {
  blNumber: string;
  from: string;
  to: string;
  date: string;
  status: ShipmentStatus;
}

export interface FleetUnit {
  id: string;
  unitNumber: string;
  driverName: string;
  driverInitials: string;
  status: FleetStatus;
  location: string;
  nextMaintenance: string;
  gpsLastSeen: string;
  totalTrips: number;
  tripHistory: TripRecord[];
  incidents: string[];
}

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  blNumber: string;
  reportedAt: string;
  resolved: boolean;
}

export type ContainerStatus = 'Available' | 'In Use' | 'In Transit' | 'At Port' | 'Maintenance';
export type ContainerType = '20ft' | '40ft' | '40ft HC' | '45ft';

export interface Container {
  id: string;
  container_number: string;
  type: ContainerType;
  status: ContainerStatus;
  location: string;
  bl_number: string;
  arrival_date: string;
  departure_date: string;
  owner: string;
  seal_number: string;
  notes: string;
  created_at?: string;
}

export type DriverStatus = 'Active' | 'On Leave' | 'Suspended' | 'Inactive';

export interface Driver {
  id: string;
  full_name: string;
  id_number: string;
  license_number: string;
  license_expiry: string;
  phone: string;
  email: string;
  nationality: string;
  status: DriverStatus;
  current_assignment: string;
  current_location: string;
  total_trips: number;
  medical_expiry: string;
  notes: string;
  created_at?: string;
}

export type TrackingEventType =
  | 'Departure' | 'Arrival' | 'Border Crossing' | 'Checkpoint' | 'Delay'
  | 'Breakdown' | 'Customs Clearance' | 'Delivery' | 'Update';

export interface TrackingEvent {
  id: string;
  bl_number: string;
  shipment_ref: string;
  event_type: TrackingEventType;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  driver_name: string;
  truck_unit: string;
  status: string;
  recorded_at: string;
  created_at?: string;
}

export type BorderStatus = 'Pending' | 'In Clearance' | 'Cleared' | 'Hold' | 'Rejected';
export type BorderDirection = 'Export' | 'Import';

export interface BorderCrossing {
  id: string;
  bl_number: string;
  border_point: string;
  direction: BorderDirection;
  status: BorderStatus;
  crossing_date: string;
  clearance_date: string;
  truck_unit: string;
  driver_name: string;
  customs_agent: string;
  documents: string;
  fees: number;
  notes: string;
  hold_reason: string;
  created_at?: string;
}

export type PODStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';

export interface POD {
  id: string;
  bl_number: string;
  shipment_ref: string;
  customer_name: string;
  origin: string;
  destination: string;
  delivery_date: string;
  pod_status: PODStatus;
  uploaded_by: string;
  uploaded_at: string;
  verified_by: string;
  verified_at: string;
  file_reference: string;
  recipient_name: string;
  recipient_signature: string;
  condition_notes: string;
  rejection_reason: string;
  notes: string;
  created_at?: string;
}

export type CostCategory = 'Transportation' | 'Fuel' | 'Customs' | 'Detention' | 'Handling' | 'Storage' | 'Insurance' | 'Other';
export type PaymentStatus = 'Pending' | 'Paid' | 'Invoiced' | 'Disputed';

export interface Cost {
  id: string;
  bl_number: string;
  cost_type: string;
  category: CostCategory;
  amount: number;
  currency: string;
  vendor: string;
  vendor_invoice: string;
  paid_by: string;
  payment_status: PaymentStatus;
  payment_date: string;
  payment_reference: string;
  notes: string;
  created_at?: string;
}

export type ClaimStatus = 'Open' | 'In Review' | 'Approved' | 'Rejected' | 'Settled';
export type ClaimPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ClaimType = 'Damage' | 'Loss' | 'Delay' | 'Shortage' | 'Documentation' | 'Other';

export interface Claim {
  id: string;
  claim_number: string;
  bl_number: string;
  customer_name: string;
  claim_type: ClaimType;
  status: ClaimStatus;
  priority: ClaimPriority;
  incident_date: string;
  reported_date: string;
  resolved_date: string;
  description: string;
  claim_amount: number;
  settled_amount: number;
  currency: string;
  assigned_to: string;
  resolution_notes: string;
  documents: string;
  created_at?: string;
}

export type CustomerStatus = 'Active' | 'Inactive' | 'Suspended';
export type CustomerType = 'Regular' | 'Premium' | 'VIP';

export interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  customer_type: CustomerType;
  payment_terms: string;
  credit_limit: number;
  current_balance: number;
  total_shipments: number;
  status: CustomerStatus;
  notes: string;
  created_at?: string;
}

export type PageId =
  | 'dashboard' | 'shipments' | 'containers' | 'fleet' | 'drivers'
  | 'tracking' | 'gps' | 'incidents' | 'borders' | 'pods' | 'documents'
  | 'costs' | 'claims' | 'customers' | 'analytics' | 'reports'
  | 'settings' | 'admin';
