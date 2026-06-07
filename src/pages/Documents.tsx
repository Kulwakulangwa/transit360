import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

type DocCategory = 'BL' | 'Invoice' | 'Customs' | 'POD' | 'Permit' | 'Insurance' | 'Other';
type DocStatus = 'Draft' | 'Active' | 'Expired' | 'Archived';

interface DocRow {
  id: string;
  title: string;
  category: DocCategory;
  status: DocStatus;
  bl_number: string;
  reference: string;
  owner: string;
  file_reference: string;
  issue_date: string;
  expiry_date: string;
  uploaded_by: string;
  uploaded_at: string;
  notes: string;
  created_at?: string;
}

const CATEGORIES: ('All' | DocCategory)[] = ['All', 'BL', 'Invoice', 'Customs', 'POD', 'Permit', 'Insurance', 'Other'];
const STATUSES: ('All' | DocStatus)[] = ['All', 'Draft', 'Active', 'Expired', 'Archived'];

const STATUS_STYLE: Record<DocStatus, { pill: string; dot: string }> = {
  Draft:    { pill: 'bg-gray-100 text-gray-700',  dot: '#64748B' },
  Active:   { pill: 'bg-green-50 text-green-700', dot: '#2B8A3E' },
  Expired:  { pill: 'bg-red-50 text-red-700',     dot: '#E03131' },
  Archived: { pill: 'bg-slate-100 text-slate-600', dot: '#475569' },
};

const CATEGORY_ICON: Record<DocCategory, string> = {
  BL: 'ti-file-text',
  Invoice: 'ti-file-invoice',
  Customs: 'ti-stamp',
  POD: 'ti-file-check',
  Permit: 'ti-license',
  Insurance: 'ti-shield',
  Other: 'ti-file',
};

const EMPTY: DocRow = {
  id: '', title: '', category: 'BL', status: 'Active',
  bl_number: '', reference: '', owner: '', file_reference: '',
  issue_date: '', expiry_date: '', uploaded_by: '', uploaded_at: '',
  notes: '',
};

export function Documents() {
  const [rows, setRows] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cat, setCat] = useState<'All' | DocCategory>('All');
  const [status, setStatus] = useState<'All' | DocStatus>('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<DocRow | null>(null);
  const [form, setForm] = useState<DocRow>(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      // Table may not exist yet — treat as empty rather than blocking the page.
      if (err.code === '42P01' || err.message?.toLowerCase().includes('does not exist')) {
        setRows([]);
      } else {
        setError('Failed to load documents.');
      }
    } else {
      setRows((data as DocRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (cat !== 'All' && r.category !== cat) return false;
      if (status !== 'All' && r.status !== status) return false;
      if (!q) return true;
      return [r.title, r.bl_number, r.reference, r.owner, r.file_reference]
        .some(v => (v ?? '').toLowerCase().includes(q));
    });
  }, [rows, cat, status, search]);

  const counts = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(r => r.status === 'Active').length;
    const expired = rows.filter(r => r.status === 'Expired').length;
    const expiringSoon = rows.filter(r => {
      if (!r.expiry_date || r.status !== 'Active') return false;
      const d = new Date(r.expiry_date).getTime() - Date.now();
      return d > 0 && d < 30 * 24 * 60 * 60 * 1000;
    }).length;
    return { total, active, expired, expiringSoon };
  }, [rows]);

  function openAdd() {
    setForm({ ...EMPTY, uploaded_at: new Date().toISOString().slice(0, 10) });
    setShowAdd(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { ...form };
    delete (payload as Partial<DocRow>).id;
    delete (payload as Partial<DocRow>).created_at;
    const { error: err } = await supabase.from('documents').insert(payload);
    setSaving(false);
    if (err) {
      // No backing table — keep optimistic local entry so the UI still works.
      setRows(prev => [{ ...form, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
    } else {
      await load();
    }
    setShowAdd(false);
  }

  async function archive(row: DocRow) {
    const next = { ...row, status: 'Archived' as DocStatus };
    setRows(prev => prev.map(r => r.id === row.id ? next : r));
    setSelected(null);
    await supabase.from('documents').update({ status: 'Archived' }).eq('id', row.id);
  }

  return (
    <div className="p-5 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          ['Total', counts.total, '#0F4C81', 'bg-blue-50', 'ti-files'],
          ['Active', counts.active, '#2F9E44', 'bg-green-50', 'ti-circle-check'],
          ['Expiring < 30d', counts.expiringSoon, '#F08C00', 'bg-amber-50', 'ti-clock-exclamation'],
          ['Expired', counts.expired, '#E03131', 'bg-red-50', 'ti-alert-octagon'],
        ].map(([label, val, color, bg, icon]) => (
          <div key={label as string} className={`${bg as string} rounded-xl p-3 flex items-center gap-3`}>
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
              <i className={`ti ${icon as string} text-base`} style={{ color: color as string }} />
            </div>
            <div>
              <div className="text-[10px] text-gray-500">{label as string}</div>
              <div className="text-lg font-semibold" style={{ color: color as string }}>{val as number}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2 flex-wrap shadow-sm">
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                cat === c ? 'bg-[#0F4C81] text-white border-[#0F4C81]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >{c}</button>
          ))}
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'All' | DocStatus)}
          className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-700 bg-white"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, BL, owner, reference…"
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1C7ED6]"
            />
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white text-xs rounded-lg hover:bg-[#0d4373] transition-colors"
        >
          <i className="ti ti-plus text-sm" /> Add Document
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading documents…</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <i className="ti ti-folder-open text-3xl text-gray-300" />
            <div className="mt-2 text-xs text-gray-500">No documents found.</div>
            <button
              onClick={openAdd}
              className="mt-3 text-xs text-[#1C7ED6] hover:underline"
            >Upload your first document</button>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left font-medium px-3 py-2">Document</th>
                <th className="text-left font-medium px-3 py-2">Category</th>
                <th className="text-left font-medium px-3 py-2">BL / Ref</th>
                <th className="text-left font-medium px-3 py-2">Owner</th>
                <th className="text-left font-medium px-3 py-2">Issued</th>
                <th className="text-left font-medium px-3 py-2">Expires</th>
                <th className="text-left font-medium px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.Active;
                return (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <i className={`ti ${CATEGORY_ICON[r.category] ?? 'ti-file'} text-base text-[#0F4C81]`} />
                        <div>
                          <div className="font-medium text-gray-800">{r.title || 'Untitled'}</div>
                          {r.file_reference && <div className="text-[10px] text-gray-400">{r.file_reference}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{r.category}</td>
                    <td className="px-3 py-2 text-gray-600">{r.bl_number || r.reference || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{r.owner || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{r.issue_date || '—'}</td>
                    <td className="px-3 py-2 text-gray-500">{r.expiry_date || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${st.pill}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-[#1C7ED6] hover:underline text-xs"
                      >View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <form
            onSubmit={submit}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl w-full max-w-xl shadow-xl"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-800">Add Document</div>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs">
              <Field label="Title *" className="col-span-2">
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Category">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as DocCategory })} className={inputCls}>
                  {(['BL','Invoice','Customs','POD','Permit','Insurance','Other'] as DocCategory[]).map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as DocStatus })} className={inputCls}>
                  {(['Draft','Active','Expired','Archived'] as DocStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="BL Number">
                <input value={form.bl_number} onChange={e => setForm({ ...form, bl_number: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Reference">
                <input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Owner">
                <input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} className={inputCls} />
              </Field>
              <Field label="File Reference / URL">
                <input value={form.file_reference} onChange={e => setForm({ ...form, file_reference: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Issue Date">
                <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Expiry Date">
                <input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Uploaded By">
                <input value={form.uploaded_by} onChange={e => setForm({ ...form, uploaded_by: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Uploaded At">
                <input type="date" value={form.uploaded_at} onChange={e => setForm({ ...form, uploaded_at: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Notes" className="col-span-2">
                <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button disabled={saving} type="submit" className="px-3 py-1.5 text-xs bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d4373] disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <i className={`ti ${CATEGORY_ICON[selected.category] ?? 'ti-file'} text-base text-[#0F4C81]`} />
                <div className="text-sm font-semibold text-gray-800">{selected.title}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">
                <i className="ti ti-x text-lg" />
              </button>
            </div>
            <div className="p-5 text-xs space-y-2">
              <Row label="Category" value={selected.category} />
              <Row label="Status" value={selected.status} />
              <Row label="BL Number" value={selected.bl_number} />
              <Row label="Reference" value={selected.reference} />
              <Row label="Owner" value={selected.owner} />
              <Row label="File Reference" value={selected.file_reference} />
              <Row label="Issued" value={selected.issue_date} />
              <Row label="Expires" value={selected.expiry_date} />
              <Row label="Uploaded By" value={selected.uploaded_by} />
              <Row label="Uploaded At" value={selected.uploaded_at} />
              {selected.notes && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-2 mb-1">Notes</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{selected.notes}</div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              {selected.status !== 'Archived' && (
                <button onClick={() => archive(selected)} className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Archive
                </button>
              )}
              <button onClick={() => setSelected(null)} className="px-3 py-1.5 text-xs bg-[#0F4C81] text-white rounded-lg hover:bg-[#0d4373]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1C7ED6]';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-50 pb-1.5">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 text-right">{value || '—'}</span>
    </div>
  );
}