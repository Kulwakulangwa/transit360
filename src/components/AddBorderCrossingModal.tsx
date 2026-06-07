import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BorderStatus, BorderDirection } from '../types';

interface Props {
  onClose: () => void;
  onAdd: () => void;
}

const STATUSES: BorderStatus[] = ['Pending', 'In Clearance', 'Cleared', 'Hold', 'Rejected'];
const DIRECTIONS: BorderDirection[] = ['Export', 'Import'];
const BORDER_POINTS = [
  // East Africa - Tanzania borders
  'Namanga (Tanzania-Kenya)',
  'Holili (Tanzania-Kenya)',
  'Horohoro (Tanzania-Kenya)',
  'Sirari (Tanzania-Kenya)',
  'Mutukula (Tanzania-Uganda)',
  'Kobero (Tanzania-Burundi)',
  'Kasumulu (Tanzania-Malawi)',
  'Tunduma (Tanzania-Zambia)',
  'Mtukula (Tanzania-Rwanda)',
  'Rusumo (Tanzania-Rwanda)',
  // East Africa - Other key crossings
  'Malaba (Kenya-Uganda)',
  'Busia (Kenya-Uganda)',
  'Gulu (Uganda-South Sudan)',
  'Moyale (Kenya-Ethiopia)',
  'Garissa (Kenya-Somalia)',
  // West Africa
  'Seme-Kraké (Nigeria-Benin)',
  'Idi-Iroko (Nigeria-Benin)',
  'Jibiya (Nigeria-Niger)',
  'Illela (Nigeria-Niger)',
  'Banki (Nigeria-Cameroon)',
  'Aflao (Ghana-Togo)',
  'Noe (Ghana-Côte d\'Ivoire)',
  'Paga (Ghana-Burkina Faso)',
];

export function AddBorderCrossingModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    bl_number: '',
    border_point: '',
    direction: 'Export' as BorderDirection,
    status: 'Pending' as BorderStatus,
    crossing_date: new Date().toISOString().split('T')[0],
    clearance_date: '',
    truck_unit: '',
    driver_name: '',
    customs_agent: '',
    documents: '',
    fees: 0,
    notes: '',
    hold_reason: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bl_number || !form.border_point) return;
    setLoading(true);
    const { error } = await supabase
      .from('border_crossings')
      .insert([{ ...form, fees: Number(form.fees) }]);
    if (!error) onAdd();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Border Crossing</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">BL Number *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.bl_number}
                onChange={e => setForm({ ...form, bl_number: e.target.value })}
                placeholder="BL-2024-001"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Direction *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.direction}
                onChange={e => setForm({ ...form, direction: e.target.value as BorderDirection })}
              >
                {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Border Point *</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.border_point}
              onChange={e => setForm({ ...form, border_point: e.target.value })}
              required
            >
              <option value="">Select border point</option>
              {BORDER_POINTS.map(bp => <option key={bp} value={bp}>{bp}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as BorderStatus })}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Crossing Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.crossing_date}
                onChange={e => setForm({ ...form, crossing_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Truck Unit</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.truck_unit}
                onChange={e => setForm({ ...form, truck_unit: e.target.value })}
                placeholder="TRK-001"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Driver Name</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.driver_name}
                onChange={e => setForm({ ...form, driver_name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Customs Agent</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.customs_agent}
                onChange={e => setForm({ ...form, customs_agent: e.target.value })}
                placeholder="ABC Customs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Customs Fees ($)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.fees}
                onChange={e => setForm({ ...form, fees: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Documents</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.documents}
              onChange={e => setForm({ ...form, documents: e.target.value })}
              placeholder="Bill of Lading, Commercial Invoice, Customs Declaration"
            />
          </div>

          {form.status === 'Hold' && (
            <div>
              <label className="block text-[10px] font-semibold text-red-500 mb-1">Hold Reason *</label>
              <input
                className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 bg-red-50"
                value={form.hold_reason}
                onChange={e => setForm({ ...form, hold_reason: e.target.value })}
                placeholder="Missing documentation"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.bl_number || !form.border_point || loading || (form.status === 'Hold' && !form.hold_reason)}
              className="px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Crossing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}