'use client';

import { useState } from 'react';
import { TOOLS } from '@/lib/tools.config';
import ToolCard from './components/ToolCard';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pdfTools = filteredTools.filter(t => t.category === 'pdf');
  const imageTools = filteredTools.filter(t => t.category === 'image');

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="hero-bg py-20 px-6 sm:py-32 lg:px-8 border-b border-[var(--color-border)]">
        <div className="container-max text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,82,255,0.08)] text-[var(--color-primary)] font-medium text-sm mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            Free • Fast • Private
          </div>
          
          <h1 className="font-display text-5xl sm:text-7xl mb-6 tracking-tight animate-fade-in-up animate-delay-100">
            Your files. <span className="text-gradient">Handled.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-200">
            A premium toolkit for processing images and PDFs. Powered by intelligent AI suggestions and running entirely in the cloud.
          </p>
          
          <div className="max-w-xl mx-auto relative animate-fade-in-up animate-delay-300">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a tool... e.g. Compress PDF" 
              className="w-full pl-12 pr-4 py-4 bg-white border border-[var(--color-border)] rounded-2xl shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </section>

      {/* PDF Tools Section */}
      {pdfTools.length > 0 && (
        <section id="pdf-tools" className="py-20 bg-[var(--color-bg)]">
          <div className="container-max">
            <div className="flex items-center gap-3 mb-10">
              <div className="icon-box-sm bg-[#EF4444]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h2 className="text-3xl font-display text-[var(--color-text)]">PDF Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pdfTools.map(tool => (
                <ToolCard key={tool.slug} {...tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Tools Section */}
      {imageTools.length > 0 && (
        <section id="image-tools" className="py-20 bg-[var(--color-bg-muted)] border-t border-[var(--color-border)]">
          <div className="container-max">
            <div className="flex items-center gap-3 mb-10">
              <div className="icon-box-sm bg-[#10B981]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h2 className="text-3xl font-display text-[var(--color-text)]">Image Tools</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imageTools.map(tool => (
                <ToolCard key={tool.slug} {...tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {pdfTools.length === 0 && imageTools.length === 0 && (
        <section className="py-20 text-center text-[var(--color-text-muted)]">
          <p className="text-lg">No tools found matching "{searchQuery}"</p>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--color-border)] py-10 mt-auto">
        <div className="container-max text-center text-[var(--color-text-muted)] text-sm">
          <p>© {new Date().getFullYear()} SiFile. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
