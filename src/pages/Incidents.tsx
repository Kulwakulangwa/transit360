import { useState } from 'react';
import type { Incident, IncidentSeverity } from '../types';
import { AddIncidentModal } from '../components/AddIncidentModal';

interface Props {
  incidents: Incident[];
  onResolve: (id: string) => void;
  onAdd: (i: Incident) => void;
}

const SEV_FILTERS = ['All', 'Critical', 'Warning', 'Info'];

export function Incidents({ incidents, onResolve, onAdd }: Props) {
  const [tab, setTab] = useState<'Open' | 'Resolved'>('Open');
  const [sevFilter, setSevFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const open = incidents.filter(i => !i.resolved).length;
  const resolved = incidents.filter(i => i.resolved).length;
  const counts = {
    Critical: incidents.filter(i => !i.resolved && i.severity === 'Critical').length,
    Warning: incidents.filter(i => !i.resolved && i.severity === 'Warning').length,
    Info: incidents.filter(i => !i.resolved && i.severity === 'Info').length,
  };

  const filtered = incidents.filter(i => {
    const matchTab = tab === 'Open' ? !i.resolved : i.resolved;
    const matchSev = sevFilter === 'All' || i.severity === sevFilter;
    return matchTab && matchSev;
  });

  const sevConfig: Record<IncidentSeverity, { bg: string; text: string; border: string; icon: string }> = {
    Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'ti-alert-octagon' },
    Warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'ti-alert-triangle' },
    Info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'ti-info-circle' },
  };

  return (
    <div className="p-4">
      {showAdd && <AddIncidentModal onClose={() => setShowAdd(false)} onAdd={i => { onAdd(i); setShowAdd(false); }} />}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Incidents</div>
          <div className="text-xs text-gray-500 mt-0.5">{open} open &middot; {resolved} resolved</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Report Incident
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {([['Critical', '#E03131', 'rgba(224,49,49,0.15)', 'ti-alert-octagon'], ['Warning', '#F08C00', 'rgba(240,140,0,0.15)', 'ti-alert-triangle'], ['Info', '#1C7ED6', 'rgba(28,126,214,0.15)', 'ti-info-circle']] as const).map(([sev, color, bg, icon]) => (
          <div key={sev} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <i className={`ti ${icon} text-lg`} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-semibold leading-none" style={{ color }}>{counts[sev]}</div>
              <div className="text-xs text-gray-500 mt-1">{sev}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 gap-0.5">
          {(['Open', 'Resolved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t ? 'bg-[#0F4C81] text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {SEV_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSevFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${sevFilter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {['Severity', 'Title', 'Description', 'BL #', 'Reported', ...(tab === 'Open' ? ['Action'] : [])].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-xs text-gray-400">No incidents found</td></tr>
            ) : (
              filtered.map(inc => {
                const cfg = sevConfig[inc.severity];
                return (
                  <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        <i className={`ti ${cfg.icon} text-xs`} />{inc.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-gray-800 max-w-[140px]">
                      <span className="line-clamp-2">{inc.title}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[200px]">
                      <span className="line-clamp-2">{inc.description}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81] whitespace-nowrap">{inc.blNumber}</td>
                    <td className="px-3 py-2.5 text-[10px] text-gray-400 whitespace-nowrap">{inc.reportedAt}</td>
                    {tab === 'Open' && (
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => onResolve(inc.id)}
                          className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          <i className="ti ti-circle-check text-xs" /> Resolve
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
