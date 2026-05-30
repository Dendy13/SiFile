'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Navbar() {
  const { user, loading, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="container-max flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="icon-box-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <span className="font-display text-xl tracking-wide text-gradient group-hover:brightness-110 transition-all">
            SiFile
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#pdf-tools" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            PDF Tools
          </Link>
          <Link href="/#image-tools" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            Image Tools
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 relative">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-muted)] animate-pulse" />
          ) : user ? (
            <div>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[var(--color-border)] p-1 hover:border-[var(--color-primary)] transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[var(--color-border)]">
                    <p className="text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={signIn} className="btn-ghost py-1.5 px-4 text-sm">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
