import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Driver, DriverStatus } from '../types';
import { AddDriverModal } from '../components/AddDriverModal';

const STATUS_FILTERS = ['All', 'Active', 'On Leave', 'Suspended', 'Inactive'];

const STATUS_STYLE: Record<DriverStatus, { pill: string; dot: string; bg: string }> = {
  Active:     { pill: 'bg-green-50 text-green-700',  dot: '#2B8A3E', bg: 'rgba(43,138,62,0.08)' },
  'On Leave': { pill: 'bg-amber-50 text-amber-700',  dot: '#F08C00', bg: 'rgba(240,140,0,0.08)' },
  Suspended:  { pill: 'bg-red-50 text-red-700',      dot: '#E03131', bg: 'rgba(224,49,49,0.08)' },
  Inactive:   { pill: 'bg-gray-100 text-gray-500',   dot: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
};

const AVATAR_COLORS = ['#0F4C81', '#2B8A3E', '#E03131', '#F08C00', '#7B2FBE', '#1C7ED6', '#0d7377', '#c0392b'];

function avatarColor(name: string) {
  const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function isExpiringSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 60;
}

function isExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

function ExpiryBadge({ date, label }: { date: string; label: string }) {
  if (!date) return null;
  if (isExpired(date)) {
    return <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">{label}: EXPIRED</span>;
  }
  if (isExpiringSoon(date)) {
    return <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">{label}: Expiring soon</span>;
  }
  return null;
}

export function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Driver | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError('Failed to load drivers. Please try again.');
    else setDrivers((data as Driver[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(form: Omit<Driver, 'id' | 'created_at'>) {
    setSaving(true);
    const { data, error: err } = await supabase
      .from('drivers')
      .insert([form])
      .select()
      .single();
    setSaving(false);
    if (err) { setError('Failed to save driver. Please try again.'); return; }
    setDrivers(prev => [data as Driver, ...prev]);
    setShowAdd(false);
  }

  async function handleStatusUpdate(id: string, status: DriverStatus) {
    const { error: err } = await supabase.from('drivers').update({ status }).eq('id', id);
    if (err) { setError('Failed to update status.'); return; }
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase.from('drivers').delete().eq('id', id);
    if (err) { setError('Failed to remove driver.'); return; }
    setDrivers(prev => prev.filter(d => d.id !== id));
    setSelected(null);
  }

  const filtered = drivers.filter(d => {
    const matchStatus = filter === 'All' || d.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || d.full_name.toLowerCase().includes(q)
      || d.license_number.toLowerCase().includes(q)
      || d.phone.toLowerCase().includes(q)
      || d.nationality.toLowerCase().includes(q)
      || d.current_assignment.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = {
    Active:     drivers.filter(d => d.status === 'Active').length,
    'On Leave': drivers.filter(d => d.status === 'On Leave').length,
    Suspended:  drivers.filter(d => d.status === 'Suspended').length,
    Inactive:   drivers.filter(d => d.status === 'Inactive').length,
  };

  const expiryAlerts = drivers.filter(d =>
    isExpired(d.license_expiry) || isExpiringSoon(d.license_expiry) ||
    isExpired(d.medical_expiry) || isExpiringSoon(d.medical_expiry)
  ).length;

  return (
    <div className="p-4">
      {showAdd && (
        <AddDriverModal onClose={() => setShowAdd(false)} onAdd={handleAdd} saving={saving} />
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-100 z-50 overflow-y-auto shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: avatarColor(selected.full_name) }}
            >
              {initials(selected.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">{selected.full_name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{selected.nationality || 'Driver'}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0">&times;</button>
          </div>

          <div className="p-5 space-y-5">
            {/* Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[selected.status].pill}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[selected.status].dot }} />
                {selected.status}
              </span>
              {selected.current_assignment && (
                <span className="text-xs font-medium text-[#0F4C81] bg-blue-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <i className="ti ti-package text-xs" />{selected.current_assignment}
                </span>
              )}
            </div>

            {/* Expiry warnings */}
            {(isExpired(selected.license_expiry) || isExpiringSoon(selected.license_expiry) ||
              isExpired(selected.medical_expiry) || isExpiringSoon(selected.medical_expiry)) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
                  <i className="ti ti-alert-triangle" /> Compliance Alerts
                </div>
                <ExpiryBadge date={selected.license_expiry} label="License" />
                <ExpiryBadge date={selected.medical_expiry} label="Medical" />
              </div>
            )}

            {/* Contact */}
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact</div>
              <div className="space-y-2">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#0F4C81]">
                    <i className="ti ti-phone text-gray-400 text-sm" />{selected.phone}
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-xs text-gray-700 hover:text-[#0F4C81]">
                    <i className="ti ti-mail text-gray-400 text-sm" />{selected.email}
                  </a>
                )}
                {selected.current_location && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="ti ti-map-pin text-gray-400 text-sm" />{selected.current_location}
                  </div>
                )}
              </div>
            </div>

            {/* Details grid */}
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Identity & Compliance</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['ID Number', selected.id_number || '—'],
                  ['Nationality', selected.nationality || '—'],
                  ['License #', selected.license_number || '—'],
                  ['License Expiry', selected.license_expiry || '—'],
                  ['Medical Expiry', selected.medical_expiry || '—'],
                  ['Total Trips', selected.total_trips],
                ].map(([l, v]) => (
                  <div key={l as string} className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-[10px] text-gray-400">{l}</div>
                    <div className={`text-xs font-medium mt-0.5 ${
                      (l === 'License Expiry' && (isExpired(v as string) || isExpiringSoon(v as string))) ||
                      (l === 'Medical Expiry' && (isExpired(v as string) || isExpiringSoon(v as string)))
                        ? isExpired(v as string) ? 'text-red-600' : 'text-amber-600'
                        : 'text-gray-800'
                    }`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Update status */}
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</div>
              <div className="flex flex-wrap gap-1.5">
                {(['Active', 'On Leave', 'Suspended', 'Inactive'] as DriverStatus[]).map(st => (
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
                  if (window.confirm(`Remove driver ${selected.full_name}?`)) handleDelete(selected.id);
                }}
                className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <i className="ti ti-trash text-sm" /> Remove Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Drivers</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {drivers.length} registered &nbsp;&middot;&nbsp;
            {counts['Active']} active
            {expiryAlerts > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                <i className="ti ti-alert-triangle text-xs mr-0.5" />{expiryAlerts} compliance alert{expiryAlerts > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-[#0F4C81] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <i className="ti ti-layout-grid text-sm" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-[#0F4C81] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <i className="ti ti-table text-sm" />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
          >
            <i className="ti ti-plus text-sm" /> Add Driver
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
          <i className="ti ti-alert-circle text-sm" />{error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {([
          ['Active',     counts['Active'],     '#2B8A3E', 'bg-green-50',  'ti-user-check'],
          ['On Leave',   counts['On Leave'],   '#F08C00', 'bg-amber-50',  'ti-user-pause'],
          ['Suspended',  counts['Suspended'],  '#E03131', 'bg-red-50',    'ti-user-x'],
          ['Inactive',   counts['Inactive'],   '#9ca3af', 'bg-gray-50',   'ti-user-off'],
        ] as [string, number, string, string, string][]).map(([label, count, color, bg, icon]) => (
          <button
            key={label}
            onClick={() => setFilter(filter === label ? 'All' : label)}
            className={`rounded-xl p-3.5 text-left border transition-all shadow-sm ${
              filter === label ? `${bg} border-current` : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
            style={{ color: filter === label ? color : undefined }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                <i className={`ti ${icon} text-base`} style={{ color }} />
              </div>
              <div className="text-2xl font-semibold" style={{ color }}>{count}</div>
            </div>
            <div className="text-xs text-gray-500">{label}</div>
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
            placeholder="Search name, license, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-[#0F4C81] rounded-full animate-spin" />
          Loading drivers...
        </div>
      ) : drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <i className="ti ti-id-badge text-3xl text-gray-300" />
          </div>
          <div className="text-sm font-semibold text-gray-700">No drivers yet</div>
          <div className="text-xs text-gray-400">Add your drivers to manage compliance and assignments</div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]"
          >
            Add your first driver
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(d => {
            const st = STATUS_STYLE[d.status];
            const hasAlert = isExpired(d.license_expiry) || isExpiringSoon(d.license_expiry) ||
                             isExpired(d.medical_expiry) || isExpiringSoon(d.medical_expiry);
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: avatarColor(d.full_name) }}
                  >
                    {initials(d.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{d.full_name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{d.nationality || 'Driver'}</div>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.pill}`}>
                      <span className="w-1 h-1 rounded-full" style={{ background: st.dot }} />
                      {d.status}
                    </span>
                  </div>
                  {hasAlert && (
                    <i className="ti ti-alert-triangle text-amber-500 text-sm flex-shrink-0" title="Compliance alert" />
                  )}
                </div>

                <div className="space-y-1.5 border-t border-gray-50 pt-2.5">
                  {d.phone && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <i className="ti ti-phone text-gray-300" />{d.phone}
                    </div>
                  )}
                  {d.license_number && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <i className="ti ti-license text-gray-300" />{d.license_number}
                    </div>
                  )}
                  {d.current_assignment && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#0F4C81] font-medium">
                      <i className="ti ti-package text-[#1C7ED6]" />{d.current_assignment}
                    </div>
                  )}
                  {d.current_location && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <i className="ti ti-map-pin text-gray-300" />{d.current_location}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400">{d.total_trips} trips</span>
                  {d.license_expiry && (
                    <span className={`text-[10px] font-medium ${
                      isExpired(d.license_expiry) ? 'text-red-500' :
                      isExpiringSoon(d.license_expiry) ? 'text-amber-500' : 'text-gray-400'
                    }`}>
                      Lic: {d.license_expiry}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-10 text-xs text-gray-400">No drivers match your filter</div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Driver', 'Status', 'Phone', 'License #', 'License Expiry', 'Medical Expiry', 'Assignment', 'Trips', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-xs text-gray-400">No drivers match your filter</td></tr>
              ) : (
                filtered.map(d => {
                  const st = STATUS_STYLE[d.status];
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelected(d)}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: avatarColor(d.full_name) }}>
                            {initials(d.full_name)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-800">{d.full_name}</div>
                            <div className="text-[10px] text-gray-400">{d.nationality}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${st.pill}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{d.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{d.phone || '—'}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-gray-700">{d.license_number || '—'}</td>
                      <td className="px-3 py-2.5 text-xs">
                        <span className={isExpired(d.license_expiry) ? 'text-red-600 font-medium' : isExpiringSoon(d.license_expiry) ? 'text-amber-600 font-medium' : 'text-gray-400'}>
                          {d.license_expiry || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <span className={isExpired(d.medical_expiry) ? 'text-red-600 font-medium' : isExpiringSoon(d.medical_expiry) ? 'text-amber-600 font-medium' : 'text-gray-400'}>
                          {d.medical_expiry || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-[#0F4C81]">{d.current_assignment || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{d.total_trips}</td>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelected(d)}
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
