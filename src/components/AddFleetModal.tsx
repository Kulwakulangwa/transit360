import { useState } from 'react';
import type { FleetUnit, FleetStatus } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (u: FleetUnit) => void;
}

const STATUSES: FleetStatus[] = ['Active', 'Maintenance', 'Offline'];

export function AddFleetModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    unitNumber: '', driverName: '', status: 'Active' as FleetStatus,
    location: '', nextMaintenance: '', gpsLastSeen: 'Just now',
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.unitNumber || !form.driverName) return;
    const initials = form.driverName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    onAdd({
      id: crypto.randomUUID(),
      unitNumber: form.unitNumber,
      driverName: form.driverName,
      driverInitials: initials || 'DR',
      status: form.status,
      location: form.location || 'Unknown',
      nextMaintenance: form.nextMaintenance || 'Not set',
      gpsLastSeen: form.gpsLastSeen || 'Unknown',
      totalTrips: 0,
      tripHistory: [],
      incidents: [],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[440px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">Add Truck to Fleet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Unit Number *" value={form.unitNumber} onChange={v => set('unitNumber', v)} placeholder="e.g. TRK-001" />
            <Field label="Status" type="select" value={form.status} onChange={v => set('status', v as FleetStatus)} options={STATUSES} />
            <Field label="Driver Name *" value={form.driverName} onChange={v => set('driverName', v)} placeholder="Full name" />
            <Field label="Current Location" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Dar es Salaam" />
            <Field label="Next Maintenance" value={form.nextMaintenance} onChange={v => set('nextMaintenance', v)} placeholder="e.g. 20 Jan 2025" />
            <Field label="GPS Last Seen" value={form.gpsLastSeen} onChange={v => set('gpsLastSeen', v)} placeholder="e.g. 5 min ago" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]">Add Truck</button>
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
        <input type={type} className={base} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
