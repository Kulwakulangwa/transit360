import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { uploadDocument, downloadDocument, deleteDocument, Document } from '../lib/documents.functions';

type DocCategory = 'BL' | 'Invoice' | 'Customs' | 'POD' | 'Permit' | 'Insurance' | 'Other';
type DocStatus = 'Draft' | 'Active' | 'Expired' | 'Archived';

const CATEGORIES: ('All' | DocCategory)[] = ['All', 'BL', 'Invoice', 'Customs', 'POD', 'Permit', 'Insurance', 'Other'];

// Helper: format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | DocCategory>('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other' as DocCategory,
    status: 'Active' as DocStatus,
    bl_number: '',
    reference: '',
    owner: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
  });

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (filter !== 'All') {
      query = query.eq('category', filter);
    }
    const { data, error: err } = await query;
    if (err) setError('Failed to load documents.');
    else setDocuments(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  // Filter by search (title, bl_number, reference)
  const filtered = documents.filter(doc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return doc.title.toLowerCase().includes(q) ||
           (doc.bl_number && doc.bl_number.toLowerCase().includes(q)) ||
           (doc.reference && doc.reference.toLowerCase().includes(q));
  });

  // File change handler with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadError(null);
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Only PDF files are allowed.');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      const maxSize = 25 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError(`File too large (max 25MB). Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF file.');
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(selectedFile, formData);
      await loadDocuments();
      setShowUploadModal(false);
      setSelectedFile(null);
      setFormData({
        title: '',
        category: 'Other',
        status: 'Active',
        bl_number: '',
        reference: '',
        owner: '',
        issue_date: '',
        expiry_date: '',
        notes: '',
      });
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, fileName } = await downloadDocument(doc.id);
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Download failed: ' + err.message);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (confirm(`Delete "${doc.title}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(doc.id);
        await loadDocuments();
      } catch (err: any) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  // Summary counts
  const totalCount = documents.length;
  const activeCount = documents.filter(d => d.status === 'Active').length;

  return (
    <div className="p-4">
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="ti ti-x text-2xl"></i>
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF File *</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Only PDF files, max 25MB</p>
                {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DocCategory })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DocStatus })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Expired</option>
                  <option>Archived</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">BL Number</label>
                <input
                  type="text"
                  value={formData.bl_number}
                  onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 text-sm"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Documents</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {totalCount} total &nbsp;&middot;&nbsp; {activeCount} active
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b] transition-colors"
          >
            <i className="ti ti-plus text-sm" /> Upload Document
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 mb-4">
          <i className="ti ti-alert-circle text-sm" />{error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                filter === cat
                  ? 'bg-[#0F4C81] text-white border-[#0F4C81]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <i className="ti ti-search absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
          <input
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 bg-white w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search title, BL, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Documents table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-[#0F4C81] rounded-full animate-spin" />
          Loading documents...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <i className="ti ti-file-text text-3xl text-gray-300" />
          </div>
          <div className="text-sm font-semibold text-gray-700">No documents yet</div>
          <div className="text-xs text-gray-400">Upload your first document (PDF, max 25MB)</div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-xs font-medium hover:bg-[#0d3f6b]"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">Title</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">Category</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">BL Number</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">Size</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-800">{doc.title}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{doc.bl_number || '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500">{formatFileSize(doc.file_size)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      doc.status === 'Active' ? 'bg-green-50 text-green-700' :
                      doc.status === 'Expired' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                      >
                        <i className="ti ti-download text-sm" /> Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <i className="ti ti-trash text-sm" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
