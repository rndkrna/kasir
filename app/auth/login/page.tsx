'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const role = data.user?.user_metadata?.role;
      if (role === 'admin') {
        router.push('/laporan');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-surface-white p-8 rounded-xl shadow-xl shadow-brand-500/5 border border-surface-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
            <span className="text-ink-inverse text-2xl font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">KAFÉ POS</h1>
          <p className="text-ink-secondary text-sm mt-1 uppercase tracking-widest font-semibold">Portal Staff & Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="admin@kafe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-status-habis-bg text-status-habis-text text-[11px] p-3 rounded-lg font-bold border border-status-habis-border uppercase tracking-tight">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 text-ink-inverse h-12 rounded-lg font-bold shadow-lg shadow-brand-500/10"
          >
            {loading ? 'Masuk...' : 'Masuk ke Sistem'}
          </Button>
        </form>
        
        <p className="mt-8 text-center text-[10px] text-ink-muted uppercase tracking-widest font-bold">
          &copy; 2026 Kafé POS System
        </p>
      </div>
    </div>
  );
}
