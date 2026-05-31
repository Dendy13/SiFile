'use client';

import { useState, useEffect } from 'react';
import { getJobHistory, deleteJob, Job } from '@/lib/api';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJobHistory();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat riwayat.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus riwayat');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-muted)]">
          <div>
            <h2 className="text-xl font-bold">Riwayat 24 Jam</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Data lebih dari 24 jam tidak ditampilkan</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 text-[var(--color-text-muted)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4 opacity-50">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <p>Belum ada riwayat proses dalam 24 jam terakhir.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="border border-[var(--color-border)] rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] bg-[rgba(0,82,255,0.1)] px-2 py-1 rounded">
                    {job.operation || 'Unknown'}
                  </span>
                  <button onClick={() => handleDelete(job.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Hapus Riwayat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Status: <span className={job.status === 'done' ? 'text-green-600 font-medium' : job.status === 'error' ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'}>{job.status}</span>
                  </div>
                  {job.status === 'done' && job.resultUrl && (
                    <a href={job.resultUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium">
                      Unduh
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
