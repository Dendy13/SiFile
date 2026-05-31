'use client';

import { useState } from 'react';
import { parseMarkdown } from '@/lib/markdown';

interface AIResultCardProps {
  originalSize: number;
  downloadUrl: string;
  resultText: string;
  onReset: () => void;
  operation: string;
}

export default function AIResultCard({ originalSize, downloadUrl, resultText, onReset, operation }: AIResultCardProps) {
  const [copied, setCopied] = useState(false);
  const parsedHtml = parseMarkdown(resultText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const titleText = operation === 'doc-summarize' ? 'Ringkasan Dokumen AI' : 'Laporan Analisis Perbandingan AI';
  const iconEmoji = operation === 'doc-summarize' ? '📝' : '📊';

  return (
    <div className="card p-6 sm:p-8 animate-fade-in-up gradient-border flex flex-col gap-6 w-full bg-white shadow-xl rounded-2xl border border-[var(--color-border)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between pb-6 border-b border-[var(--color-border)] gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl shrink-0">{iconEmoji}</div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-[var(--color-text)]">{titleText}</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Dianalisis menggunakan Gemini 2.5 Flash</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className={`btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5 transition-all ${copied ? 'border-[var(--color-success)] text-[var(--color-success)] bg-[rgba(16,185,129,0.04)]' : ''}`}
            title="Salin hasil ke clipboard"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-scale-in">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Tersalin!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Salin Teks
              </>
            )}
          </button>

          {/* Download File */}
          <a 
            href={downloadUrl} 
            download={`${operation === 'doc-summarize' ? 'summary' : 'comparison'}.md`}
            target="_blank" 
            rel="noreferrer"
            className="btn-primary px-3 py-1.5 text-sm gap-1.5 shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Unduh .md
          </a>
        </div>
      </div>

      {/* Markdown Content Box */}
      <div className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 max-h-[500px] overflow-y-auto text-left shadow-inner">
        <article 
          className="prose prose-blue max-w-none text-[var(--color-text)]"
          dangerouslySetInnerHTML={{ __html: parsedHtml }} 
        />
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[var(--color-border)] gap-4">
        <span className="text-xs text-[var(--color-text-muted)]">
          Ukuran Dokumen Asal: {(originalSize / 1024 / 1024).toFixed(2)} MB
        </span>
        
        <button 
          onClick={onReset}
          className="btn-ghost w-full sm:w-auto"
        >
          Proses Dokumen Lain
        </button>
      </div>
    </div>
  );
}
