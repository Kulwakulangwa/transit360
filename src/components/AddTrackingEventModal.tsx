import { useState } from 'react';
import type { TrackingEvent, TrackingEventType } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (e: Omit<TrackingEvent, 'id' | 'created_at'>) => void;
  saving: boolean;
  defaultBlNumber?: string;
}

const EVENT_TYPES: TrackingEventType[] = [
  'Departure', 'Arrival', 'Border Crossing', 'Checkpoint',
  'Delay', 'Breakdown', 'Customs Clearance', 'Delivery', 'Update',
];

const STATUSES = ['In Transit', 'Delayed', 'Border Hold', 'Delivered', 'Loading'];

const EVENT_ICONS: Record<TrackingEventType, string> = {
  Departure: 'ti-logout',
  Arrival: 'ti-login',
  'Border Crossing': 'ti-ban',
  Checkpoint: 'ti-map-pin',
  Delay: 'ti-clock-x',
  Breakdown: 'ti-tool',
  'Customs Clearance': 'ti-file-check',
  Delivery: 'ti-circle-check',
  Update: 'ti-refresh',
};

export { EVENT_ICONS };

export function AddTrackingEventModal({ onClose, onAdd, saving, defaultBlNumber = '' }: Props) {
  const now = new Date();
  const defaultTime = now.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const [form, setForm] = useState({
    bl_number: defaultBlNumber,
    shipment_ref: '',
    event_type: 'Checkpoint' as TrackingEventType,
    location: '',
    latitude: '',
    longitude: '',
    description: '',
    driver_name: '',
    truck_unit: '',
    status: 'In Transit',
    recorded_at: defaultTime,
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bl_number || !form.location) return;
    onAdd({
      ...form,
      event_type: form.event_type as TrackingEventType,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Log Tracking Event</h3>
            <p className="text-xs text-gray-400 mt-0.5">Record a movement update or checkpoint for a shipment</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Shipment ref */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipment Reference</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="BL Number *" value={form.bl_number} onChange={v => set('bl_number', v)} placeholder="e.g. BL-2024-001" />
              <Field label="Shipment Ref (optional)" value={form.shipment_ref} onChange={v => set('shipment_ref', v)} placeholder="e.g. REF-456" />
            </div>
          </div>

          {/* Event type selector */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Event Type</div>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('event_type', t)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    form.event_type === t
                      ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <i className={`ti ${EVENT_ICONS[t]} text-sm`} />{t}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location Name *" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Kasumbalesa Border" />
              <Field label="Status" type="select" value={form.status} onChange={v => set('status', v)} options={STATUSES} />
              <Field label="Latitude (optional)" value={form.latitude} onChange={v => set('latitude', v)} placeholder="e.g. -8.521" type="number" />
              <Field label="Longitude (optional)" value={form.longitude} onChange={v => set('longitude', v)} placeholder="e.g. 31.132" type="number" />
            </div>
          </div>

          {/* Assignment */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Driver &amp; Truck</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Driver Name" value={form.driver_name} onChange={v => set('driver_name', v)} placeholder="e.g. John Mwangi" />
              <Field label="Truck Unit" value={form.truck_unit} onChange={v => set('truck_unit', v)} placeholder="e.g. TRK-001" />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Details</div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="What happened at this checkpoint?"
              />
            </div>
            <Field label="Recorded At" value={form.recorded_at} onChange={v => set('recorded_at', v)} placeholder="e.g. 10 Jan 2025 14:30" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : 'Log Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text', options }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; options?: string[];
}) {
  const base = "w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === 'select' ? (
        <select className={base} value={value} onChange={e => onChange(e.target.value)}>
          {options?.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type === 'number' ? 'text' : type} className={base} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
