import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { POD, PODStatus } from '../types';
import { UploadPODModal } from '../components/UploadPODModal';

const STATUS_CONFIG: Record<PODStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Uploaded: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  Verified: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const STATUS_FILTERS: (PODStatus | 'All')[] = ['All', 'Pending', 'Uploaded', 'Verified', 'Rejected'];

export function PODs() {
  const [pods, setPODs] = useState<POD[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PODStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState<POD | null>(null);

  useEffect(() => {
    fetchPODs();
  }, []);

  async function fetchPODs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('pods')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPODs(data as POD[]);
    setLoading(false);
  }

  async function verifyPOD(id: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('pods')
      .update({ pod_status: 'Verified', verified_by: 'Operations Lead', verified_at: now.split('T')[0] })
      .eq('id', id);
    if (!error) {
      setPODs(prev => prev.map(p => p.id === id ? { ...p, pod_status: 'Verified', verified_by: 'Operations Lead', verified_at: now.split('T')[0] } : p));
      setSelected(prev => prev?.id === id ? { ...prev, pod_status: 'Verified', verified_by: 'Operations Lead', verified_at: now.split('T')[0] } : prev);
    }
  }

  async function rejectPOD(id: string, reason: string) {
    const { error } = await supabase
      .from('pods')
      .update({ pod_status: 'Rejected', rejection_reason: reason })
      .eq('id', id);
    if (!error) {
      setPODs(prev => prev.map(p => p.id === id ? { ...p, pod_status: 'Rejected', rejection_reason: reason } : p));
      setSelected(prev => prev?.id === id ? { ...prev, pod_status: 'Rejected', rejection_reason: reason } : prev);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this POD?')) return;
    const { error } = await supabase.from('pods').delete().eq('id', id);
    if (!error) {
      setPODs(prev => prev.filter(p => p.id !== id));
      setSelected(null);
    }
  }

  const filtered = pods.filter(p => {
    const matchStatus = statusFilter === 'All' || p.pod_status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.bl_number.toLowerCase().includes(q) || p.customer_name.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const pending = pods.filter(p => p.pod_status === 'Pending').length;
  const uploaded = pods.filter(p => p.pod_status === 'Uploaded').length;
  const verified = pods.filter(p => p.pod_status === 'Verified').length;
  const rejected = pods.filter(p => p.pod_status === 'Rejected').length;

  return (
    <div className="p-4">
      {showUpload && <UploadPODModal onClose={() => setShowUpload(false)} onUpload={() => { setShowUpload(false); fetchPODs(); }} />}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">POD Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">BL # {selected.bl_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"><i className="ti ti-trash mr-1" />Delete</button>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.pod_status].bg} ${STATUS_CONFIG[selected.pod_status].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selected.pod_status].dot}`} />{selected.pod_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['Customer', selected.customer_name || '—'],
                ['Origin', selected.origin || '—'],
                ['Destination', selected.destination || '—'],
                ['Delivery Date', selected.delivery_date || '—'],
                ['Recipient', selected.recipient_name || '—'],
                ['Uploaded By', selected.uploaded_by || '—'],
                ['Uploaded At', selected.uploaded_at || '—'],
                ['Verified By', selected.verified_by || '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {selected.file_reference && (
              <div className="mb-4">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Document Reference</div>
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <i className="ti ti-file-check text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">{selected.file_reference}</span>
                </div>
              </div>
            )}

            {selected.condition_notes && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-blue-400 bg-blue-50">
                <span className="font-semibold text-blue-700 block text-xs mb-0.5">Condition Notes</span>
                <span className="text-xs text-gray-600">{selected.condition_notes}</span>
              </div>
            )}

            {selected.pod_status === 'Rejected' && selected.rejection_reason && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-red-400 bg-red-50">
                <span className="font-semibold text-red-700 block text-xs mb-0.5">Rejection Reason</span>
                <span className="text-xs text-gray-600">{selected.rejection_reason}</span>
              </div>
            )}

            {selected.notes && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50">
                <span className="font-semibold text-amber-700 block text-xs mb-0.5">Notes</span>
                <span className="text-xs text-gray-600">{selected.notes}</span>
              </div>
            )}

            {(selected.pod_status === 'Uploaded' || selected.pod_status === 'Pending') && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { verifyPOD(selected.id); setSelected(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  <i className="ti ti-circle-check text-sm" /> Verify POD
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) { rejectPOD(selected.id, reason); setSelected(null); }
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  <i className="ti ti-x text-sm" /> Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Proof of Delivery (POD)</div>
          <div className="text-xs text-gray-500 mt-0.5">{pods.length} total records</div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
        >
          <i className="ti ti-upload text-sm" /> Upload POD
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Pending', pending, 'bg-amber-100', 'text-amber-700', 'ti-clock'],
          ['Uploaded', uploaded, 'bg-blue-100', 'text-blue-700', 'ti-upload'],
          ['Verified', verified, 'bg-green-100', 'text-green-700', 'ti-circle-check'],
          ['Rejected', rejected, 'bg-red-100', 'text-red-700', 'ti-x'],
        ].map(([label, count, bg, text, icon]) => (
          <div key={label} className={`flex items-center gap-2.5 ${bg} rounded-xl p-3`}>
            <i className={`ti ${icon} text-lg ${text}`} />
            <div>
              <div className={`text-xl font-semibold ${text}`}>{count as number}</div>
              <div className="text-[10px] text-gray-500">{label as string}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${statusFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search BL #, customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['BL #', 'Customer', 'Route', 'Delivery Date', 'Recipient', 'Status', 'Uploaded', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-xs text-gray-400">No PODs found</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81]">{p.bl_number || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-800">{p.customer_name || '—'}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className="text-gray-400">{p.origin}</span>
                      <span className="text-gray-300 mx-1">→</span>
                      <span className="text-gray-700">{p.destination}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{p.delivery_date || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{p.recipient_name || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[p.pod_status].bg} ${STATUS_CONFIG[p.pod_status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[p.pod_status].dot}`} />{p.pod_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-gray-400 whitespace-nowrap">{p.uploaded_at || '—'}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelected(p)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <i className="ti ti-file-text text-xs" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}