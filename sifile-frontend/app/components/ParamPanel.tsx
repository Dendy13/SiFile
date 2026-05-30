'use client';

interface ParamPanelProps {
  params: Record<string, any>;
  suggestedParams: Record<string, any>;
  rationale?: string;
  onParamChange: (key: string, value: any) => void;
  operation: string;
}

export default function ParamPanel({ params, suggestedParams, rationale, onParamChange, operation }: ParamPanelProps) {
  // A generic renderer for parameters based on operation type
  // For v1, we just render some basic inputs based on the operation
  
  return (
    <div className="card p-6 w-full animate-fade-in-up animate-delay-100">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Processing Options
      </h3>
      
      {rationale && (
        <div className="mb-6 p-4 rounded-xl bg-[rgba(0,82,255,0.04)] border border-[rgba(0,82,255,0.1)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-[var(--color-primary)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-primary-dark)] mb-1">AI Suggestion</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{rationale}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Dynamic fields based on operation */}
        {operation === 'image-compress' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
              Quality: {params.quality || suggestedParams.quality || 80}%
            </label>
            <input 
              type="range" 
              min="10" max="100" 
              value={params.quality || suggestedParams.quality || 80} 
              onChange={(e) => onParamChange('quality', parseInt(e.target.value))}
              className="w-full accent-[var(--color-primary)]"
            />
          </div>
        )}

        {operation === 'image-resize' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Width (px)</label>
              <input 
                type="number" 
                placeholder="Auto"
                value={params.width || suggestedParams.width || ''} 
                onChange={(e) => onParamChange('width', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Height (px)</label>
              <input 
                type="number" 
                placeholder="Auto"
                value={params.height || suggestedParams.height || ''} 
                onChange={(e) => onParamChange('height', e.target.value ? parseInt(e.target.value) : undefined)}
                className="input-base"
              />
            </div>
          </div>
        )}

        {operation === 'image-convert' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Target Format</label>
            <select 
              value={params.targetFormat || suggestedParams.targetFormat || 'webp'}
              onChange={(e) => onParamChange('targetFormat', e.target.value)}
              className="input-base"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
            </select>
          </div>
        )}

        {operation === 'pdf-compress' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Compression Strategy</label>
            <select 
              value={params.strategy || suggestedParams.strategy || 'balanced'}
              onChange={(e) => onParamChange('strategy', e.target.value)}
              className="input-base"
            >
              <option value="conservative">Conservative (Best Quality)</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive (Smallest Size)</option>
            </select>
          </div>
        )}

        {operation === 'pdf-split' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Pages to Extract</label>
            <input 
              type="text" 
              placeholder="e.g. 1-5, 8, 11-13"
              value={params.pages || suggestedParams.pages || ''} 
              onChange={(e) => onParamChange('pages', e.target.value)}
              className="input-base"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Leave blank to extract all pages into separate files.
            </p>
          </div>
        )}

        {/* Fallback generic JSON editor for other operations */}
        {!['image-compress', 'image-resize', 'image-convert', 'pdf-compress', 'pdf-split'].includes(operation) && (
          <div className="text-sm text-[var(--color-text-muted)] italic">
            Using automatic optimal settings for this file.
          </div>
        )}
      </div>
    </div>
  );
}
