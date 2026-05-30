'use client';

interface ProgressBarProps {
  progress: number;
  statusText?: string;
}

export default function ProgressBar({ progress, statusText = 'Processing...' }: ProgressBarProps) {
  // Ensure progress is bounded 0-100
  const pct = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full card p-8 text-center animate-fade-in-up">
      <h3 className="text-xl font-semibold mb-6">{statusText}</h3>
      
      <div className="progress-bar-container mb-4">
        <div 
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-[var(--color-text-muted)] font-medium">
        <span>0%</span>
        <span className="text-[var(--color-primary)]">{pct}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
