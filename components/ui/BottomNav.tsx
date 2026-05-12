'use client';

import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const BottomNav = ({ items }: { items: NavItem[] }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-white border-t border-surface-border px-4 py-3 z-50 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all duration-300 ${
              isActive ? 'text-brand-500' : 'text-ink-muted'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand-500 text-ink-inverse shadow-lg shadow-brand-500/20' : 'hover:bg-surface-soft'}`}>
              {item.icon}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
