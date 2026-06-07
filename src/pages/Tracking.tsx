import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { TrackingEvent, TrackingEventType } from '../types';
import { AddTrackingEventModal, EVENT_ICONS } from '../components/AddTrackingEventModal';

const EVENT_COLORS: Record<TrackingEventType, { dot: string; bg: string; text: string; line: string }> = {
  Departure:          { dot: '#1C7ED6', bg: 'bg-blue-50',   text: 'text-blue-700',   line: '#1C7ED6' },
  Arrival:            { dot: '#2B8A3E', bg: 'bg-green-50',  text: 'text-green-700',  line: '#2B8A3E' },
  'Border Crossing':  { dot: '#F08C00', bg: 'bg-amber-50',  text: 'text-amber-700',  line: '#F08C00' },
  Checkpoint:         { dot: '#6b7280', bg: 'bg-gray-100',  text: 'text-gray-600',   line: '#d1d5db' },
  Delay:              { dot: '#E03131', bg: 'bg-red-50',    text: 'text-red-700',    line: '#E03131' },
  Breakdown:          { dot: '#E03131', bg: 'bg-red-50',    text: 'text-red-700',    line: '#E03131' },
  'Customs Clearance':{ dot: '#7B2FBE', bg: 'bg-purple-50', text: 'text-purple-700', line: '#7B2FBE' },
  Delivery:           { dot: '#2B8A3E', bg: 'bg-green-50',  text: 'text-green-700',  line: '#2B8A3E' },
  Update:             { dot: '#1C7ED6', bg: 'bg-blue-50',   text: 'text-blue-700',   line: '#1C7ED6' },
};

const STATUS_PILL: Record<string, string> = {
  'In Transit':  'bg-blue-50 text-blue-700',
  'Delayed':     'bg-red-50 text-red-700',
  'Border Hold': 'bg-amber-50 text-amber-700',
  'Delivered':   'bg-green-50 text-green-700',
  'Loading':     'bg-purple-50 text-purple-700',
};

// Canonical African logistics corridor waypoints (lat/lng → map x/y %)
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

function MapDot({ event, isLatest, onClick }: { event: TrackingEvent; isLatest: boolean; onClick: () => void }) {
  const xy = locationToXY(event.location);
  if (!xy) return null;
  const [x, y] = xy;
  const cfg = EVENT_COLORS[event.event_type] ?? EVENT_COLORS.Update;
  return (
    <button
      onClick={onClick}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', zIndex: isLatest ? 20 : 10 }}
      title={`${event.bl_number} — ${event.location}`}
    >
      <span
        className="block rounded-full border-2 border-white shadow-md transition-all"
        style={{
          width: isLatest ? 14 : 10,
          height: isLatest ? 14 : 10,
          background: cfg.dot,
          boxShadow: isLatest ? `0 0 0 4px ${cfg.dot}33` : undefined,
        }}
      />
    </button>
  );
}

export function Tracking() {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedBl, setSelectedBl] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('tracking_events')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError('Failed to load tracking data.');
    else setEvents((data as TrackingEvent[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(form: Omit<TrackingEvent, 'id' | 'created_at'>) {
    setSaving(true);
    const { data, error: err } = await supabase
      .from('tracking_events')
      .insert([form])
      .select()
      .single();
    setSaving(false);
    if (err) { setError('Failed to save event.'); return; }
    setEvents(prev => [data as TrackingEvent, ...prev]);
    setShowAdd(false);
  }

  async function handleDelete(id: string) {
    const { error: err } = await supabase.from('tracking_events').delete().eq('id', id);
    if (err) { setError('Failed to delete event.'); return; }
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
  }

  // Unique BL numbers
  const blNumbers = [...new Set(events.map(e => e.bl_number).filter(Boolean))];
  const eventTypes = ['All', ...([...new Set(events.map(e => e.event_type))] as TrackingEventType[])];

  // All events filtered
  const filteredEvents = events.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.bl_number.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.driver_name.toLowerCase().includes(q);
    const matchType = typeFilter === 'All' || e.event_type === typeFilter;
    const matchBl = !selectedBl || e.bl_number === selectedBl;
    return matchSearch && matchType && matchBl;
  });

  // Timeline events for selected BL (latest first → oldest last = top to bottom)
  const timelineEvents = selectedBl
    ? events.filter(e => e.bl_number === selectedBl).sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    : [];

  // Latest event per BL for map dots
  const latestPerBl: Record<string, TrackingEvent> = {};
  events.forEach(e => {
    if (!latestPerBl[e.bl_number] || (e.created_at ?? '') > (latestPerBl[e.bl_number].created_at ?? '')) {
      latestPerBl[e.bl_number] = e;
    }
  });

  const mapEvents = Object.values(latestPerBl);

  return (
    <div className="p-4 space-y-3">
      {showAdd && (
        <AddTrackingEventModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          saving={saving}
          defaultBlNumber={selectedBl ?? ''}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Shipment Tracking</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {events.length} events &nbsp;&middot;&nbsp; {blNumbers.length} shipments tracked
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Log Event
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          <i className="ti ti-alert-circle text-sm" />{error}
          <button onClick={() => setError(null)} className="ml-auto">&times;</button>
        </div>
      )}

      {/* Map + BL Selector row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Corridor map — 2 cols */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
              <i className="ti ti-map text-[#1C7ED6]" /> East &amp; Southern Africa Corridors
            </span>
            <span className="text-[10px] text-gray-400">{mapEvents.length} active positions</span>
          </div>
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ height: 240, background: 'linear-gradient(160deg,#0a1628 0%,#0d2040 60%,#0a1628 100%)' }}
          >
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,transparent 1px,transparent 30px),repeating-linear-gradient(90deg,#fff 0,transparent 1px,transparent 30px)' }} />

            {/* Route lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Northern corridor: Mombasa → Nairobi → Kampala */}
              <path d="M55,32 L52,28 L46,22" fill="none" stroke="rgba(28,126,214,0.3)" strokeWidth="0.4" strokeDasharray="1 1.5" />
              {/* Central corridor: DSM → Dodoma → Mbeya → Tunduma → Lusaka → Kasumbalesa */}
              <path d="M14,52 L20,42 L25,62 L27,65 L34,72 L36,60" fill="none" stroke="rgba(28,126,214,0.35)" strokeWidth="0.4" strokeDasharray="1 1.5" />
              {/* Beira corridor */}
              <path d="M45,76 L43,68 L44,72 L38,78 L38,88" fill="none" stroke="rgba(0,201,167,0.25)" strokeWidth="0.4" strokeDasharray="1 1.5" />
              {/* Kigali branch */}
              <path d="M52,28 L40,30 L38,35" fill="none" stroke="rgba(240,140,0,0.25)" strokeWidth="0.3" strokeDasharray="1 2" />
            </svg>

            {/* City labels */}
            {Object.entries(WAYPOINTS).map(([city, [x, y]]) => (
              <span
                key={city}
                className="absolute text-white/30 pointer-events-none select-none"
                style={{ left: `${x}%`, top: `${y + 3}%`, fontSize: 7, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
              >
                {city}
              </span>
            ))}

            {/* Event dots */}
            {mapEvents.map(e => (
              <MapDot
                key={e.id}
                event={e}
                isLatest={true}
                onClick={() => { setSelectedBl(e.bl_number); setSelectedEvent(e); }}
              />
            ))}

            {/* Legend */}
            <div className="absolute bottom-2 left-3 flex gap-4">
              {([['Departure/Update', '#1C7ED6'], ['Delay/Breakdown', '#E03131'], ['Border', '#F08C00'], ['Delivered', '#2B8A3E']] as [string, string][]).map(([l, c]) => (
                <span key={l} className="flex items-center gap-1 text-[9px] text-white/40">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />{l}
                </span>
              ))}
            </div>

            {events.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <i className="ti ti-map-pin text-2xl text-white/20" />
                <div className="text-white/30 text-xs">Log tracking events to see shipment positions</div>
              </div>
            )}
          </div>
        </div>

        {/* BL selector panel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col">
          <div className="text-xs font-semibold text-gray-800 mb-2.5">Tracked Shipments</div>
          {blNumbers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
              <i className="ti ti-package text-2xl text-gray-200" />
              <div className="text-xs text-gray-400 text-center">No shipments tracked yet</div>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto flex-1">
              <button
                onClick={() => { setSelectedBl(null); setSelectedEvent(null); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${!selectedBl ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
              >
                <i className="ti ti-list text-sm" />All shipments
              </button>
              {blNumbers.map(bl => {
                const latest = latestPerBl[bl];
                const cfg = latest ? EVENT_COLORS[latest.event_type] : EVENT_COLORS.Update;
                const eventCount = events.filter(e => e.bl_number === bl).length;
                return (
                  <button
                    key={bl}
                    onClick={() => { setSelectedBl(bl); setSelectedEvent(null); }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left border transition-colors ${selectedBl === bl ? 'bg-[#0F4C81]/8 border-[#0F4C81]/30' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold truncate ${selectedBl === bl ? 'text-[#0F4C81]' : 'text-gray-800'}`}>{bl}</div>
                      <div className="text-[10px] text-gray-400 truncate">{latest?.location || '—'}</div>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{eventCount}ev</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Timeline (only when BL selected) */}
      {selectedBl && timelineEvents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">Timeline —</span>
              <span className="text-xs font-bold text-[#0F4C81]">{selectedBl}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[timelineEvents[0]?.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {timelineEvents[0]?.status}
              </span>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs text-[#0F4C81] border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <i className="ti ti-plus text-xs" /> Add update
            </button>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-0">
              {timelineEvents.map((ev, idx) => {
                const cfg = EVENT_COLORS[ev.event_type] ?? EVENT_COLORS.Update;
                const isFirst = idx === 0;
                return (
                  <div key={ev.id} className="relative flex gap-4 pb-5">
                    {/* Dot */}
                    <div className="flex-shrink-0 w-8 flex justify-center pt-0.5 z-10">
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center"
                        style={{ background: cfg.dot }}
                      >
                        <i className={`ti ${EVENT_ICONS[ev.event_type]} text-[8px] text-white`} />
                      </span>
                    </div>
                    {/* Content */}
                    <div className={`flex-1 min-w-0 rounded-xl border p-3 ${isFirst ? 'border-blue-100 bg-blue-50/40' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                            <i className={`ti ${EVENT_ICONS[ev.event_type]} text-[10px]`} />
                            {ev.event_type}
                          </span>
                          {isFirst && <span className="text-[10px] text-[#0F4C81] font-semibold">Latest</span>}
                        </div>
                        <button
                          onClick={() => { if (window.confirm('Remove this event?')) handleDelete(ev.id); }}
                          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove event"
                        >
                          <i className="ti ti-x text-xs" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-gray-800 mb-0.5 flex items-center gap-1.5">
                        <i className="ti ti-map-pin text-gray-400 text-xs" />{ev.location}
                      </div>
                      {ev.description && (
                        <div className="text-xs text-gray-500 mb-1.5">{ev.description}</div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        {ev.driver_name && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <i className="ti ti-user text-gray-300" />{ev.driver_name}
                          </span>
                        )}
                        {ev.truck_unit && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <i className="ti ti-truck text-gray-300" />{ev.truck_unit}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
                          <i className="ti ti-clock text-gray-300" />{ev.recorded_at}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Event log table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
            <i className="ti ti-list text-[#1C7ED6]" /> All Events
            {selectedBl && <span className="text-[#0F4C81] font-bold">— {selectedBl}</span>}
          </span>
          <div className="flex items-center gap-2">
            {/* Type filter */}
            <div className="flex gap-1">
              {eventTypes.slice(0, 5).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                    typeFilter === t ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative">
              <i className="ti ti-search absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />
              <input
                className="pl-6 pr-2 py-1 border border-gray-200 rounded-lg text-[10px] text-gray-700 bg-white w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="BL, location, driver..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-gray-400">
            <span className="w-4 h-4 border-2 border-gray-200 border-t-[#0F4C81] rounded-full animate-spin" />
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <i className="ti ti-map-pin text-3xl text-gray-200" />
            </div>
            <div className="text-sm font-semibold text-gray-700">No tracking events yet</div>
            <div className="text-xs text-gray-400">Log your first checkpoint to start tracking shipment movements</div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]"
            >
              Log first event
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {['Event', 'BL #', 'Location', 'Status', 'Driver', 'Truck', 'Recorded At', ''].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-xs text-gray-400">No events match your filter</td></tr>
              ) : (
                filteredEvents.map(ev => {
                  const cfg = EVENT_COLORS[ev.event_type] ?? EVENT_COLORS.Update;
                  return (
                    <tr
                      key={ev.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => { setSelectedBl(ev.bl_number); setSelectedEvent(ev); }}
                    >
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.text}`}>
                          <i className={`ti ${EVENT_ICONS[ev.event_type]} text-[10px]`} />{ev.event_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs font-semibold text-[#0F4C81] whitespace-nowrap">{ev.bl_number || '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 max-w-[140px] truncate">{ev.location}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_PILL[ev.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[10px] text-gray-500">{ev.driver_name || '—'}</td>
                      <td className="px-3 py-2 text-[10px] text-gray-500">{ev.truck_unit || '—'}</td>
                      <td className="px-3 py-2 text-[10px] text-gray-400 whitespace-nowrap">{ev.recorded_at}</td>
                      <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => { if (window.confirm('Remove this event?')) handleDelete(ev.id); }}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <i className="ti ti-trash text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
