'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToolBySlug } from '@/lib/tools.config';
import DropZone from '../../components/DropZone';
import ParamPanel from '../../components/ParamPanel';
import ProgressBar from '../../components/ProgressBar';
import ResultCard from '../../components/ResultCard';
import AIResultCard from '../../components/AIResultCard';
import { uploadFile, startProcess, streamJobProgress } from '@/lib/api';
import { getIdToken } from '@/lib/firebase';

type ToolState = 'idle' | 'uploading' | 'uploaded' | 'processing' | 'done' | 'error';

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const tool = getToolBySlug(unwrappedParams.slug);

  const [state, setState] = useState<ToolState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileId: string;
    storagePath: string;
    inputSizeBytes: number;
    mimeType: string;
    fileName: string;
  }>>([]);
  
  const [jobId, setJobId] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  const [suggestedParams, setSuggestedParams] = useState<Record<string, any>>({});
  const [rationale, setRationale] = useState('');
  const [userParams, setUserParams] = useState<Record<string, any>>({});
  
  const [resultSize, setResultSize] = useState(0);
  const [resultUrl, setResultUrl] = useState('');
  const [resultText, setResultText] = useState('');

  // Redirect if tool not found
  useEffect(() => {
    if (!tool) {
      router.push('/');
    }
  }, [tool, router]);

  if (!tool) return null;

  const isMultiFile = tool.operation === 'pdf-merge' || tool.operation === 'image-to-pdf' || tool.operation === 'batch-compress' || tool.operation === 'doc-compare';

  const handleFileSelect = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    setFiles(selectedFiles);
    setState('uploading');
    setErrorMsg('');
    
    // Create previews
    const previews = selectedFiles.map(f => f.type.startsWith('image/') ? URL.createObjectURL(f) : '');
    setFilePreviews(previews);

    try {
      const uploads = [];
      let totalSize = 0;
      for (const f of selectedFiles) {
        const res = await uploadFile(f, tool.operation);
        uploads.push({
          fileId: res.fileId,
          storagePath: res.storagePath,
          inputSizeBytes: res.sizeBytes,
          mimeType: res.mimeType,
          fileName: res.fileName,
        });
        totalSize += res.sizeBytes;
        
        // Take suggestions from the first file for simplicity
        if (uploads.length === 1) {
          setSuggestedParams(res.suggestions.params);
          setRationale(res.suggestions.rationale);
          setUserParams({});
        }
      }
      
      setUploadedFiles(uploads);
      setState('uploaded');
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message);
      setState('error');
    }
  };

  const handleProcess = async () => {
    if (tool.operation === 'doc-compare' && uploadedFiles.length < 2) {
      setErrorMsg('Harap unggah minimal 2 file untuk dapat membandingkan dokumen.');
      return;
    }

    setState('processing');
    setProgress(0);
    setStatusText('Starting process...');
    setErrorMsg('');

    try {
      // Send multiple files to the backend
      const res = await startProcess({
        fileId: uploadedFiles[0].fileId, // Keep for backward compatibility
        storagePath: uploadedFiles[0].storagePath,
        files: uploadedFiles, // New array for multi-file support
        operation: tool.operation,
        params: userParams,
        inputSizeBytes: uploadedFiles.reduce((acc, f) => acc + f.inputSizeBytes, 0),
        mimeType: uploadedFiles[0].mimeType
      });
      
      setJobId(res.jobId);
      
      // Start streaming progress
      const token = await getIdToken();
      streamJobProgress(res.jobId, token, {
        onProgress: (pct, status) => {
          setProgress(pct);
          setStatusText(status === 'pending' ? 'Waiting in queue...' : 'Processing...');
        },
        onDone: (result) => {
          setResultUrl(result.resultUrl);
          setResultSize(result.outputSizeBytes);
          if (result.resultText) {
            setResultText(result.resultText);
          }
          setState('done');
        },
        onError: (msg) => {
          setErrorMsg(msg);
          setState('error');
        }
      });
      
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message);
      setState('error');
    }
  };

  const handleParamChange = (key: string, value: any) => {
    setUserParams(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setState('idle');
    setFiles([]);
    filePreviews.forEach(p => p && URL.revokeObjectURL(p));
    setFilePreviews([]);
    setUploadedFiles([]);
    setJobId('');
    setProgress(0);
    setResultUrl('');
    setResultSize(0);
    setResultText('');
    setUserParams({});
    setErrorMsg('');
  };

  return (
    <main className="flex-1 container-max py-12 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="mb-10 text-center animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Tools
          </Link>
          
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center justify-center text-4xl mx-auto mb-6">
            {tool.icon}
          </div>
          
          <h1 className="text-4xl font-display mb-4">{tool.name}</h1>
          <p className="text-lg text-[var(--color-text-muted)]">{tool.description}</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-fade-in-up">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Error</h4>
              <p className="text-sm">{errorMsg}</p>
            </div>
            {state === 'error' && (
              <button onClick={handleReset} className="text-sm font-medium underline">Try Again</button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col gap-8">
          
          {/* Step 1: Upload */}
          {(state === 'idle' || state === 'uploading' || state === 'uploaded' || state === 'error') && (
            <div className="animate-fade-in-up">
              {state === 'uploading' ? (
                <div className="card p-12 text-center min-h-[320px] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[rgba(0,82,255,0.2)] border-t-[var(--color-primary)] rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-semibold mb-2">Uploading File...</h3>
                  <p className="text-[var(--color-text-muted)]">Please wait while we securely upload your file.</p>
                </div>
              ) : state === 'uploaded' ? (
                <div className="card p-8 min-h-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--color-border)]">
                    <h3 className="text-xl font-semibold">Ready to Process</h3>
                    <button onClick={handleReset} className="text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                      Cancel & Choose Another
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 overflow-x-auto pb-4">
                    {/* File Previews */}
                    <div className="flex gap-4">
                      {files.map((f, idx) => (
                        <div key={idx} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-muted)] overflow-hidden flex items-center justify-center relative group">
                          {filePreviews[idx] ? (
                            <img src={filePreviews[idx]} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-3xl">{tool.icon}</div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs truncate w-full px-2 text-center">{f.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-semibold text-lg mb-2">{files.length} File{files.length > 1 ? 's' : ''} Ready</h4>
                      <div className="inline-block px-3 py-1 bg-[var(--color-bg-muted)] rounded-lg text-sm font-medium text-[var(--color-text-muted)]">
                        {(uploadedFiles.reduce((acc, f) => acc + f.inputSizeBytes, 0) / 1024 / 1024).toFixed(2)} MB Total
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <DropZone 
                  multiple={isMultiFile}
                  onFileSelect={handleFileSelect} 
                  accept={tool.category === 'pdf' ? '.pdf' : 'image/jpeg, image/png, image/webp, image/gif, image/avif'} 
                />
              )}
            </div>
          )}

          {/* Step 2: Params & Process */}
          {state === 'uploaded' && (
            <>
              <ParamPanel 
                operation={tool.operation}
                params={userParams}
                suggestedParams={suggestedParams}
                rationale={rationale}
                onParamChange={handleParamChange}
              />
              
              <button 
                onClick={handleProcess}
                className="btn-primary w-full py-4 text-lg shadow-accent-lg hover:-translate-y-1 animate-fade-in-up animate-delay-200"
              >
                Process File
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </>
          )}

          {/* Step 3: Processing */}
          {state === 'processing' && (
            <ProgressBar progress={progress} statusText={statusText} />
          )}

          {/* Step 4: Result */}
          {state === 'done' && (
            ['doc-summarize', 'doc-compare'].includes(tool.operation) ? (
              <AIResultCard 
                originalSize={uploadedFiles.reduce((acc, f) => acc + f.inputSizeBytes, 0)}
                downloadUrl={resultUrl}
                resultText={resultText}
                onReset={handleReset}
                operation={tool.operation}
              />
            ) : (
              <ResultCard 
                originalSize={uploadedFiles.reduce((acc, f) => acc + f.inputSizeBytes, 0)}
                newSize={resultSize}
                downloadUrl={resultUrl}
                onReset={handleReset}
              />
            )
          )}

        </div>
      </div>
    </main>
  );
}
