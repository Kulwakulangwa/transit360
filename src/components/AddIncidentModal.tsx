import { useState } from 'react';
import type { Incident, IncidentSeverity } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (i: Incident) => void;
}

const SEVERITIES: IncidentSeverity[] = ['Critical', 'Warning', 'Info'];

export function AddIncidentModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({ severity: 'Warning' as IncidentSeverity, title: '', description: '', blNumber: '' });
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    const now = new Date();
    onAdd({
      id: crypto.randomUUID(),
      severity: form.severity,
      title: form.title,
      description: form.description,
      blNumber: form.blNumber || '—',
      reportedAt: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      resolved: false,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-[440px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-900">Report Incident</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500" value={form.severity} onChange={e => set('severity', e.target.value)}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">BL Number</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500" value={form.blNumber} onChange={e => set('blNumber', e.target.value)} placeholder="e.g. BL-2024-001" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief incident title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe what happened..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Report Incident</button>
          </div>
        </form>
      </div>
    </div>
  );
}
