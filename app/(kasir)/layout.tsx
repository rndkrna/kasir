'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/ui/BottomNav';

export default function KasirLayout({
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
    { label: 'Orders', path: '/dashboard', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    )},
    { label: 'POS', path: '/pos', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    )},
    { label: 'Riwayat', path: '/riwayat', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-50 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-surface-white border-b border-surface-border p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <h2 className="font-bold text-ink-primary tracking-tight">KAFÉ POS</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <div className="w-8 h-8 bg-brand-100 rounded-full border border-brand-200 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Kasir&background=4A6732&color=fff" alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-72 bg-surface-white border-r border-surface-border flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-surface-border flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white text-lg font-bold">K</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-primary tracking-tighter">KAFÉ POS</h2>
            <p className="text-[10px] text-brand-500 font-bold uppercase tracking-[0.2em] opacity-80">
              Staff Portal
            </p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button 
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center gap-4 ${
                  isActive 
                    ? 'text-brand-500 bg-brand-50 shadow-sm border border-brand-200/50' 
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-muted'
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

        <div className="p-6 border-t border-surface-border">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={handleLogout}
            size="sm"
            className="text-ink-secondary hover:text-red-600 hover:bg-red-50 rounded-xl"
          >
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
