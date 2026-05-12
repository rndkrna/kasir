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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-50 border-t border-surface-border px-4 py-2 z-50 flex items-center justify-around">
      {items.map((item) => {
        const isActive = pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200 ${
              isActive ? 'text-brand-500 scale-110' : 'text-ink-secondary opacity-60'
            }`}
          >
            <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-80'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
