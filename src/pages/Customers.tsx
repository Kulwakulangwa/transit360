import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, CustomerStatus, CustomerType } from '../types';

const STATUS_CONFIG: Record<CustomerStatus, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Inactive: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  Suspended: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const TYPE_CONFIG: Record<CustomerType, { bg: string; text: string }> = {
  Regular: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Premium: { bg: 'bg-blue-100', text: 'text-blue-700' },
  VIP: { bg: 'bg-amber-100', text: 'text-amber-700' },
};

const STATUSES: CustomerStatus[] = ['Active', 'Inactive', 'Suspended'];
const TYPES: CustomerType[] = ['Regular', 'Premium', 'VIP'];
const STATUS_FILTERS: (CustomerStatus | 'All')[] = ['All', ...STATUSES];
const TYPE_FILTERS: (CustomerType | 'All')[] = ['All', ...TYPES];

const AFRICAN_COUNTRIES = [
  'Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Zambia', 'Malawi',
  'Democratic Republic of Congo', 'Ethiopia', 'Somalia', 'South Sudan',
  'Nigeria', 'Ghana', 'Cameroon', 'South Africa', 'Egypt', 'Morocco',
];

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (!error && data) setCustomers(data as Customer[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: CustomerStatus) {
    const { error } = await supabase.from('customers').update({ status }).eq('id', id);
    if (!error) {
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    }
  }

  const filtered = customers.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchType = typeFilter === 'All' || c.customer_type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.company_name.toLowerCase().includes(q) || c.contact_person.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    return matchStatus && matchType && matchSearch;
  });

  const active = customers.filter(c => c.status === 'Active').length;
  const totalBalance = customers.reduce((sum, c) => sum + Number(c.current_balance), 0);
  const totalCredit = customers.reduce((sum, c) => sum + Number(c.credit_limit), 0);
  const totalShipments = customers.reduce((sum, c) => sum + (c.total_shipments || 0), 0);

  async function handleAddCustomer(form: Partial<Customer>) {
    const { error } = await supabase.from('customers').insert([form]);
    if (!error) { setShowAdd(false); fetchCustomers(); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this customer?')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setSelected(null);
    }
  }

  return (
    <div className="p-4">
      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onAdd={handleAddCustomer} />}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selected.company_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.contact_person}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"><i className="ti ti-trash mr-1" />Delete</button>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_CONFIG[selected.customer_type].bg} ${TYPE_CONFIG[selected.customer_type].text}`}>
                {selected.customer_type}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />{selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['Email', selected.email || '—'],
                ['Phone', selected.phone || '—'],
                ['City', selected.city || '—'],
                ['Country', selected.country || '—'],
                ['Payment Terms', selected.payment_terms || '—'],
                ['Credit Limit', `$${Number(selected.credit_limit).toLocaleString()}`],
                ['Current Balance', `$${Number(selected.current_balance).toLocaleString()}`],
                ['Total Shipments', selected.total_shipments || 0],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {selected.address && (
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Address</div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">{selected.address}</div>
              </div>
            )}

            {selected.notes && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50 text-xs text-gray-600">
                <span className="font-semibold text-amber-700 block mb-0.5">Notes</span>
                {selected.notes}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</div>
              <div className="flex gap-2">
                {STATUSES.filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${s === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : s === 'Inactive' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                    <i className={`ti ${s === 'Active' ? 'ti-check' : s === 'Inactive' ? 'ti-pause' : 'ti-ban'} text-sm`} />{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Customer Management</div>
          <div className="text-xs text-gray-500 mt-0.5">{customers.length} customers &middot; {active} active</div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors">
          <i className="ti ti-plus text-sm" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Active Customers', active, '#2F9E44', 'bg-green-100'],
          ['Total Balance', totalBalance, '#0F4C81', 'bg-blue-100'],
          ['Total Credit', totalCredit, '#F08C00', 'bg-amber-100'],
          ['Total Shipments', totalShipments, '#1C7ED6', 'bg-cyan-100'],
        ].map(([label, val, color, bg]) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <div className="text-[10px] text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-semibold" style={{ color: color as string }}>{label.toString().includes('Balance') || label.toString().includes('Credit') ? `$${(val as number).toLocaleString()}` : val}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${statusFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${typeFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48" placeholder="Search company, contact..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="py-12 text-center text-xs text-gray-400">Loading...</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Company', 'Contact', 'Type', 'Location', 'Credit Limit', 'Balance', 'Shipments', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-10 text-xs text-gray-400">No customers found</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800">{c.company_name}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs text-gray-800">{c.contact_person}</div>
                      <div className="text-[10px] text-gray-400">{c.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_CONFIG[c.customer_type].bg} ${TYPE_CONFIG[c.customer_type].text}`}>
                        {c.customer_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.city}, {c.country}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-800">${Number(c.credit_limit).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-xs font-semibold ${Number(c.current_balance) > 0 ? 'text-red-600' : 'text-gray-500'}">
                      {Number(c.current_balance) > 0 ? `$${Number(c.current_balance).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.total_shipments || 0}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[c.status].bg} ${STATUS_CONFIG[c.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[c.status].dot}`} />{c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50">
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

function AddCustomerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (form: Partial<Customer>) => void }) {
  const [form, setForm] = useState({
    company_name: '', contact_person: '', email: '', phone: '',
    address: '', city: '', country: 'Tanzania',
    customer_type: 'Regular' as CustomerType, payment_terms: 'Net 30',
    credit_limit: 0, current_balance: 0, total_shipments: 0,
    status: 'Active' as CustomerStatus, notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_person) return;
    setLoading(true);
    await onAdd(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Add Customer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Company Name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Trading Co." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Contact Person *</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="John Mwangi" required />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Email</label>
              <input type="email" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@acme.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Phone</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+255 123 456 789" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Customer Type</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.customer_type} onChange={e => setForm({ ...form, customer_type: e.target.value as CustomerType })}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">City</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Dar es Salaam" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Country</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                {AFRICAN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Address</label>
            <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Business Road, Zone A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Terms</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })}>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Credit Limit ($)</label>
              <input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.credit_limit} onChange={e => setForm({ ...form, credit_limit: Number(e.target.value) })} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={!form.company_name || !form.contact_person || loading} className="px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}