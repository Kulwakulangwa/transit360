import { useState } from 'react';
import type { Shipment, ShipmentStatus } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (s: Shipment) => void;
}

const STATUSES: ShipmentStatus[] = ['In Transit', 'Delayed', 'Border Hold', 'Delivered', 'Loading'];

export function AddShipmentModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    blNumber: '', origin: '', destination: '', transporter: '', driver: '',
    status: 'In Transit' as ShipmentStatus, eta: '', weight: '', containers: '',
    detentionCost: '', costFuel: '', costDetention: '', costCustoms: '', notes: '',
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.blNumber || !form.origin || !form.destination) return;
    onAdd({
      id: crypto.randomUUID(),
      blNumber: form.blNumber,
      origin: form.origin,
      destination: form.destination,
      transporter: form.transporter,
      driver: form.driver,
      status: form.status,
      eta: form.eta,
      weight: form.weight,
      containers: form.containers,
      detentionCost: Number(form.detentionCost) || 0,
      costFuel: Number(form.costFuel) || 0,
      costDetention: Number(form.costDetention) || 0,
      costCustoms: Number(form.costCustoms) || 0,
      podUploaded: false,
      invoiceUploaded: false,
      customsUploaded: false,
      notes: form.notes,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[540px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">Add New Shipment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="BL Number *" value={form.blNumber} onChange={v => set('blNumber', v)} placeholder="e.g. BL-2024-001" />
            <Field label="Status" type="select" value={form.status} onChange={v => set('status', v as ShipmentStatus)} options={STATUSES} />
            <Field label="Origin *" value={form.origin} onChange={v => set('origin', v)} placeholder="e.g. Dar es Salaam" />
            <Field label="Destination *" value={form.destination} onChange={v => set('destination', v)} placeholder="e.g. Kasumbalesa" />
            <Field label="Transporter" value={form.transporter} onChange={v => set('transporter', v)} placeholder="Company name" />
            <Field label="Driver" value={form.driver} onChange={v => set('driver', v)} placeholder="Driver name" />
            <Field label="ETA" value={form.eta} onChange={v => set('eta', v)} placeholder="e.g. 15 Jan 2025" />
            <Field label="Weight" value={form.weight} onChange={v => set('weight', v)} placeholder="e.g. 28,000 kg" />
            <Field label="Containers" value={form.containers} onChange={v => set('containers', v)} placeholder="e.g. 2 × 40ft" />
            <Field label="Detention Cost ($)" type="number" value={form.detentionCost} onChange={v => set('detentionCost', v)} placeholder="0" />
            <Field label="Fuel Cost ($)" type="number" value={form.costFuel} onChange={v => set('costFuel', v)} placeholder="0" />
            <Field label="Customs Cost ($)" type="number" value={form.costCustoms} onChange={v => set('costCustoms', v)} placeholder="0" />
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
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]">Add Shipment</button>
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
