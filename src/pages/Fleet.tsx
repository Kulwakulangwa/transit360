import { useState } from 'react';
import type { FleetUnit, FleetStatus } from '../types';
import { StatusPill } from '../components/StatusPill';
import { AddFleetModal } from '../components/AddFleetModal';

interface Props {
  fleet: FleetUnit[];
  onAdd: (u: FleetUnit) => void;
}

const FILTERS: FleetStatus[] = ['Active', 'Maintenance', 'Offline'];
const AVATAR_COLORS = ['#0F4C81', '#2B8A3E', '#E03131', '#F08C00', '#7B2FBE', '#1C7ED6'];

function avatarColor(initials: string) {
  const code = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function Fleet({ fleet, onAdd }: Props) {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FleetUnit | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const active = fleet.filter(t => t.status === 'Active').length;
  const maint = fleet.filter(t => t.status === 'Maintenance').length;
  const offline = fleet.filter(t => t.status === 'Offline').length;

  const filtered = fleet.filter(t => {
    const matchStatus = filter === 'All' || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.unitNumber.toLowerCase().includes(q) || t.driverName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-4">
      {showAdd && <AddFleetModal onClose={() => setShowAdd(false)} onAdd={u => { onAdd(u); setShowAdd(false); }} />}

      {selected && (
        <div
          className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-100 z-50 overflow-y-auto shadow-xl p-5"
          style={{ animation: 'slideIn .2s ease' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{selected.unitNumber} — {selected.driverName}</h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[['Status', selected.status], ['Total Trips', selected.totalTrips], ['Location', selected.location], ['GPS Last Seen', selected.gpsLastSeen], ['Next Maintenance', selected.nextMaintenance], ['Incidents', selected.incidents.length]].map(([l, v]) => (
              <div key={l as string} className="bg-gray-50 rounded-lg p-2">
                <div className="text-[10px] text-gray-500">{l}</div>
                <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Trip History</div>
          <div className="border border-gray-100 rounded-lg overflow-hidden mb-4">
            {selected.tripHistory.length === 0 ? (
              <p className="p-3 text-xs text-gray-400">No trips recorded.</p>
            ) : (
              selected.tripHistory.map((tr, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 border-b border-gray-50 last:border-0">
                  <i className="ti ti-truck text-xs text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#0F4C81]">{tr.blNumber}</div>
                    <div className="text-[10px] text-gray-500">{tr.from} → {tr.to}</div>
                    <div className="text-[10px] text-gray-400">{tr.date}</div>
                  </div>
                  <StatusPill status={tr.status} />
                </div>
              ))
            )}
          </div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Incidents</div>
          {selected.incidents.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 text-xs text-green-600">
              <i className="ti ti-circle-check mr-1" />No incidents recorded
            </div>
          ) : (
            selected.incidents.map((inc, i) => (
              <div key={i} className="flex gap-1.5 p-2 bg-red-50 border-l-2 border-red-500 rounded-r-lg mb-1.5 text-xs text-gray-600">
                <i className="ti ti-alert-circle text-red-500 flex-shrink-0 mt-0.5" />{inc}
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Fleet</div>
          <div className="text-xs text-gray-500 mt-0.5">{active} active &middot; {maint} maintenance &middot; {offline} offline</div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search unit or driver..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
          >
            <i className="ti ti-plus text-sm" /> Add Truck
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[['All', active + maint + offline, '#6b7280'], ['Active', active, '#2B8A3E'], ['Maintenance', maint, '#F08C00'], ['Offline', offline, '#9ca3af']].map(([label, count, color]) => (
          <button
            key={label as string}
            onClick={() => setFilter(label as string)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === label ? 'border-current bg-white' : 'border-gray-200 bg-white text-gray-500'}`}
            style={{ color: filter === label ? color as string : undefined }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color as string }} />
            {label}{label !== 'All' && ` (${count})`}
          </button>
        ))}
      </div>

      {fleet.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <i className="ti ti-truck text-4xl text-gray-300 block mb-3" />
          <div className="text-sm font-semibold text-gray-700 mb-1.5">No fleet data yet</div>
          <div className="text-xs text-gray-400 mb-4">Add your trucks to manage your fleet from this dashboard</div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]"
          >
            Add your first truck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 text-left hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                    style={{ background: avatarColor(t.driverInitials) }}
                  >
                    {t.driverInitials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{t.driverName}</div>
                    <div className="text-[10px] text-gray-400">{t.unitNumber}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'Active' ? 'bg-green-50 text-green-700' : t.status === 'Maintenance' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                  {t.status}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <i className="ti ti-map-pin text-gray-300" />{t.location}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <i className="ti ti-calendar text-gray-300" />Next maint: {t.nextMaintenance}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <i className="ti ti-clock text-gray-300" />GPS: {t.gpsLastSeen}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{t.totalTrips} trips</span>
                {t.incidents.length > 0 && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <i className="ti ti-alert-circle" />{t.incidents.length} incident{t.incidents.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-10 text-xs text-gray-400">No trucks found</div>
          )}
        </div>
      )}
    </div>
  );
}
