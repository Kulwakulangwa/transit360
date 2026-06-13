import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { uploadDocument, downloadDocument, deleteDocument, Document } from '../lib/documents.functions';

type DocCategory = 'BL' | 'Invoice' | 'Customs' | 'POD' | 'Permit' | 'Insurance' | 'Other';
type DocStatus = 'Draft' | 'Active' | 'Expired' | 'Archived';

const CATEGORIES: ('All' | DocCategory)[] = ['All', 'BL', 'Invoice', 'Customs', 'POD', 'Permit', 'Insurance', 'Other'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'All' | DocCategory>('All');
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    let query = supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (categoryFilter !== 'All') {
      query = query.eq('category', categoryFilter);
    }
    const { data, error } = await query;
    if (!error) setDocuments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDocuments();
  }, [categoryFilter]);

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

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a PDF file.');
      return;
    }
    setUploading(true);
    try {
      await uploadDocument(selectedFile, formData);
      await fetchDocuments();
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
  }

  async function handleDownload(doc: Document) {
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
  }

  async function handleDelete(doc: Document) {
    if (confirm(`Delete "${doc.title}"? This action cannot be undone.`)) {
      try {
        await deleteDocument(doc.id);
        await fetchDocuments();
      } catch (err: any) {
        alert('Delete failed: ' + err.message);
      }
    }
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#0F4C81] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition flex items-center gap-2"
        >
          <i className="ti ti-upload"></i> Upload Document
        </button>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              categoryFilter === cat
                ? 'bg-[#0F4C81] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F4C81] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="ti ti-file-text text-6xl text-gray-400"></i>
          <p className="mt-4 text-gray-500">No documents found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BL Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.bl_number || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(doc.file_size)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.status === 'Active' ? 'bg-green-100 text-green-800' :
                      doc.status === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-900">
                      <i className="ti ti-download"></i> Download
                    </button>
                    <button onClick={() => handleDelete(doc)} className="text-red-600 hover:text-red-900">
                      <i className="ti ti-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Document</h2>
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
                  className="w-full border border-gray-300 rounded-lg p-2"
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
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as DocCategory })}
                  className="w-full border border-gray-300 rounded-lg p-2"
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
                  className="w-full border border-gray-300 rounded-lg p-2"
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
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
