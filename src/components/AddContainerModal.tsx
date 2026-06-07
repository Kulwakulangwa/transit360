import { useState } from 'react';
import type { Container, ContainerStatus, ContainerType } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (c: Omit<Container, 'id' | 'created_at'>) => void;
  saving: boolean;
}

const STATUSES: ContainerStatus[] = ['Available', 'In Use', 'In Transit', 'At Port', 'Maintenance'];
const TYPES: ContainerType[] = ['20ft', '40ft', '40ft HC', '45ft'];

export function AddContainerModal({ onClose, onAdd, saving }: Props) {
  const [form, setForm] = useState({
    container_number: '',
    type: '40ft' as ContainerType,
    status: 'Available' as ContainerStatus,
    location: '',
    bl_number: '',
    arrival_date: '',
    departure_date: '',
    owner: '',
    seal_number: '',
    notes: '',
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.container_number) return;
    onAdd(form);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Add New Container</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the container details below</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Container Number *" value={form.container_number} onChange={v => set('container_number', v)} placeholder="e.g. MSCU1234567" />
            <Field label="Type" type="select" value={form.type} onChange={v => set('type', v)} options={TYPES} />
            <Field label="Status" type="select" value={form.status} onChange={v => set('status', v)} options={STATUSES} />
            <Field label="Current Location" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Dar es Salaam Port" />
            <Field label="Associated BL #" value={form.bl_number} onChange={v => set('bl_number', v)} placeholder="e.g. BL-2024-001" />
            <Field label="Seal Number" value={form.seal_number} onChange={v => set('seal_number', v)} placeholder="e.g. SEAL-9876" />
            <Field label="Owner / Leasing Company" value={form.owner} onChange={v => set('owner', v)} placeholder="e.g. Maersk" />
            <div />
            <Field label="Arrival Date" value={form.arrival_date} onChange={v => set('arrival_date', v)} placeholder="e.g. 10 Jan 2025" />
            <Field label="Departure Date" value={form.departure_date} onChange={v => set('departure_date', v)} placeholder="e.g. 15 Jan 2025" />
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
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {saving ? 'Saving…' : 'Add Container'}
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
