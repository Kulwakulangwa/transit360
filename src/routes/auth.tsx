import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/auth')({
  ssr: false,
  head: () => ({ meta: [{ title: 'Sign in — Transit360' }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: '/dashboard' });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        // If email confirmation off, session is created; otherwise show message
        const { data } = await supabase.auth.getSession();
        if (data.session) navigate({ to: '/dashboard' });
        else setError('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-slate-200/70">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
            <svg viewBox="0 0 15 15" fill="none" width="18" height="18">
              <path d="M2 11L6 4L9 8L11 6L13 11H2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 tracking-tight">Transit<span className="text-slate-500">360</span></div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Logistics Platform</div>
          </div>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 mb-1">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p className="text-xs text-slate-500 mb-5">{mode === 'signin' ? 'Access your operations console.' : 'Set up your workspace in seconds.'}</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400" />
          </div>
          {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60">
            {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="text-xs text-slate-500 hover:text-slate-900">
            {mode === 'signin' ? "No account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="text-[11px] text-slate-400 hover:text-slate-600">← Home</Link>
        </div>
      </div>
    </div>
  );
}
