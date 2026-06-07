import { useState } from 'react';
import type { Driver, DriverStatus } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (d: Omit<Driver, 'id' | 'created_at'>) => void;
  saving: boolean;
}

const STATUSES: DriverStatus[] = ['Active', 'On Leave', 'Suspended', 'Inactive'];

export function AddDriverModal({ onClose, onAdd, saving }: Props) {
  const [form, setForm] = useState({
    full_name: '',
    id_number: '',
    license_number: '',
    license_expiry: '',
    phone: '',
    email: '',
    nationality: '',
    status: 'Active' as DriverStatus,
    current_assignment: '',
    current_location: '',
    total_trips: '0',
    medical_expiry: '',
    notes: '',
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name) return;
    onAdd({
      ...form,
      total_trips: Number(form.total_trips) || 0,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[580px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add New Driver</h3>
            <p className="text-xs text-gray-400 mt-0.5">Enter the driver's details and compliance documents</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Personal info */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Personal Information</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.full_name} onChange={v => set('full_name', v)} placeholder="e.g. John Mwangi" />
              <Field label="ID Number" value={form.id_number} onChange={v => set('id_number', v)} placeholder="e.g. TZ-1234567" />
              <Field label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="e.g. +255 712 345 678" />
              <Field label="Email" value={form.email} onChange={v => set('email', v)} placeholder="e.g. john@company.com" />
              <Field label="Nationality" value={form.nationality} onChange={v => set('nationality', v)} placeholder="e.g. Tanzanian" />
              <Field label="Status" type="select" value={form.status} onChange={v => set('status', v)} options={STATUSES} />
            </div>
          </div>

          {/* Compliance */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Compliance & Licensing</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="License Number" value={form.license_number} onChange={v => set('license_number', v)} placeholder="e.g. DL-TZ-98765" />
              <Field label="License Expiry" value={form.license_expiry} onChange={v => set('license_expiry', v)} placeholder="e.g. 31 Dec 2026" />
              <Field label="Medical Certificate Expiry" value={form.medical_expiry} onChange={v => set('medical_expiry', v)} placeholder="e.g. 30 Jun 2025" />
              <Field label="Total Trips" type="number" value={form.total_trips} onChange={v => set('total_trips', v)} placeholder="0" />
            </div>
          </div>

          {/* Assignment */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Assignment</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned BL / Truck" value={form.current_assignment} onChange={v => set('current_assignment', v)} placeholder="e.g. BL-2024-001" />
              <Field label="Current Location" value={form.current_location} onChange={v => set('current_location', v)} placeholder="e.g. Nakuru, Kenya" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional notes..."
            />
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
              {saving ? 'Saving…' : 'Add Driver'}
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
        <input type={type} className={base} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}
