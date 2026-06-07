import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { TrackingEvent, FleetUnit } from '../types';

// African corridor waypoints (x%, y% on map)
const WAYPOINTS: Record<string, [number, number]> = {
  'Dar es Salaam':   [14, 52],
  'Dodoma':          [20, 42],
  'Iringa':          [22, 56],
  'Mbeya':           [25, 62],
  'Tunduma':         [27, 65],
  'Nakonde':         [28, 66],
  'Lusaka':          [34, 72],
  'Kapiri Mposhi':   [30, 68],
  'Ndola':           [32, 63],
  'Kasumbalesa':     [36, 60],
  'Lubumbashi':      [37, 58],
  'Beira':           [45, 76],
  'Mutare':          [43, 68],
  'Harare':          [44, 72],
  'Bulawayo':        [38, 78],
  'Johannesburg':    [38, 88],
  'Durban':          [44, 92],
  'Mombasa':         [55, 32],
  'Nairobi':         [52, 28],
  'Kampala':         [46, 22],
  'Kigali':          [40, 30],
  'Bujumbura':       [38, 35],
};

function locationToXY(location: string): [number, number] | null {
  for (const [name, [x, y]] of Object.entries(WAYPOINTS)) {
    if (location.toLowerCase().includes(name.toLowerCase())) return [x, y];
  }
  return null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string; pulse?: boolean }> = {
  Active:      { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#2B8A3E', pulse: true },
  'In Transit':{ bg: 'bg-blue-50',   text: 'text-blue-700',   dot: '#1C7ED6', pulse: true },
  Delayed:     { bg: 'bg-red-50',    text: 'text-red-700',    dot: '#E03131' },
  Offline:     { bg: 'bg-gray-100',  text: 'text-gray-500',   dot: '#9ca3af' },
  Maintenance: { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: '#F08C00' },
};

const AVATAR_COLORS = ['#0F4C81', '#2B8A3E', '#E03131', '#F08C00', '#7B2FBE', '#1C7ED6'];
function avatarColor(s: string) {
  const code = (s.charCodeAt(0) || 0) + (s.charCodeAt(1) || 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
}

// A vehicle pin rendered on the map
function VehiclePin({
  event,
  fleet,
  selected,
  onClick,
}: {
  event: TrackingEvent;
  fleet: FleetUnit[];
  selected: boolean;
  onClick: () => void;
}) {
  const xy = locationToXY(event.location);
  if (!xy) return null;
  const [x, y] = xy;
  const unit = fleet.find(f => f.unitNumber === event.truck_unit || f.driverName === event.driver_name);
  const status = unit?.status ?? 'Active';
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.Active;
  const ini = initials(event.driver_name || event.truck_unit || 'UN');

  return (
    <button
      onClick={onClick}
      className="absolute group"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', zIndex: selected ? 30 : 20 }}
      title={`${event.truck_unit} — ${event.driver_name}`}
    >
      {/* Pulse ring */}
      {cfg.pulse && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: cfg.dot, animationDuration: '2s' }}
        />
      )}
      {/* Pin body */}
      <span
        className="relative flex items-center justify-center rounded-full text-white font-bold shadow-lg border-2 transition-all"
        style={{
          width: selected ? 34 : 28,
          height: selected ? 34 : 28,
          fontSize: selected ? 11 : 9,
          background: cfg.dot,
          borderColor: selected ? '#fff' : 'rgba(255,255,255,0.8)',
          boxShadow: selected ? `0 0 0 3px ${cfg.dot}55, 0 4px 16px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {ini.toUpperCase()}
      </span>
      {/* Tooltip */}
      <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold bg-gray-900/90 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        {event.truck_unit || event.driver_name}
      </span>
    </button>
  );
}

// KPI card
function KpiCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <i className={`ti ${icon} text-base`} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 font-medium">{label}</div>
        <div className="text-xl font-bold text-gray-900 leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

interface Props {
  fleet: FleetUnit[];
}

export function GpsMonitor({ fleet }: Props) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('tracking_events')
      .select('*')
      .order('created_at', { ascending: false });
    setEvents((data as TrackingEvent[]) ?? []);
    setLoading(false);
    setLastRefresh(new Date());
    setCountdown(30);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          load();
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  // Latest event per truck
  const latestByTruck: Record<string, TrackingEvent> = {};
  events.forEach(e => {
    const key = e.truck_unit || e.driver_name || e.bl_number;
    if (!key) return;
    if (!latestByTruck[key] || (e.created_at ?? '') > (latestByTruck[key].created_at ?? '')) {
      latestByTruck[key] = e;
    }
  });
  const vehicleEvents = Object.values(latestByTruck);

  // Map vehicles to fleet status
  function getVehicleStatus(e: TrackingEvent) {
    const unit = fleet.find(f => f.unitNumber === e.truck_unit || f.driverName === e.driver_name);
    if (unit) return unit.status;
    const et = e.event_type;
    if (et === 'Delay' || et === 'Breakdown') return 'Delayed';
    if (et === 'Delivery') return 'Active';
    return 'In Transit';
  }

  const filtered = vehicleEvents.filter(e => {
    if (statusFilter === 'All') return true;
    return getVehicleStatus(e) === statusFilter;
  });

  const selected = selectedId ? vehicleEvents.find(e => e.id === selectedId) ?? null : null;

  // Stats
  const totalVehicles = vehicleEvents.length;
  const onMap = vehicleEvents.filter(e => locationToXY(e.location) !== null).length;
  const delayed = vehicleEvents.filter(e => ['Delay', 'Breakdown'].includes(e.event_type)).length;
  const delivering = vehicleEvents.filter(e => e.event_type === 'Delivery').length;

  const refreshLabel = lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-4 space-y-3 h-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Live GPS Monitor</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            {totalVehicles} vehicles tracked &nbsp;&middot;&nbsp; Last refresh {refreshLabel}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
            Auto-refresh in <span className="font-semibold text-gray-700">{countdown}s</span>
          </span>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
          >
            <i className="ti ti-refresh text-sm" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        <KpiCard icon="ti-satellite" label="Tracked Vehicles" value={totalVehicles} sub={`${onMap} visible on map`} color="#1C7ED6" />
        <KpiCard icon="ti-circle-check" label="Moving" value={totalVehicles - delayed} sub="In transit / active" color="#2B8A3E" />
        <KpiCard icon="ti-alert-triangle" label="Delayed / Down" value={delayed} sub={delayed > 0 ? 'Needs attention' : 'All clear'} color="#E03131" />
        <KpiCard icon="ti-map-pin-check" label="Delivered Today" value={delivering} sub="Completed runs" color="#F08C00" />
      </div>

      {/* Map + sidebar */}
      <div className="grid grid-cols-3 gap-3" style={{ minHeight: 380 }}>
        {/* Map — 2 cols */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-50">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <i className="ti ti-map text-[#1C7ED6]" /> East &amp; Southern Africa
            </span>
            <div className="flex items-center gap-1.5">
              {['All', 'Active', 'In Transit', 'Delayed', 'Maintenance', 'Offline'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors border ${
                    statusFilter === s
                      ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            className="relative flex-1"
            style={{ background: 'linear-gradient(160deg,#0a1628 0%,#0d2040 60%,#0a1628 100%)', minHeight: 320 }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,transparent 1px,transparent 30px),repeating-linear-gradient(90deg,#fff 0,transparent 1px,transparent 30px)' }}
            />

            {/* Route lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M55,32 L52,28 L46,22" fill="none" stroke="rgba(28,126,214,0.3)" strokeWidth="0.5" strokeDasharray="1 2" />
              <path d="M52,28 L40,30 L38,35" fill="none" stroke="rgba(240,140,0,0.25)" strokeWidth="0.4" strokeDasharray="1 2.5" />
              <path d="M14,52 L20,42 L22,56 L25,62 L27,65 L28,66 L30,68 L34,72" fill="none" stroke="rgba(28,126,214,0.4)" strokeWidth="0.5" strokeDasharray="1 1.5" />
              <path d="M34,72 L36,60 L37,58" fill="none" stroke="rgba(28,126,214,0.25)" strokeWidth="0.4" strokeDasharray="1 2" />
              <path d="M45,76 L43,68 L44,72 L38,78 L38,88 L44,92" fill="none" stroke="rgba(0,201,167,0.25)" strokeWidth="0.4" strokeDasharray="1 2" />
              {/* Highlighted selected route */}
              {selected && (() => {
                const xy = locationToXY(selected.location);
                if (!xy) return null;
                return (
                  <circle
                    cx={xy[0]}
                    cy={xy[1]}
                    r="4"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                  />
                );
              })()}
            </svg>

            {/* City labels */}
            {Object.entries(WAYPOINTS).map(([city, [x, y]]) => (
              <span
                key={city}
                className="absolute text-white/25 pointer-events-none select-none"
                style={{ left: `${x}%`, top: `${y + 3.5}%`, fontSize: 6.5, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
              >
                {city}
              </span>
            ))}

            {/* City dots */}
            {Object.entries(WAYPOINTS).map(([city, [x, y]]) => (
              <span
                key={`dot-${city}`}
                className="absolute w-1 h-1 rounded-full bg-white/15 pointer-events-none"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
              />
            ))}

            {/* Vehicle pins */}
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <i className="ti ti-satellite-off text-3xl text-white/20" />
                <div className="text-white/30 text-xs">No GPS signals found</div>
                <div className="text-white/20 text-[10px]">Log tracking events with truck units to see live positions</div>
              </div>
            ) : (
              filtered.map(e => (
                <VehiclePin
                  key={e.id}
                  event={e}
                  fleet={fleet}
                  selected={selectedId === e.id}
                  onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
                />
              ))
            )}

            {/* Legend */}
            <div className="absolute bottom-2 left-3 flex gap-3">
              {([['Moving', '#2B8A3E'], ['Delayed', '#E03131'], ['Maintenance', '#F08C00'], ['Offline', '#9ca3af']] as [string, string][]).map(([l, c]) => (
                <span key={l} className="flex items-center gap-1 text-[9px] text-white/40">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3">
          {/* Selected vehicle detail */}
          {selected ? (
            <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-800">Vehicle Detail</span>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm leading-none"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow"
                  style={{ background: avatarColor(selected.driver_name || selected.truck_unit || 'U') }}
                >
                  {initials(selected.driver_name || selected.truck_unit || 'UN').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">{selected.driver_name || '—'}</div>
                  <div className="text-[10px] text-gray-500 truncate">{selected.truck_unit || 'No unit'}</div>
                </div>
                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${STATUS_COLORS[getVehicleStatus(selected)]?.bg ?? 'bg-gray-100'} ${STATUS_COLORS[getVehicleStatus(selected)]?.text ?? 'text-gray-500'}`}>
                  {getVehicleStatus(selected)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['BL Number', selected.bl_number || '—'],
                  ['Shipment Ref', selected.shipment_ref || '—'],
                  ['Last Event', selected.event_type],
                  ['Location', selected.location || '—'],
                  ['Status', selected.status || '—'],
                  ['Recorded', selected.recorded_at || '—'],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-400">{l}</div>
                    <div className="text-xs font-medium text-gray-800 mt-0.5 truncate">{v}</div>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-[10px] text-amber-700">
                  <i className="ti ti-info-circle mr-1" />{selected.description}
                </div>
              )}
              {/* Event history for this truck */}
              <div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Event History</div>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {events
                    .filter(e => (e.truck_unit && e.truck_unit === selected.truck_unit) || (e.driver_name && e.driver_name === selected.driver_name))
                    .slice(0, 8)
                    .map(e => (
                      <div key={e.id} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: e.event_type === 'Delay' || e.event_type === 'Breakdown' ? '#E03131' :
                              e.event_type === 'Delivery' ? '#2B8A3E' :
                              e.event_type === 'Border Crossing' ? '#F08C00' : '#1C7ED6'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gray-700 font-medium">{e.event_type}</span>
                          <span className="text-[10px] text-gray-400 ml-1.5">{e.location}</span>
                        </div>
                        <span className="text-[9px] text-gray-300 flex-shrink-0">{e.recorded_at}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center gap-2 min-h-[140px]">
              <i className="ti ti-click text-2xl text-gray-200" />
              <div className="text-xs text-gray-400 text-center">Click a vehicle pin on the map to view details</div>
            </div>
          )}

          {/* Vehicle list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex-1 flex flex-col min-h-0">
            <div className="text-xs font-semibold text-gray-800 mb-2.5 flex items-center gap-1.5">
              <i className="ti ti-truck text-[#1C7ED6]" />
              Active Fleet
              <span className="ml-auto text-[10px] text-gray-400 font-normal">{vehicleEvents.length} vehicles</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
                <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-[#0F4C81] rounded-full animate-spin" />
              </div>
            ) : vehicleEvents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
                <i className="ti ti-satellite-off text-2xl text-gray-200" />
                <div className="text-[10px] text-gray-400 text-center">No vehicles tracked yet.<br />Log tracking events to see fleet here.</div>
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto flex-1">
                {vehicleEvents.map(e => {
                  const status = getVehicleStatus(e);
                  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.Active;
                  const isSelected = selectedId === e.id;
                  const hasPosition = locationToXY(e.location) !== null;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedId(isSelected ? null : e.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: avatarColor(e.driver_name || e.truck_unit || 'U') }}
                      >
                        {initials(e.driver_name || e.truck_unit || 'UN').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-800 truncate">{e.truck_unit || e.driver_name || '—'}</div>
                        <div className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                          {hasPosition ? (
                            <i className="ti ti-map-pin text-green-400" />
                          ) : (
                            <i className="ti ti-map-pin-off text-gray-300" />
                          )}
                          {e.location || 'Unknown'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${cfg.bg} ${cfg.text}`}>
                          {status}
                        </span>
                        <span className="text-[9px] text-gray-300 flex items-center gap-0.5">
                          <span className={`w-1 h-1 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`} style={{ background: cfg.dot }} />
                          {hasPosition ? 'On map' : 'No GPS'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signal table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <i className="ti ti-signal text-[#1C7ED6]" /> GPS Signal Log
          </span>
          <span className="text-[10px] text-gray-400">{vehicleEvents.length} active pings</span>
        </div>

        {vehicleEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <i className="ti ti-satellite text-2xl text-gray-200" />
            <div className="text-xs text-gray-400">No signal data. Log tracking events with truck units to populate GPS feed.</div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Vehicle', 'Driver', 'BL #', 'Location', 'Last Event', 'Status', 'Signal', 'Recorded At'].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicleEvents.map(e => {
                const status = getVehicleStatus(e);
                const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.Active;
                const hasPosition = locationToXY(e.location) !== null;
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedId === e.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: avatarColor(e.driver_name || e.truck_unit || 'U') }}
                        >
                          {initials(e.driver_name || e.truck_unit || 'UN').toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-gray-800">{e.truck_unit || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{e.driver_name || '—'}</td>
                    <td className="px-3 py-2 text-xs font-semibold text-[#0F4C81] whitespace-nowrap">{e.bl_number || '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 max-w-[120px] truncate">{e.location}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
                        {e.event_type}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cfg.bg} ${cfg.text}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`flex items-center gap-1 text-[10px] ${hasPosition ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasPosition ? 'bg-green-500' : 'bg-gray-300'} ${hasPosition && cfg.pulse ? 'animate-pulse' : ''}`} />
                        {hasPosition ? 'Live' : 'No fix'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[10px] text-gray-400 whitespace-nowrap">{e.recorded_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
