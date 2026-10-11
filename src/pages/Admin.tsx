import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, LogOut, MessageSquare, RefreshCw, Search } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { IMAGES, STATUS_LABELS } from '@/data/brand';
import { claimAdmin, fetchAppointments, getIntegrationStatus, type Appointment } from '@/lib/admin';
import AdminLogin from '@/components/admin/AdminLogin';
import AppointmentDetail, { fmtDate, fmtTime } from '@/components/admin/AppointmentDetail';

type Filter = 'upcoming' | 'new' | 'all' | 'past';
const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [query, setQuery] = useState('');
  const [integrations, setIntegrations] = useState<{ twilio: boolean; twilioMissing: string[] } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    claimAdmin().then(setIsAdmin);
  }, [session]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchAppointments());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    load();
    getIntegrationStatus().then(setIntegrations).catch(() => setIntegrations(null));
  }, [isAdmin, load]);

  const visible = useMemo(() => {
    const t = todayISO();
    const q = query.trim().toLowerCase();
    return items
      .filter((a) => {
        if (filter === 'new') return a.status === 'new';
        if (filter === 'upcoming') return (a.preferred_date ?? '9999') >= t && a.status !== 'declined' && a.status !== 'completed';
        if (filter === 'past') return !!a.preferred_date && a.preferred_date < t;
        return true;
      })
      .filter((a) => !q || [a.name, a.phone, a.location ?? '', a.service_name].some((v) => v.toLowerCase().includes(q)))
      .sort((x, y) =>
        filter === 'upcoming'
          ? `${x.preferred_date ?? '9999'}${x.preferred_time ?? ''}`.localeCompare(`${y.preferred_date ?? '9999'}${y.preferred_time ?? ''}`)
          : y.created_at.localeCompare(x.created_at)
      );
  }, [items, filter, query]);

  const selected = items.find((a) => a.id === selectedId) ?? null;

  const openMessage = (id: string) => {
    setSelectedId(id);
    setTimeout(() => {
      document.getElementById('sms-thread')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelector<HTMLTextAreaElement>('[data-sms-input]')?.focus();
    }, 150);
  };

  if (!authReady) return <div className="flex min-h-screen items-center justify-center bg-espresso"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  if (!session) return <AdminLogin />;
  if (isAdmin === null) return <div className="flex min-h-screen items-center justify-center bg-ivory"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  if (!isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ivory px-6 text-center text-espresso">
        <p className="font-serif text-3xl">This login doesn’t have studio access.</p>
        <button onClick={() => supabase.auth.signOut()} className="btn-ghost">Sign out</button>
      </div>
    );

  const counts = {
    upcoming: items.filter((a) => (a.preferred_date ?? '9999') >= todayISO() && !['declined', 'completed'].includes(a.status)).length,
    new: items.filter((a) => a.status === 'new').length,
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <header className="sticky top-0 z-20 border-b border-espresso/10 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <img
              src={IMAGES.monogram}
              alt=""
              className="h-9 w-9 rounded-lg"
              width={512}
              height={512}
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="font-serif text-lg leading-none tracking-[0.14em]">HOUSE CALL BRONZE</p>
              <p className="text-[9px] uppercase tracking-[0.36em] text-gold">HouseCall</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-espresso/70">
            <Link to="/" className="hidden items-center gap-1.5 hover:text-espresso sm:flex"><ArrowLeft className="h-3.5 w-3.5" /> Site</Link>
            <button onClick={load} className="flex items-center gap-1.5 hover:text-espresso"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-1.5 hover:text-espresso"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-8">
        {integrations && !integrations.twilio && (
          <div className="mb-6 flex items-start gap-3 border border-gold/40 bg-cream px-5 py-4 text-[13px] leading-relaxed">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <div>
              <p>Two-way texting and reminders are off until these are added: {integrations.twilioMissing.join(', ')}.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <div className="flex flex-wrap gap-2">
              {([['upcoming', `Upcoming (${counts.upcoming})`], ['new', `New (${counts.new})`], ['past', 'Past'], ['all', 'All']] as [Filter, string][]).map(([k, label]) => (
                <button key={k} onClick={() => setFilter(k)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-colors ${filter === k ? 'bg-espresso text-cream' : 'border border-espresso/15 text-espresso/70 hover:border-espresso/40'}`}>
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-2 border-b border-espresso/20 py-2">
              <Search className="h-4 w-4 text-espresso/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, address" className="flex-1 bg-transparent text-[14px] focus:outline-none" />
            </label>

            {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}
            <ul className="mt-4 divide-y divide-espresso/10 border-y border-espresso/10">
              {loading && items.length === 0 && <li className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gold" /></li>}
              {!loading && visible.length === 0 && <li className="py-10 text-center text-[13px] text-espresso/50">No appointments here yet.</li>}
              {visible.map((a) => (
                <li key={a.id} className={`flex items-center gap-3 px-3 py-4 transition-colors ${selectedId === a.id ? 'bg-cream' : 'hover:bg-cream/50'}`}>
                  <button onClick={() => setSelectedId(a.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate font-serif text-xl">{a.name}</p>
                      <p className="shrink-0 text-[12px] text-espresso/60">{fmtDate(a.preferred_date).replace(/, \d{4}$/, '')}{a.preferred_time ? ` · ${fmtTime(a.preferred_time)}` : ''}</p>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-espresso/55">{a.service_name} · {a.location || 'Studio'}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                      <span className={`px-2 py-0.5 ${a.status === 'new' ? 'bg-blush text-espresso' : 'bg-espresso/5 text-espresso/60'}`}>{STATUS_LABELS[a.status]}</span>
                      {a.client_confirmed_at && <span className="bg-espresso px-2 py-0.5 text-cream">Client confirmed</span>}
                    </div>
                  </button>
                  <button onClick={() => openMessage(a.id)} className="flex shrink-0 items-center gap-1.5 border border-espresso/20 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-espresso/80 hover:border-espresso hover:text-espresso" aria-label={`Send message to ${a.name}`}>
                    <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">Send Message</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-7">
            {selected ? (
              <div className="lg:sticky lg:top-24">
                <AppointmentDetail appointment={selected} smsReady={!!integrations?.twilio} onChanged={load} />
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center border border-dashed border-espresso/15 text-[14px] text-espresso/45">
                Select an appointment to see details and messages.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
