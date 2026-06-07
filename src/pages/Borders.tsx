import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { BorderCrossing, BorderStatus, BorderDirection } from '../types';
import { AddBorderCrossingModal } from '../components/AddBorderCrossingModal';

const STATUS_CONFIG: Record<BorderStatus, { bg: string; text: string; dot: string }> = {
  Pending: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  'In Clearance': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  Cleared: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Hold: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const DIRECTION_CONFIG: Record<BorderDirection, { bg: string; text: string; icon: string }> = {
  Export: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'ti-arrow-up' },
  Import: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'ti-arrow-down' },
};

const STATUS_FILTERS: (BorderStatus | 'All')[] = ['All', 'Pending', 'In Clearance', 'Cleared', 'Hold', 'Rejected'];
const DIRECTION_FILTERS: (BorderDirection | 'All')[] = ['All', 'Export', 'Import'];

export function Borders() {
  const [crossings, setCrossings] = useState<BorderCrossing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BorderStatus | 'All'>('All');
  const [directionFilter, setDirectionFilter] = useState<BorderDirection | 'All'>('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<BorderCrossing | null>(null);

  useEffect(() => {
    fetchCrossings();
  }, []);

  async function fetchCrossings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('border_crossings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCrossings(data as BorderCrossing[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: BorderStatus) {
    const { error } = await supabase
      .from('border_crossings')
      .update({ status, clearance_date: status === 'Cleared' ? new Date().toISOString().split('T')[0] : '' })
      .eq('id', id);
    if (!error) {
      setCrossings(prev => prev.map(c => c.id === id ? { ...c, status, clearance_date: status === 'Cleared' ? new Date().toISOString().split('T')[0] : '' } : c));
      setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this border crossing?')) return;
    const { error } = await supabase.from('border_crossings').delete().eq('id', id);
    if (!error) {
      setCrossings(prev => prev.filter(c => c.id !== id));
      setSelected(null);
    }
  }

  const filtered = crossings.filter(c => {
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchDir = directionFilter === 'All' || c.direction === directionFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.bl_number.toLowerCase().includes(q) || c.border_point.toLowerCase().includes(q) || c.driver_name.toLowerCase().includes(q);
    return matchStatus && matchDir && matchSearch;
  });

  const pending = crossings.filter(c => c.status === 'Pending').length;
  const inClearance = crossings.filter(c => c.status === 'In Clearance').length;
  const onHold = crossings.filter(c => c.status === 'Hold').length;
  const cleared = crossings.filter(c => c.status === 'Cleared').length;

  return (
    <div className="p-4">
      {showAdd && <AddBorderCrossingModal onClose={() => setShowAdd(false)} onAdd={() => { setShowAdd(false); fetchCrossings(); }} />}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{selected.border_point}</h3>
                <p className="text-xs text-gray-500 mt-0.5">BL # {selected.bl_number}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"><i className="ti ti-trash mr-1" />Delete</button>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${DIRECTION_CONFIG[selected.direction].bg} ${DIRECTION_CONFIG[selected.direction].text}`}>
                <i className={`ti ${DIRECTION_CONFIG[selected.direction].icon} text-xs`} />{selected.direction}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />{selected.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['Truck Unit', selected.truck_unit || '—'],
                ['Driver', selected.driver_name || '—'],
                ['Crossing Date', selected.crossing_date || '—'],
                ['Clearance Date', selected.clearance_date || '—'],
                ['Customs Agent', selected.customs_agent || '—'],
                ['Customs Fees', selected.fees > 0 ? `$${selected.fees.toLocaleString()}` : '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {selected.status === 'Hold' && selected.hold_reason && (
              <div className="mb-4 p-2.5 rounded-lg border-l-2 border-red-400 bg-red-50">
                <span className="font-semibold text-red-700 block text-xs mb-0.5">Hold Reason</span>
                <span className="text-xs text-gray-600">{selected.hold_reason}</span>
              </div>
            )}

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Documents</div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">
                {selected.documents || 'No documents recorded'}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Update Status</div>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selected.status}
                onChange={e => updateStatus(selected.id, e.target.value as BorderStatus)}
              >
                {(['Pending', 'In Clearance', 'Cleared', 'Hold', 'Rejected'] as BorderStatus[]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {selected.notes && (
              <div className="p-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50 text-xs text-gray-600">
                <span className="font-semibold text-amber-700 block mb-0.5">Notes</span>
                {selected.notes}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Border Crossings</div>
          <div className="text-xs text-gray-500 mt-0.5">{crossings.length} total crossings</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Add Crossing
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ['Pending', pending, 'bg-gray-100', 'text-gray-700', 'ti-clock'],
          ['In Clearance', inClearance, 'bg-blue-100', 'text-blue-700', 'ti-search'],
          ['On Hold', onHold, 'bg-red-100', 'text-red-700', 'ti-pause-circle'],
          ['Cleared', cleared, 'bg-green-100', 'text-green-700', 'ti-circle-check'],
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
        <div className="flex gap-1.5">
          {DIRECTION_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setDirectionFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${directionFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search BL #, border, driver..."
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
                {['Border Point', 'Direction', 'BL #', 'Driver', 'Truck', 'Status', 'Date', 'Fees', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-xs text-gray-400">No border crossings found</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-800">{c.border_point}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${DIRECTION_CONFIG[c.direction].bg} ${DIRECTION_CONFIG[c.direction].text}`}>
                        <i className={`ti ${DIRECTION_CONFIG[c.direction].icon} text-[10px]`} />{c.direction}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81]">{c.bl_number || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.driver_name || '—'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{c.truck_unit || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[c.status].bg} ${STATUS_CONFIG[c.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[c.status].dot}`} />{c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{c.crossing_date || '—'}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {c.fees > 0 ? <span className="text-gray-700 font-medium">${c.fees.toLocaleString()}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setSelected(c)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <i className="ti ti-file-text text-xs" /> Details
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