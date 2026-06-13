import { useState } from 'react';
import type { Shipment, ShipmentStatus } from '../types';
import { StatusPill } from '../components/StatusPill';
import { AddShipmentModal } from '../components/AddShipmentModal';

interface Props {
  shipments: Shipment[];
  onAdd: (s: Shipment) => void;
  onUpdateStatus: (id: string, status: ShipmentStatus) => void;
  onDelete: (id: string) => void;  // <-- added for delete
}

const STATUSES: ShipmentStatus[] = ['In Transit', 'Delayed', 'Border Hold', 'Delivered', 'Loading'];
const FILTERS = ['All', ...STATUSES];

export function Shipments({ shipments, onAdd, onUpdateStatus, onDelete }: Props) {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Shipment | null>(null);  // <-- added

  const filtered = shipments.filter(s => {
    const matchStatus = filter === 'All' || s.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.blNumber.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q) || s.transporter.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const delayed = shipments.filter(s => s.status === 'Delayed').length;

  function handleStatusChange(id: string, status: string) {
    onUpdateStatus(id, status as ShipmentStatus);
    setSelected(prev => prev?.id === id ? { ...prev, status: status as ShipmentStatus } : prev);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
      // If the deleted shipment was open in the detail panel, close it
      if (selected?.id === deleteTarget.id) setSelected(null);
    }
  }

  return (
    <div className="p-4">
      {showAdd && <AddShipmentModal onClose={() => setShowAdd(false)} onAdd={s => { onAdd(s); setShowAdd(false); }} />}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-96 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Delete Shipment</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-gray-600 mb-6">
              Are you sure you want to delete shipment <span className="font-semibold">{deleteTarget.blNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing detail modal – unchanged */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">{selected.blNumber} — {selected.origin} → {selected.destination}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {/* ... rest of the detail panel content – unchanged ... */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[['Transporter', selected.transporter || '—'], ['Driver', selected.driver || '—'], ['ETA', selected.eta || '—'], ['Weight', selected.weight || '—'], ['Containers', selected.containers || '—'], ['Detention', selected.detentionCost > 0 ? `$${selected.detentionCost.toLocaleString()}` : 'None']].map(([l, v]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-500">{l}</div>
                  <div className="text-xs font-medium text-gray-800 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Update Status</div>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selected.status}
                onChange={e => handleStatusChange(selected.id, e.target.value)}
              >
                {STATUSES.map(st => <option key={st}>{st}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Cost Breakdown</div>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                {[['Fuel', selected.costFuel, '#1C7ED6'], ['Detention', selected.costDetention, '#E03131'], ['Customs & Fees', selected.costCustoms, '#F08C00']].map(([l, v, c]) => {
                  const total = selected.costFuel + selected.costDetention + selected.costCustoms;
                  const pct = total > 0 ? Math.round(((v as number) / total) * 100) : 0;
                  return (
                    <div key={l as string} className="flex items-center gap-2 px-3 py-2 border-b border-gray-50 last:border-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c as string }} />
                      <span className="flex-1 text-xs text-gray-500">{l}</span>
                      <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c as string }} />
                      </div>
                      <span className="text-xs font-medium text-gray-800 w-16 text-right">${(v as number).toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="flex items-center px-3 py-2 bg-gray-50">
                  <span className="flex-1 text-xs font-semibold text-gray-700">Total</span>
                  <span className="text-xs font-semibold text-gray-800">${(selected.costFuel + selected.costDetention + selected.costCustoms).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Document Checklist</div>
              <div className="border border-gray-100 rounded-lg px-3 py-1">
                {[['podUploaded', 'Proof of Delivery (POD)'], ['invoiceUploaded', 'Commercial Invoice'], ['customsUploaded', 'Customs Declaration']].map(([k, label]) => (
                  <div key={k} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <i className={`ti ${selected[k as keyof Shipment] ? 'ti-circle-check text-green-500' : 'ti-circle text-gray-300'} text-sm`} />
                    <span className={`flex-1 text-xs ${selected[k as keyof Shipment] ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
                    {!selected[k as keyof Shipment] && <span className="text-[10px] text-red-500 font-medium">Pending</span>}
                  </div>
                ))}
              </div>
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

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Shipments</div>
          <div className="text-xs text-gray-500 mt-0.5">{shipments.length} total &middot; {delayed} delayed</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Add Shipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${filter === f ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search BL #, destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {['BL #', 'Origin → Destination', 'Transporter', 'Status', 'ETA', 'Detention', 'Actions'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-xs text-gray-400">No shipments found</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-semibold text-[#0F4C81]">{s.blNumber}</td>
                  <td className="px-3 py-2.5 text-xs">
                    <span className="text-gray-400">{s.origin}</span>
                    <span className="text-gray-300 mx-1">→</span>
                    <span className="text-gray-700">{s.destination}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{s.transporter || '—'}</td>
                  <td className="px-3 py-2.5"><StatusPill status={s.status} /></td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{s.eta || '—'}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {s.detentionCost > 0
                      ? <span className="text-red-600 font-semibold">${s.detentionCost.toLocaleString()}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(s)}
                        className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <i className="ti ti-file-text text-xs" /> Details
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="flex items-center gap-1 text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <i className="ti ti-trash text-xs" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
