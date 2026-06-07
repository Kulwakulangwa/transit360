import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Claim, ClaimStatus, ClaimPriority, ClaimType } from '../types';

const STATUS_CONFIG: Record<ClaimStatus, { bg: string; text: string; dot: string }> = {
  Open: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  'In Review': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  Settled: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const PRIORITY_CONFIG: Record<ClaimPriority, { bg: string; text: string }> = {
  Low: { bg: 'bg-gray-100', text: 'text-gray-700' },
  Medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
  High: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

const TYPE_CONFIG: Record<ClaimType, { icon: string }> = {
  Damage: { icon: 'ti-box' },
  Loss: { icon: 'ti-x' },
  Delay: { icon: 'ti-clock' },
  Shortage: { icon: 'ti-minus' },
  Documentation: { icon: 'ti-file' },
  Other: { icon: 'ti-dots' },
};

const STATUSES: ClaimStatus[] = ['Open', 'In Review', 'Approved', 'Rejected', 'Settled'];
const PRIORITIES: ClaimPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const TYPES: ClaimType[] = ['Damage', 'Loss', 'Delay', 'Shortage', 'Documentation', 'Other'];
const STATUS_FILTERS: (ClaimStatus | 'All')[] = ['All', ...STATUSES];

export function Claims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Claim | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchClaims(); }, []);

  async function fetchClaims() {
    setLoading(true);
    const { data, error } = await supabase.from('claims').select('*').order('created_at', { ascending: false });
    if (!error && data) setClaims(data as Claim[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: ClaimStatus, resolved_date: string, settled_amount: number) {
    const { error } = await supabase.from('claims').update({ status, resolved_date, settled_amount }).eq('id', id);
    if (!error) {
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status, resolved_date, settled_amount } : c));
      setSelected(prev => prev?.id === id ? { ...prev, status, resolved_date, settled_amount } : prev);
    }
  }

  const filtered = claims.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.claim_number.toLowerCase().includes(q) || c.customer_name.toLowerCase().includes(q) || c.bl_number.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const open = claims.filter(c => c.status === 'Open').length;
  const inReview = claims.filter(c => c.status === 'In Review').length;
  const totalClaimAmount = claims.reduce((sum, c) => sum + Number(c.claim_amount), 0);
  const totalSettledAmount = claims.filter(c => c.status === 'Settled').reduce((sum, c) => sum + Number(c.settled_amount), 0);

  async function handleAddClaim(form: Partial<Claim>) {
    const { error } = await supabase.from('claims').insert([form]);
    if (!error) { setShowAdd(false); fetchClaims(); }
  }

  return (
    <div className="p-4">
      {showAdd && <AddClaimModal onClose={() => setShowAdd(false)} onAdd={handleAddClaim} />}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selected.claim_number}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.customer_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${TYPE_CONFIG[selected.claim_type]?.icon ? 'bg-gray-100 text-gray-700' : ''}`}>
                <i className={`ti ${TYPE_CONFIG[selected.claim_type]?.icon || 'ti-dots'} text-xs`} />{selected.claim_type}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_CONFIG[selected.priority].bg} ${PRIORITY_CONFIG[selected.priority].text}`}>
                {selected.priority}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />{selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['BL Number', selected.bl_number || '—'],
                ['Incident Date', selected.incident_date || '—'],
                ['Reported', selected.reported_date || '—'],
                ['Assigned To', selected.assigned_to || '—'],
                ['Claim Amount', `${selected.currency} ${Number(selected.claim_amount).toLocaleString()}`],
                ['Settled Amount', selected.settled_amount > 0 ? `${selected.currency} ${Number(selected.settled_amount).toLocaleString()}` : '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">{selected.description || 'No description provided'}</div>
            </div>

            {selected.resolution_notes && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-green-400 bg-green-50">
                <span className="font-semibold text-green-700 block text-xs mb-0.5">Resolution Notes</span>
                <span className="text-xs text-gray-600">{selected.resolution_notes}</span>
              </div>
            )}

            {(selected.status === 'Open' || selected.status === 'In Review') && (
              <div className="pt-3 border-t border-gray-100">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(selected.id, 'In Review', '', 0)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                    <i className="ti ti-search text-sm" /> In Review
                  </button>
                  <button onClick={() => updateStatus(selected.id, 'Approved', '', 0)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                    <i className="ti ti-check text-sm" /> Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Claims Management</div>
          <div className="text-xs text-gray-500 mt-0.5">{claims.length} claims &middot; {open} open</div>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors">
          <i className="ti ti-plus text-sm" /> File Claim
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Open Claims', open, '#F08C00', 'bg-amber-100'],
          ['In Review', inReview, '#1C7ED6', 'bg-blue-100'],
          ['Total Claimed', totalClaimAmount, '#0F4C81', 'bg-slate-100'],
          ['Total Settled', totalSettledAmount, '#2F9E44', 'bg-green-100'],
        ].map(([label, val, color, bg]) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <div className="text-[10px] text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-semibold" style={{ color: color as string }}>{typeof val === 'number' && !(label as string).includes('Claims') ? `$${(val as number).toLocaleString()}` : val}</div>
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
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48" placeholder="Search claim #, customer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <div className="py-12 text-center text-xs text-gray-400">Loading...</div> : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Claim #', 'Type', 'Customer', 'BL #', 'Priority', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-xs text-gray-400">No claims found</td></tr> :
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81]">{c.claim_number}</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        <i className={`ti ${TYPE_CONFIG[c.claim_type]?.icon} text-xs`} />{c.claim_type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-800">{c.customer_name}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.bl_number || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_CONFIG[c.priority].bg} ${PRIORITY_CONFIG[c.priority].text}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-gray-800">${Number(c.claim_amount).toLocaleString()}</td>
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

function AddClaimModal({ onClose, onAdd }: { onClose: () => void; onAdd: (form: Partial<Claim>) => void }) {
  const [form, setForm] = useState({
    claim_number: `CLM-${Date.now().toString().slice(-6)}`,
    bl_number: '', customer_name: '', claim_type: 'Damage' as ClaimType,
    status: 'Open' as ClaimStatus, priority: 'Medium' as ClaimPriority,
    incident_date: '', reported_date: new Date().toISOString().split('T')[0],
    description: '', claim_amount: 0, settled_amount: 0, currency: 'USD',
    assigned_to: '', resolution_notes: '', documents: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.claim_type) return;
    setLoading(true);
    await onAdd(form);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">File New Claim</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Claim Number</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-gray-50" value={form.claim_number} readOnly />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">BL Number</label>
              <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.bl_number} onChange={e => setForm({ ...form, bl_number: e.target.value })} placeholder="BL-2024-001" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Customer Name *</label>
            <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="Acme Trading Co." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Claim Type *</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.claim_type} onChange={e => setForm({ ...form, claim_type: e.target.value as ClaimType })}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Priority</label>
              <select className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as ClaimPriority })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Incident Date</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.incident_date} onChange={e => setForm({ ...form, incident_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Claim Amount *</label>
              <div className="flex gap-2">
                <select className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-xs" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                  <option value="USD">USD</option>
                  <option value="TZS">TZS</option>
                  <option value="KES">KES</option>
                </select>
                <input type="number" min={0} className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.claim_amount} onChange={e => setForm({ ...form, claim_amount: Number(e.target.value) })} required />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Description *</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the claim details..." required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Assigned To</label>
            <input className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="Claims Officer" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={!form.customer_name || !form.description || loading} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Filing...' : 'File Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}