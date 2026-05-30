'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  accept: string;
  disabled?: boolean;
  multiple?: boolean;
}

export default function DropZone({ onFileSelect, accept, disabled, multiple = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFileSelect(multiple ? files : [files[0]]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFileSelect(multiple ? files : [files[0]]);
    }
  };

  return (
    <div 
      className={`drop-zone p-12 min-h-[320px] flex flex-col items-center justify-center text-center ${isDragOver ? 'drag-over' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <div className="w-20 h-20 rounded-full bg-[rgba(0,82,255,0.08)] flex items-center justify-center mb-6 text-[var(--color-primary)]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Drag & drop your file here</h3>
      <p className="text-[var(--color-text-muted)] mb-6">or click to browse from your computer</p>
      
      <div className="btn-primary pointer-events-none">Select File</div>
    </div>
  );
}
