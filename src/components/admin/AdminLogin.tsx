import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { IMAGES } from '@/data/brand';

export default function AdminLogin() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'err' | 'ok'; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const fn = mode === 'in' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { data, error } = await fn.call(supabase.auth, { email: email.trim(), password });
    setBusy(false);
    if (error) return setMsg({ tone: 'err', text: error.message });
    if (mode === 'up' && !data.session) setMsg({ tone: 'ok', text: 'Check your email to confirm your account, then sign in.' });
  };

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-espresso px-5 text-cream">
      <form onSubmit={submit} className="relative w-full max-w-sm">
        <img
          src={IMAGES.monogram}
          alt="House Call Bronze"
          className="mx-auto h-20 w-20 rounded-2xl"
          width={512}
          height={512}
          loading="eager"
          decoding="async"
        />
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.36em] text-gold">HouseCall</p>
        <h1 className="mt-3 text-center font-serif text-4xl font-light">
          {mode === 'in' ? 'Welcome back.' : 'Create your login.'}
        </h1>
        <div className="mt-10 space-y-6">
          <div>
            <label htmlFor="ad-email" className="block text-[10px] uppercase tracking-[0.28em] text-cream/55">Email</label>
            <input id="ad-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="mt-2 w-full border-0 border-b border-cream/25 bg-transparent px-0 py-3 text-[15px] focus:border-gold focus:outline-none focus:ring-0" />
          </div>
          <div>
            <label htmlFor="ad-pass" className="block text-[10px] uppercase tracking-[0.28em] text-cream/55">Password</label>
            <input id="ad-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              className="mt-2 w-full border-0 border-b border-cream/25 bg-transparent px-0 py-3 text-[15px] focus:border-gold focus:outline-none focus:ring-0" />
          </div>
        </div>
        {msg && <p className={`mt-6 text-[13px] ${msg.tone === 'err' ? 'text-red-300' : 'text-blush'}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="mt-10 inline-flex w-full items-center justify-center gap-2 bg-cream px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-espresso transition-colors hover:bg-blush disabled:opacity-60">
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {mode === 'in' ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="mt-6 w-full text-center text-[12px] text-cream/55 hover:text-cream">
          {mode === 'in' ? 'First time here? Create the HouseCall login' : 'Already have a login? Sign in'}
        </button>
      </form>
    </div>
  );
}
