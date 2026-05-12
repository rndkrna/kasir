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
      // Check role and redirect
      const role = data.user?.user_metadata?.role;
      if (role === 'admin') {
        router.push('/laporan');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-surface-container">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink">KAFÉ POS</h1>
          <p className="text-ink-variant mt-2 font-medium">Portal Staff & Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="bg-error-container text-error-onContainer text-xs p-3 rounded-lg font-bold">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Masuk...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
