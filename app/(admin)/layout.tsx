'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/ui/BottomNav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const navItems = [
    { label: 'Kelola Kafe', path: '/menu-management', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
    )},
    { label: 'Laporan', path: '/laporan', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-soft font-sans selection:bg-brand-100 selection:text-ink-primary">
      {/* Mobile Header */}
      <header className="md:hidden bg-surface-white border-b border-surface-border p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
            <span className="text-ink-inverse text-xs font-bold">K</span>
          </div>
          <h2 className="font-bold text-ink-primary tracking-tight">KAFÉ POS</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="p-2 text-ink-secondary hover:text-red-500 hover:bg-surface-soft rounded-lg transition-colors"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-brand-50 rounded-full border border-brand-100 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Admin&background=C27C3A&color=fff" alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-72 bg-surface-white border-r border-surface-border flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-surface-border flex items-center gap-3 bg-surface-soft/30">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-ink-inverse text-lg font-bold">K</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-primary tracking-tighter leading-none">KAFÉ POS</h2>
            <p className="text-[9px] text-brand-500 font-bold uppercase tracking-[0.2em] mt-1.5 opacity-80">
              Admin Portal
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-4 ${
                  isActive 
                    ? 'text-brand-500 bg-brand-50 border border-brand-100/50 shadow-sm shadow-brand-500/5' 
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-soft'
                }`}
              >
                <div className={`transition-colors ${isActive ? 'text-brand-500' : 'text-ink-muted'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-surface-border bg-surface-soft/10">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={handleLogout}
            size="sm"
            className="text-ink-secondary hover:text-red-600 hover:bg-red-50 rounded-lg group"
          >
            <svg className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <BottomNav items={navItems} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
