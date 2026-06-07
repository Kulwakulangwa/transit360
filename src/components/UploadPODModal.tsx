import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PODStatus } from '../types';

interface Props {
  onClose: () => void;
  onUpload: () => void;
}

const STATUSES: PODStatus[] = ['Pending', 'Uploaded', 'Verified', 'Rejected'];

const TANZANIAN_CITIES = [
  'Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro',
  'Tanga', 'Kilimanjaro', 'Zanzibar', 'Kigoma', 'Tabora', 'Iringa',
];

const EAST_AFRICAN_CITIES = [
  ...TANZANIAN_CITIES,
  'Nairobi', 'Mombasa', 'Kisumu (Kenya)', 'Kampala', 'Entebbe (Uganda)',
  'Kigali (Rwanda)', 'Bujumbura (Burundi)', 'Lusaka (Zambia)', 'Lilongwe (Malawi)',
];

export function UploadPODModal({ onClose, onUpload }: Props) {
  const [form, setForm] = useState({
    bl_number: '',
    shipment_ref: '',
    customer_name: '',
    origin: 'Dar es Salaam',
    destination: '',
    delivery_date: new Date().toISOString().split('T')[0],
    pod_status: 'Uploaded' as PODStatus,
    uploaded_by: 'Operations Lead',
    uploaded_at: new Date().toISOString().split('T')[0],
    file_reference: '',
    recipient_name: '',
    recipient_signature: '',
    condition_notes: '',
    rejection_reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.bl_number || !form.customer_name || !form.destination) return;
    setLoading(true);
    const { error } = await supabase
      .from('pods')
      .insert([{ ...form }]);
    if (!error) onUpload();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Upload POD</h3>
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
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Shipment Ref</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.shipment_ref}
                onChange={e => setForm({ ...form, shipment_ref: e.target.value })}
                placeholder="SHP-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Customer Name *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.customer_name}
              onChange={e => setForm({ ...form, customer_name: e.target.value })}
              placeholder="Acme Trading Co."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Origin</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.origin}
                onChange={e => setForm({ ...form, origin: e.target.value })}
              >
                {EAST_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Destination *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                required
              >
                <option value="">Select destination</option>
                {EAST_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Delivery Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.delivery_date}
                onChange={e => setForm({ ...form, delivery_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.pod_status}
                onChange={e => setForm({ ...form, pod_status: e.target.value as PODStatus })}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Recipient Name</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.recipient_name}
                onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                placeholder="John Mwangi"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Signature Captured</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.recipient_signature}
                onChange={e => setForm({ ...form, recipient_signature: e.target.value })}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Electronic">Electronic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">File/Document Reference</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={form.file_reference}
              onChange={e => setForm({ ...form, file_reference: e.target.value })}
              placeholder="DOC-POD-2024-001.pdf"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Condition Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.condition_notes}
              onChange={e => setForm({ ...form, condition_notes: e.target.value })}
              placeholder="Goods received in good condition..."
            />
          </div>

          {form.pod_status === 'Rejected' && (
            <div>
              <label className="block text-[10px] font-semibold text-red-500 mb-1">Rejection Reason *</label>
              <input
                className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 bg-red-50"
                value={form.rejection_reason}
                onChange={e => setForm({ ...form, rejection_reason: e.target.value })}
                placeholder="Invalid signature"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Additional Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional notes..."
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
              disabled={!form.bl_number || !form.customer_name || !form.destination || loading || (form.pod_status === 'Rejected' && !form.rejection_reason)}
              className="px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload POD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}