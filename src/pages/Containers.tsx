import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Container, ContainerStatus } from '../types';
import { AddContainerModal } from '../components/AddContainerModal';

const STATUS_FILTERS = ['All', 'Available', 'In Use', 'In Transit', 'At Port', 'Maintenance'];

const STATUS_STYLE: Record<ContainerStatus, { pill: string; dot: string }> = {
  Available:   { pill: 'bg-green-50 text-green-700',  dot: '#2B8A3E' },
  'In Use':    { pill: 'bg-blue-50 text-blue-700',    dot: '#1C7ED6' },
  'In Transit':{ pill: 'bg-blue-50 text-blue-700',    dot: '#1C7ED6' },
  'At Port':   { pill: 'bg-amber-50 text-amber-700',  dot: '#F08C00' },
  Maintenance: { pill: 'bg-red-50 text-red-700',      dot: '#E03131' },
};

const TYPE_ICON: Record<string, string> = {
  '20ft': 'ti-box',
  '40ft': 'ti-box',
  '40ft HC': 'ti-package',
  '45ft': 'ti-package',
};

export function Containers() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Container | null>(null);
  const [editStatus, setEditStatus] = useState<ContainerStatus | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('containers')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Failed to load containers. Please try again.');
    } else {
      setContainers((data as Container[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(form: Omit<Container, 'id' | 'created_at'>) {
    setSaving(true);
    const { data, error: err } = await supabase
      .from('containers')
      .insert([form])
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError('Failed to save container. Please try again.');
      return;
    }
    setContainers(prev => [data as Container, ...prev]);
    setShowAdd(false);
  }

  async function handleStatusUpdate(id: string, status: ContainerStatus) {
    const { error: err } = await supabase
      .from('containers')
      .update({ status })
      .eq('id', id);
    if (err) {
      setError('Failed to update status.');
      return;
    }
    setContainers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    setEditStatus('');
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase
      .from('containers')
      .delete()
      .eq('id', id);
    if (err) {
      setError('Failed to delete container.');
      return;
    }
    setContainers(prev => prev.filter(c => c.id !== id));
    setSelected(null);
  }

  const filtered = containers.filter(c => {
    const matchStatus = filter === 'All' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.container_number.toLowerCase().includes(q)
      || c.location.toLowerCase().includes(q)
      || c.bl_number.toLowerCase().includes(q)
      || c.owner.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_FILTERS.slice(1).reduce<Record<string, number>>((acc, s) => {
    acc[s] = containers.filter(c => c.status === s).length;
    return acc;
  }, {});

  return (
    <div className="p-4">
      {showAdd && (
        <AddContainerModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          saving={saving}
        />
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-100 z-50 overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">{selected.container_number}</div>
              <div className="text-xs text-gray-400 mt-0.5">{selected.type} container</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          <div className="p-5 space-y-5">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[selected.status]?.pill ?? 'bg-gray-100 text-gray-600'}`}>
                <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: STATUS_STYLE[selected.status]?.dot }} />
                {selected.status}
              </span>
              {selected.bl_number && (
                <span className="text-xs text-[#0F4C81] font-semibold bg-blue-50 px-2 py-1 rounded-lg">
                  {selected.bl_number}
                </span>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Type', selected.type],
                ['Location', selected.location || '—'],
                ['Owner', selected.owner || '—'],
                ['Seal #', selected.seal_number || '—'],
                ['Arrival', selected.arrival_date || '—'],
                ['Departure', selected.departure_date || '—'],
              ].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400 mb-0.5">{l}</div>
                  <div className="text-xs font-medium text-gray-800">{v}</div>
                </div>
              ))}
            </div>

            {/* Update status */}
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</div>
              <div className="flex flex-wrap gap-1.5">
                {(STATUS_FILTERS.slice(1) as ContainerStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusUpdate(selected.id, st)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selected.status === st
                        ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {selected.notes && (
              <div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
                <div className="bg-amber-50 border-l-2 border-amber-400 rounded-r-lg px-3 py-2.5 text-xs text-gray-600">
                  {selected.notes}
                </div>
              </div>
            )}

            {/* Delete */}
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  if (window.confirm(`Remove container ${selected.container_number}?`)) {
                    handleDelete(selected.id);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <i className="ti ti-trash text-sm" /> Remove Container
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Containers</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {containers.length} total &nbsp;&middot;&nbsp;
            {counts['Available'] ?? 0} available &nbsp;&middot;&nbsp;
            {counts['In Transit'] ?? 0} in transit
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Add Container
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
          <i className="ti ti-alert-circle text-sm" />{error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {([
          ['Available',   counts['Available']   ?? 0, '#2B8A3E', 'bg-green-50'],
          ['In Use',      counts['In Use']      ?? 0, '#1C7ED6', 'bg-blue-50'],
          ['In Transit',  counts['In Transit']  ?? 0, '#1C7ED6', 'bg-blue-50'],
          ['At Port',     counts['At Port']     ?? 0, '#F08C00', 'bg-amber-50'],
          ['Maintenance', counts['Maintenance'] ?? 0, '#E03131', 'bg-red-50'],
        ] as [string, number, string, string][]).map(([label, count, color, bg]) => (
          <button
            key={label}
            onClick={() => setFilter(filter === label ? 'All' : label)}
            className={`rounded-xl p-3 text-left border transition-all ${filter === label ? 'border-current shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'} ${filter === label ? bg : ''}`}
            style={{ color: filter === label ? color : undefined }}
          >
            <div className="text-xl font-semibold leading-none" style={{ color }}>{count}</div>
            <div className="text-[10px] text-gray-500 mt-1">{label}</div>
          </button>
        ))}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter === f
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search container #, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-[#0F4C81] rounded-full animate-spin" />
          Loading containers...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Container #', 'Type', 'Status', 'Location', 'BL #', 'Owner', 'Arrival', 'Departure', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    {containers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <i className="ti ti-box text-3xl text-gray-300" />
                        </div>
                        <div className="text-sm font-semibold text-gray-700">No containers yet</div>
                        <div className="text-xs text-gray-400">Add your first container to start tracking</div>
                        <button
                          onClick={() => setShowAdd(true)}
                          className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]"
                        >
                          Add your first container
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-xs text-gray-400">No containers match your filter</div>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const st = STATUS_STYLE[c.status] ?? { pill: 'bg-gray-100 text-gray-600', dot: '#9ca3af' };
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <i className={`ti ${TYPE_ICON[c.type] ?? 'ti-box'} text-gray-300 text-sm`} />
                          <span className="text-xs font-semibold text-[#0F4C81]">{c.container_number}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{c.type}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.pill}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{c.location || '—'}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-[#0F4C81]">{c.bl_number || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{c.owner || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{c.arrival_date || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">{c.departure_date || '—'}</td>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(c)}
                          className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <i className="ti ti-eye text-xs" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
