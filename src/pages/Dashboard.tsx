import type { Shipment, FleetUnit, Incident } from '../types';

interface Props {
  shipments: Shipment[];
  fleet: FleetUnit[];
  incidents: Incident[];
  onNavigate: (id: string) => void;
}

export function Dashboard({ shipments, fleet, incidents, onNavigate }: Props) {
  const active = shipments.filter(s => s.status !== 'Delivered').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;
  const delayed = shipments.filter(s => s.status === 'Delayed').length;
  const borderHolds = shipments.filter(s => s.status === 'Border Hold').length;
  const inTransit = shipments.filter(s => s.status === 'In Transit').length;
  const detentionTotal = shipments.reduce((a, s) => a + s.detentionCost, 0);
  const pendingPods = shipments.filter(s => !s.podUploaded && s.status === 'Delivered').length;
  const openInc = incidents.filter(i => !i.resolved).length;
  const critInc = incidents.filter(i => !i.resolved && i.severity === 'Critical').length;
  const fleetActive = fleet.filter(t => t.status === 'Active').length;

  const kpis = [
    { label: 'Active Shipments', value: active || '—', color: '#1C7ED6', bar: '#1C7ED6', icon: 'ti-package', delta: 'Currently in system', dir: 'up' },
    { label: 'Delivered', value: delivered || '—', color: '#2B8A3E', bar: '#2B8A3E', icon: 'ti-circle-check', delta: 'All time', dir: 'up' },
    { label: 'Delayed', value: delayed || '—', color: '#E03131', bar: '#E03131', icon: 'ti-alert-triangle', delta: delayed ? 'Requires attention' : 'All clear', dir: delayed ? 'down' : 'up' },
    { label: 'Border Holds', value: borderHolds || '—', color: '#F08C00', bar: '#F08C00', icon: 'ti-ban', delta: borderHolds ? 'Action needed' : 'None active', dir: borderHolds ? 'warn' : 'up' },
    { label: 'Detention Exposure', value: detentionTotal ? `$${(detentionTotal / 1000).toFixed(1)}k` : '$0', color: '#7B2FBE', bar: '#7B2FBE', icon: 'ti-coins', delta: 'Total accrued', dir: detentionTotal ? 'down' : 'up' },
    { label: 'Pending PODs', value: pendingPods || '—', color: '#F08C00', bar: '#F08C00', icon: 'ti-file-check', delta: pendingPods ? 'Upload required' : 'All uploaded', dir: pendingPods ? 'warn' : 'up' },
    { label: 'Open Incidents', value: openInc || '—', color: '#E03131', bar: '#E03131', icon: 'ti-alert-octagon', delta: `${critInc} critical`, dir: openInc ? 'down' : 'up' },
    { label: 'In Transit', value: inTransit || '—', color: '#1C7ED6', bar: '#1C7ED6', icon: 'ti-truck', delta: 'Moving now', dir: 'up' },
    { label: 'Total Fleet', value: fleet.length || '—', color: '#2B8A3E', bar: '#2B8A3E', icon: 'ti-settings', delta: 'Registered units', dir: 'up' },
    { label: 'Fleet Active', value: fleetActive || '—', color: '#1C7ED6', bar: '#1C7ED6', icon: 'ti-activity', delta: 'On road now', dir: 'up' },
  ];

  const donutData = [
    { label: 'In Transit', value: inTransit, color: '#1C7ED6' },
    { label: 'Delivered', value: delivered, color: '#2B8A3E' },
    { label: 'Delayed', value: delayed, color: '#E03131' },
    { label: 'Border Hold', value: borderHolds, color: '#F08C00' },
    { label: 'Loading', value: shipments.filter(s => s.status === 'Loading').length, color: '#7B2FBE' },
  ];
  const total = donutData.reduce((a, d) => a + d.value, 0) || 1;
  const CIRC = 2 * Math.PI * 34;
  let dashOff = 0;
  const segs = donutData.map(d => {
    const dash = (d.value / total) * CIRC;
    const gap = CIRC - dash;
    const offset = -dashOff;
    dashOff += dash;
    return { ...d, dash, gap, offset };
  });

  const transporters = [...new Set(shipments.map(s => s.transporter))].filter(Boolean).slice(0, 5);

  return (
    <div className="p-6 space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200/70 p-4 pl-5 relative overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] transition-shadow">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: k.bar }} />
            <div className="flex items-center gap-1.5 mb-2">
              <i className={`ti ${k.icon} text-sm`} style={{ color: k.color }} />
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold leading-none mb-1.5 tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{k.value}</div>
            <div className={`text-[11px] flex items-center gap-1 ${k.dir === 'down' ? 'text-red-600' : k.dir === 'warn' ? 'text-amber-600' : 'text-emerald-600'}`}>
              <i className={`ti text-xs ${k.dir === 'down' ? 'ti-trending-down' : k.dir === 'warn' ? 'ti-minus' : 'ti-trending-up'}`} />
              {k.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-5">
        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-map text-[#1C7ED6]" /> Live Shipment Map</span>
            <span className="text-xs text-blue-600 cursor-pointer">Full screen →</span>
          </div>
          <div className="rounded-lg overflow-hidden h-40 relative" style={{ background: 'linear-gradient(160deg,#0a1628 0%,#0d2040 100%)' }}>
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,transparent 1px,transparent 40px)' }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 340 160" preserveAspectRatio="none">
              <path d="M20 80 Q60 50 100 70 Q140 90 180 65 Q220 40 260 60 Q300 80 330 60" fill="none" stroke="rgba(28,126,214,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
              <path d="M20 120 Q70 100 120 110 Q170 120 210 95 Q250 70 300 90" fill="none" stroke="rgba(0,201,167,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
            </svg>
            <span className="absolute text-white/50 text-[9px] font-medium" style={{ left: '6%', top: '14%' }}>DAR ES SALAAM</span>
            <span className="absolute text-white/50 text-[9px] font-medium" style={{ left: '48%', top: '6%' }}>NAIROBI</span>
            <span className="absolute text-[9px] font-medium" style={{ left: '60%', top: '52%', color: 'rgba(240,140,0,0.85)' }}>KASUMBALESA</span>
            <span className="absolute text-white/50 text-[9px] font-medium" style={{ left: '30%', top: '78%' }}>BEIRA</span>
            {inTransit > 0 && <>
              <div className="absolute w-2 h-2 rounded-full border border-white" style={{ left: '28%', top: '42%', background: '#00C9A7', transform: 'translate(-50%,-50%)', boxShadow: '0 0 0 4px rgba(0,201,167,.2)' }} />
              <div className="absolute w-2 h-2 rounded-full border border-white" style={{ left: '45%', top: '36%', background: '#00C9A7', transform: 'translate(-50%,-50%)', boxShadow: '0 0 0 4px rgba(0,201,167,.2)' }} />
            </>}
            {delayed > 0 && <div className="absolute w-2 h-2 rounded-full border border-white" style={{ left: '38%', top: '68%', background: '#F08C00', transform: 'translate(-50%,-50%)', boxShadow: '0 0 0 4px rgba(240,140,0,.2)' }} />}
            <div className="absolute bottom-2 left-2.5 flex gap-3">
              <span className="text-[9px] text-white/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] inline-block" />Moving</span>
              <span className="text-[9px] text-white/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F08C00] inline-block" />Delayed</span>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-chart-donut text-[#1C7ED6]" /> Shipment Status</span>
          </div>
          <div className="flex items-center gap-4">
            <svg width="90" height="90" viewBox="0 0 90 90" className="flex-shrink-0">
              <circle cx="45" cy="45" r="34" fill="none" stroke="#f3f4f6" strokeWidth="14" />
              {total > 1 && segs.map((s, i) => (
                <circle key={i} cx="45" cy="45" r="34" fill="none" stroke={s.color} strokeWidth="14"
                  strokeDasharray={`${s.dash.toFixed(1)} ${s.gap.toFixed(1)}`}
                  strokeDashoffset={-s.offset}
                  style={{ transformOrigin: '45px 45px', transform: 'rotate(-90deg)' }} />
              ))}
              <text x="45" y="42" textAnchor="middle" fontSize="13" fontWeight="500" fill="#111827">{total > 1 ? total : '0'}</text>
              <text x="45" y="54" textAnchor="middle" fontSize="9" fill="#9ca3af">total</text>
            </svg>
            <div className="flex flex-col gap-1.5 flex-1">
              {donutData.map(d => (
                <div key={d.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="flex-1">{d.label}</span>
                  <span className="font-semibold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-bell text-[#1C7ED6]" /> Alerts Center</span>
            <span className="text-xs text-blue-600 cursor-pointer" onClick={() => onNavigate('incidents')}>View all →</span>
          </div>
          {incidents.filter(i => !i.resolved).slice(0, 4).length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              <i className="ti ti-circle-check text-2xl text-green-400 block mb-1" />
              No active alerts
            </div>
          ) : (
            incidents.filter(i => !i.resolved).slice(0, 4).map(inc => {
              const cfg = inc.severity === 'Critical'
                ? { bc: '#E03131', bg: 'rgba(224,49,49,0.07)', ic: 'ti-alert-octagon', c: '#E03131' }
                : inc.severity === 'Warning'
                ? { bc: '#F08C00', bg: 'rgba(240,140,0,0.07)', ic: 'ti-alert-triangle', c: '#F08C00' }
                : { bc: '#1C7ED6', bg: 'rgba(28,126,214,0.07)', ic: 'ti-info-circle', c: '#1C7ED6' };
              return (
                <div key={inc.id} className="flex gap-2 p-2 rounded-lg border-l-2 mb-1.5" style={{ borderColor: cfg.bc, background: cfg.bg }}>
                  <i className={`ti ${cfg.ic} text-sm flex-shrink-0 mt-0.5`} style={{ color: cfg.c }} />
                  <div>
                    <div className="text-xs font-medium text-gray-800">{inc.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{inc.description.substring(0, 55)}{inc.description.length > 55 ? '…' : ''}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{inc.reportedAt}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Delay causes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-chart-bar text-[#1C7ED6]" /> Delay Causes</span>
          </div>
          {[
            ['Border Hold', borderHolds, '#E03131'],
            ['Pending Docs', pendingPods, '#F08C00'],
            ['In Maintenance', fleet.filter(t => t.status === 'Maintenance').length, '#1C7ED6'],
            ['Open Incidents', critInc, '#7B2FBE'],
          ].map(([label, val, color]) => {
            const max = Math.max(borderHolds, pendingPods, fleet.filter(t => t.status === 'Maintenance').length, critInc, 1);
            const pct = Math.round(((val as number) / max) * 100);
            return (
              <div key={label as string} className="flex items-center gap-2 mb-2">
                <div className="text-xs text-gray-500 w-28 text-right flex-shrink-0">{label}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color as string }} />
                </div>
                <div className="text-xs text-gray-500 w-6 flex-shrink-0">{val}</div>
              </div>
            );
          })}
          <div className="mt-3 p-2.5 rounded-lg border-l-2 border-amber-400 bg-amber-50 text-xs text-gray-600">
            <span className="font-medium text-amber-700 block mb-0.5">Tip</span>
            Add your shipment and fleet data to track delay patterns across your routes.
          </div>
        </div>

        {/* Transporter leaderboard */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-trophy text-[#1C7ED6]" /> Transporter Leaderboard</span>
            <span className="text-xs text-blue-600 cursor-pointer" onClick={() => onNavigate('analytics')}>Full report →</span>
          </div>
          {transporters.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">Add shipment data to populate leaderboard</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {['#', 'Transporter', 'Trips', 'Rating'].map(h => (
                    <th key={h} className="text-left text-[10px] font-medium text-gray-400 pb-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transporters.map((t, i) => {
                  const trips = shipments.filter(s => s.transporter === t).length;
                  const onTime = shipments.filter(s => s.transporter === t && s.status === 'Delivered').length;
                  const pct = trips > 0 ? Math.round((onTime / trips) * 100) : 0;
                  const cls = pct >= 85 ? 'bg-green-50 text-green-700' : pct >= 70 ? 'bg-blue-50 text-blue-700' : pct >= 55 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700';
                  const lbl = pct >= 85 ? 'Top' : pct >= 70 ? 'Good' : pct >= 55 ? 'Avg' : 'Watch';
                  return (
                    <tr key={t} className="border-t border-gray-50">
                      <td className="py-1.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="py-1.5 text-xs font-medium text-gray-800">{t}</td>
                      <td className="py-1.5 text-xs text-gray-600">{trips}</td>
                      <td className="py-1.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{lbl}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Revenue placeholder */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5"><i className="ti ti-trending-up text-[#1C7ED6]" /> Revenue &amp; Profit</span>
          <span className="text-xs text-blue-600 cursor-pointer" onClick={() => onNavigate('analytics')}>Full analytics →</span>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-lg h-16 text-xs text-gray-400 gap-2">
            <i className="ti ti-chart-line text-xl" />
            Connect your financial data to populate the revenue chart
          </div>
          <div className="grid grid-cols-2 gap-2" style={{ minWidth: 200 }}>
            {[['YTD Revenue', '—', '#1C7ED6'], ['YTD Profit', '—', '#2B8A3E'], ['Avg Margin', '—', '#111'], ['Shipments', shipments.length || '—', '#111']].map(([l, v, c]) => (
              <div key={l as string} className="bg-gray-50 rounded-lg p-2">
                <div className="text-[10px] text-gray-500">{l}</div>
                <div className="text-base font-semibold mt-0.5" style={{ color: c as string }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
