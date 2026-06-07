import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Cost, CostCategory, PaymentStatus } from '../types';

const CATEGORY_CONFIG: Record<CostCategory, { color: string; bg: string }> = {
  Transportation: { color: 'text-blue-700', bg: 'bg-blue-100' },
  Fuel: { color: 'text-amber-700', bg: 'bg-amber-100' },
  Customs: { color: 'text-purple-700', bg: 'bg-purple-100' },
  Detention: { color: 'text-red-700', bg: 'bg-red-100' },
  Handling: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  Storage: { color: 'text-cyan-700', bg: 'bg-cyan-100' },
  Insurance: { color: 'text-indigo-700', bg: 'bg-indigo-100' },
  Other: { color: 'text-gray-700', bg: 'bg-gray-100' },
};

const PAYMENT_CONFIG: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Invoiced: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  Paid: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Disputed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const CATEGORIES: CostCategory[] = ['Transportation', 'Fuel', 'Customs', 'Detention', 'Handling', 'Storage', 'Insurance', 'Other'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Invoiced', 'Paid', 'Disputed'];
const CATEGORY_FILTERS: (CostCategory | 'All')[] = ['All', ...CATEGORIES];
const PAYMENT_FILTERS: (PaymentStatus | 'All')[] = ['All', ...PAYMENT_STATUSES];

export function Costs() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CostCategory | 'All'>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cost | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchCosts(); }, []);

  async function fetchCosts() {
    setLoading(true);
    const { data, error } = await supabase.from('costs').select('*').order('created_at', { ascending: false });
    if (!error && data) setCosts(data as Cost[]);
    setLoading(false);
  }

  async function updatePaymentStatus(id: string, payment_status: PaymentStatus, payment_date: string, payment_reference: string) {
    const { error } = await supabase.from('costs').update({ payment_status, payment_date, payment_reference }).eq('id', id);
    if (!error) {
      setCosts(prev => prev.map(c => c.id === id ? { ...c, payment_status, payment_date, payment_reference } : c));
      setSelected(prev => prev?.id === id ? { ...prev, payment_status, payment_date, payment_reference } : prev);
    }
  }

  const filtered = costs.filter(c => {
    const matchCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchPay = paymentFilter === 'All' || c.payment_status === paymentFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.bl_number.toLowerCase().includes(q) || c.vendor.toLowerCase().includes(q);
    return matchCat && matchPay && matchSearch;
  });

  const totalAmount = costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingAmount = costs.filter(c => c.payment_status === 'Pending').reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = costs.filter(c => c.payment_status === 'Paid').reduce((sum, c) => sum + Number(c.amount), 0);
  const disputedAmount = costs.filter(c => c.payment_status === 'Disputed').reduce((sum, c) => sum + Number(c.amount), 0);

  async function handleAddCost(form: Partial<Cost>) {
    const { error } = await supabase.from('costs').insert([form]);
    if (!error) { setShowAdd(false); fetchCosts(); }
  }

  return (
    <div className="p-4">
      {showAdd && <AddCostModal onClose={() => setShowAdd(false)} onAdd={handleAddCost} />}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selected.cost_type || 'Cost Entry'}</h3>
                <p className="text-xs text-gray-500 mt-0.5">BL # {selected.bl_number || 'N/A'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2 pi-1 rounded text-xs font-medium ${CATEGORY_CONFIG[selected.category]?.bg || 'bg-gray-100'} ${CATEGORY_CONFIG[selected.category]?.color || 'text-gray-700'}`}>
                {selected.category}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_CONFIG[selected.payment_status].bg} ${PAYMENT_CONFIG[selected.payment_status].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PAYMENT_CONFIG[selected.payment_status].dot}`} />{selected.payment_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['Amount', `${selected.currency} ${Number(selected.amount).toLocaleString()}`],
                ['Vendor', selected.vendor || '—'],
                ['Vendor Invoice', selected.vendor_invoice || '—'],
                ['Paid By', selected.paid_by || '—'],
                ['Payment Date', selected.payment_date || '—'],
                ['Reference', selected.payment_reference || '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {selected.payment_status !== 'Paid' && (
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mark as Paid</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePaymentStatus(selected.id, 'Paid', new Date().toISOString().split('T')[0], `PAY-${Date.now()}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                  >
                    <i className="ti ti-circle-check text-sm" /> Mark Paid
                  </button>
                </div>
              </div>
            )}

            {selected.notes && (
              <div className="mt-4 p-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50 text-xs text-gray-600">
                <span className="font-semibold text-amber-700 block mb-0.5">Notes</span>
                {selected.notes}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Cost Management</div>
          <div className="text-xs text-gray-500 mt-0.5">{costs.length} cost entries</div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors">
          <i className="ti ti-plus text-sm" /> Add Cost
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Total', totalAmount, '#0F4C81', 'bg-blue-100'],
          ['Pending', pendingAmount, '#F08C00', 'bg-amber-100'],
          ['Paid', paidAmount, '#2F9E44', 'bg-green-100'],
          ['Disputed', disputedAmount, '#E03131', 'bg-red-100'],
        ].map(([label, amount, color, bg]) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <div className="text-[10px] text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-semibold" style={{ color: color as string }}>${(amount as number).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {CATEGORY_FILTERS.map(f => (
            <button key={f} onClick={() => setCategoryFilter(f)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${categoryFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Search BL #, vendor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="py-12 text-center text-xs text-gray-400">Loading...</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['BL #', 'Type', 'Category', 'Amount', 'Vendor', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-xs text-gray-400">No costs found</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81]">{c.bl_number || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-800">{c.cost_type || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_CONFIG[c.category]?.bg || 'bg-gray-100'} ${CATEGORY_CONFIG[c.category]?.color || 'text-gray-700'}`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800">{c.currency} {Number(c.amount).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.vendor || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_CONFIG[c.payment_status].bg} ${PAYMENT_CONFIG[c.payment_status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${PAYMENT_CONFIG[c.payment_status].dot}`} />{c.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-gray-400 whitespace-nowrap">{c.payment_date || c.created_at?.split('T')[0] || '—'}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                        <i className="ti ti-file-text text-xs" /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AddCostModal({ onClose, onAdd }: { onClose: () => void; onAdd: (form: Partial<Cost>) => void }) {
  const [form, setForm] = useState({
    bl_number: '', cost_type: '', category: 'Transportation' as CostCategory,
    amount: 0, currency: 'USD', vendor: '', vendor_invoice: '',
    paid_by: '', payment_status: 'Pending' as PaymentStatus,
    payment_date: '', payment_reference: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cost_type || !form.amount) return;
    setLoading(true);
    await onAdd(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Cost Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">BL Number</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.bl_number} onChange={e => setForm({ ...form, bl_number: e.target.value })} placeholder="BL-2024-001" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Cost Type *</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.cost_type} onChange={e => setForm({ ...form, cost_type: e.target.value })} placeholder="Fuel Surcharge" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Category</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as CostCategory })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount *</label>
              <div className="flex gap-2">
                <select className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD</option>
                  <option value="TZS">TZS</option>
                  <option value="KES">KES</option>
                  <option value="EUR">EUR</option>
                </select>
                <input type="number" min={0} className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0" required />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Vendor</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="ABC Logistics" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Vendor Invoice</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.vendor_invoice} onChange={e => setForm({ ...form, vendor_invoice: e.target.value })} placeholder="INV-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Status</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value as PaymentStatus })}>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Paid By</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.paid_by} onChange={e => setForm({ ...form, paid_by: e.target.value })} placeholder="Customer / Company" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={!form.cost_type || !form.amount || loading} className="px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Cost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}