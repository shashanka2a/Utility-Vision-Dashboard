"use client";

import {
  Search, Calendar, Download, MoreHorizontal,
  Upload, X, FileText, Loader2, CheckCircle, AlertCircle, Trash2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SafetyTalk {
  id: string;
  name: string;
  description?: string;
  pdf_url?: string;
  file_size?: number;
  created_at: string;
}

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SafetyLibraryPage() {
  const [search, setSearch] = useState("");
  const [talks, setTalks] = useState<SafetyTalk[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [talkName, setTalkName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTalks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/safety-talks');
      const data = await res.json();
      setTalks(Array.isArray(data) ? data : []);
    } catch {
      setTalks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTalks(); }, []);

  const filtered = talks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!talkName) setTalkName(file.name.replace(/\.pdf$/i, ''));
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !talkName.trim()) return;
    setUploading(true);
    setUploadStatus('idle');
    setUploadError('');

    try {
      // 1. Upload PDF to Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadRes = await fetch('/api/safety-talks/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      // 2. Save record to DB
      const saveRes = await fetch('/api/safety-talks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: talkName.trim(),
          pdf_url:       uploadData.pdf_url,
          pdf_public_id: uploadData.pdf_public_id,
          file_size:     uploadData.file_size,
          uploaded_by:   'Admin',
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || 'Save failed');
      }

      setUploadStatus('success');
      fetchTalks(); // Refresh list
      setTimeout(() => {
        setUploadOpen(false);
        resetUpload();
      }, 1500);

    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setTalkName('');
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/safety-talks?id=${id}`, { method: 'DELETE' });
      setTalks(prev => prev.filter(t => t.id !== id));
    } catch { /* silent fail */ }
    setMenuOpen(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload Safety Talk</h2>
              <button onClick={() => { setUploadOpen(false); resetUpload(); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Talk Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Talk name</label>
              <input
                type="text"
                value={talkName}
                onChange={e => setTalkName(e.target.value)}
                placeholder="e.g. Back Protection Safety"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>

            {/* File Drop Zone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF File</label>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
                onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl py-8 px-4 flex flex-col items-center gap-3 transition-colors ${
                  selectedFile ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {selectedFile ? (
                  <>
                    <FileText className="w-8 h-8 text-gray-600" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatSize(selectedFile.size)}</p>
                    </div>
                    <p className="text-xs text-gray-400">Click to change file</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Click to select PDF</p>
                      <p className="text-xs text-gray-400 mt-0.5">Max 50 MB</p>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Status */}
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-3 text-sm font-medium">
                <CheckCircle className="w-5 h-5" />
                Uploaded successfully!
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 text-sm font-medium">
                <AlertCircle className="w-5 h-5" />
                {uploadError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setUploadOpen(false); resetUpload(); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !talkName.trim() || uploading}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Library</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-56"
            />
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload talk
          </button>
          <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50/50 border-b border-gray-200 py-3 px-6">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Talk name</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-base">No safety talks yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first PDF to get started</p>
            </div>
            <button onClick={() => setUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              <Upload className="w-4 h-4" />
              Upload talk
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(talk => (
              <div key={talk.id} className="group flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] text-gray-800 font-medium truncate">{talk.name}</p>
                    {talk.file_size && (
                      <p className="text-xs text-gray-400 mt-0.5">{formatSize(talk.file_size)}</p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === talk.id ? null : talk.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {menuOpen === talk.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 w-44">
                      {talk.pdf_url && (
                        <a href={talk.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(talk.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
