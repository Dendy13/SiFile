'use client';

interface ResultCardProps {
  originalSize: number;
  newSize: number;
  downloadUrl: string;
  onReset: () => void;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ResultCard({ originalSize, newSize, downloadUrl, onReset }: ResultCardProps) {
  const reduction = originalSize > 0 ? ((originalSize - newSize) / originalSize) * 100 : 0;
  const isReduced = reduction > 0;
  const reductionText = isReduced ? `${reduction.toFixed(1)}% Smaller` : `${Math.abs(reduction).toFixed(1)}% Larger`;
  
  return (
    <div className="card p-8 text-center animate-fade-in-up gradient-border">
      <div className="w-20 h-20 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h3 className="text-3xl font-display mb-2">Done!</h3>
      <p className="text-[var(--color-text-muted)] mb-8">Your file has been successfully processed.</p>
      
      <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-semibold">Original</p>
          <p className="text-2xl font-bold">{formatBytes(originalSize)}</p>
        </div>
        
        <div className="text-[var(--color-border)]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1 uppercase tracking-wider font-semibold">New Size</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{formatBytes(newSize)}</p>
        </div>
      </div>
      
      {originalSize > 0 && newSize > 0 && Math.abs(reduction) > 0.5 && (
        <div className="mb-10 inline-block">
          <span className={isReduced ? 'reduction-positive' : 'reduction-negative'}>
            {reductionText}
          </span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a 
          href={downloadUrl} 
          download 
          target="_blank" 
          rel="noreferrer"
          className="btn-primary flex-1 sm:flex-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download File
        </a>
        <button onClick={onReset} className="btn-ghost flex-1 sm:flex-none">
          Process Another
        </button>
      </div>
    </div>
  );
}
