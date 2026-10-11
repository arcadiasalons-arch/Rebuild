import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Loader2, MessageSquare, X } from 'lucide-react';
import { EMAIL_RE, createBooking, sendBookingEmails, subscribeContact } from '@/lib/bookings';
import { buildGoogleCalendarUrl, buildIcsDataUrl } from '@/lib/calendar';
import {
  ALL_ADDONS,
  BRAND,
  IMAGES,
  SERVICES,
  TRAVEL_OPTIONS,
  buildSmsLink,
  calculateEstimate,
  getService,
  type ServiceId,
  type TravelId,
} from '@/data/brand';
import EstimateSummary from './EstimateSummary';
import { MessageIcon } from './icons';

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: ServiceId;
  guests: number;
  travel: TravelId;
  addOnIds: string[];
  onService: (id: ServiceId) => void;
  onTravel: (t: TravelId) => void;
  onGuests: (n: number) => void;
  onToggleAddOn: (id: string) => void;
}

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const formatDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

type DoneState = {
  emailed: boolean;
  googleCalendarUrl: string;
  icsUrl: string;
};

const REMINDER_MINUTES = [1440, 60] as const;

export default function BookingModal(props: Props) {
  const { open, onClose, serviceId, guests, travel, addOnIds } = props;
  const service = getService(serviceId);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', location: '', notes: '' });
  const [consent, setConsent] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<DoneState | null>(null);
  const [submitError, setSubmitError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    setTimeout(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 50);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, busy]);

  useEffect(() => {
    if (!open) {
      setDone(null);
      setSubmitError('');
    }
  }, [open]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const est = calculateEstimate({ serviceId, guests, travel, addOnIds });
  const chosen = ALL_ADDONS.filter((a) => addOnIds.includes(a.id));
  const calendarDetails = useMemo(() => {
    const location = service.onSite ? form.location.trim() : BRAND.studioAddress;
    const notes = [
      `Service: ${service.name}`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim()}`,
      `Location type: ${service.onSite ? 'House call' : 'Studio'}`,
      service.onSite ? `Address: ${location}` : `Studio: ${location}`,
      chosen.length ? `Add-ons: ${chosen.map((a) => a.name).join(', ')}` : 'Add-ons: none',
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : '',
      `Reminder alerts: 24 hours and 1 hour before`,
      `Estimated total: ${est.label}`,
    ]
      .filter(Boolean)
      .join('\n');

    return {
      title: `HouseCall — ${service.name}`,
      description: notes,
      location,
      googleCalendarUrl: form.date && form.time ? buildGoogleCalendarUrl({ title: `HouseCall — ${service.name}`, description: notes, location, date: form.date, time: form.time, durationMinutes: 60 }) : '',
      icsUrl: form.date && form.time ? buildIcsDataUrl({ title: `HouseCall — ${service.name}`, description: notes, location, date: form.date, time: form.time, durationMinutes: 60, reminderMinutes: REMINDER_MINUTES }) : '',
    };
  }, [chosen, est.label, form.date, form.email, form.location, form.name, form.notes, form.phone, form.time, service.name, service.onSite]);

  const summary = useMemo(() => {
    const lines = [
      `Hi Meesh! I'd like to book a spray tan.`,
      ``,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim()}`,
      `Service: ${service.name} (${service.priceLabel})`,
      `Location type: ${service.onSite ? 'House call' : 'Studio'}`,
    ];
    if (service.perPerson) lines.push(`Guests: ${est.people}`);
    lines.push(`Add-ons: ${chosen.length ? chosen.map((a) => `${a.name} (+$${a.price})`).join(', ') : 'None'}`);
    lines.push(`Date: ${formatDate(form.date) || 'Flexible'}`);
    lines.push(`Time: ${formatTime(form.time) || 'Flexible'}`);
    lines.push(`Address: ${service.onSite ? form.location.trim() || 'Requested in booking form' : BRAND.studioAddress}`);
    if (form.notes.trim()) lines.push(`Notes: ${form.notes.trim()}`);
    lines.push(``, `Estimated total: ${est.label}`);
    return lines.join('\n');
  }, [chosen, est.label, est.people, form.date, form.email, form.location, form.name, form.notes, form.phone, form.time, service.name, service.onSite, service.perPerson, service.priceLabel]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please add your full name.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Add a valid email for your confirmation and calendar invite.';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Add a mobile number so Meesh can reach you.';
    if (!form.date) e.date = 'Choose a date.';
    else if (form.date < todayISO()) e.date = 'Choose a date from today onward.';
    if (!form.time) e.time = 'Choose a time.';
    if (service.onSite && !form.location.trim()) e.location = 'Where should Meesh meet you?';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (busy || !validate()) return;
    setBusy(true);
    setSubmitError('');
    try {
      const id = await createBooking({
        name: form.name,
        phone: form.phone,
        email: form.email,
        serviceId,
        serviceName: service.name,
        locationType: service.onSite ? 'house-call' : 'studio',
        guests: est.people,
        addOns: chosen.map(({ id, name, price }) => ({ id, name, price })),
        date: form.date,
        time: form.time,
        travel: service.onSite ? travel : null,
        location: form.location,
        notes: form.notes,
        estimateMin: est.min,
        estimateMax: est.max,
        estimateLabel: est.label,
        summary,
      });

      const [emailed] = await Promise.all([
        sendBookingEmails(id),
        subscribeContact({ name: form.name, email: form.email, phone: form.phone }, consent),
      ]);

      setDone({ emailed, googleCalendarUrl: calendarDetails.googleCalendarUrl, icsUrl: calendarDetails.icsUrl });
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p className="mt-1.5 text-[12px] text-destructive">{errors[k]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !busy && onClose()} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-ivory shadow-2xl animate-slide-in sm:h-auto sm:max-h-[92vh] md:flex-row"
      >
        <button
          onClick={onClose}
          disabled={busy}
          className="absolute right-4 top-4 z-10 p-2 text-espresso/70 transition-colors hover:text-espresso md:text-cream/70 md:hover:text-cream"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.3} />
        </button>

        <aside className="relative hidden w-[38%] shrink-0 overflow-y-auto bg-espresso text-cream md:block">
          <img src={IMAGES.artistCutout} alt="" className="h-56 w-full bg-[#1d1c20] object-cover object-[50%_20%]" />
          <div className="relative p-9">
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold">HouseCall booking</p>
            <h3 className="mt-3 font-serif text-4xl font-light italic leading-tight">{service.name}</h3>
            <div className="mt-7">
              <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="dark" />
            </div>
            <ol className="mt-9 space-y-3 border-t border-cream/15 pt-6">
              {['Pick your service', 'Share your details', 'Get your calendar invite'].map((s, i) => (
                <li key={s} className="flex items-baseline gap-3 text-[13px] text-cream/70">
                  <span className="text-[10px] tracking-[0.3em] text-gold">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-12 sm:px-10">
          {!done ? (
            <form onSubmit={submit} noValidate>
              <p className="eyebrow">Book HouseCall · no account needed</p>
              <h2 id="booking-title" className="display mt-4 text-5xl text-espresso">
                Simple booking, <em className="italic text-bronze">done fast.</em>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-espresso/65">
                Share your details and choose studio or house call. Meesh will review it, then you’ll get a calendar
                invite and confirmation by email.
              </p>

              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="bk-name" className="field-label">
                    Full name
                  </label>
                  <input
                    id="bk-name"
                    className="field"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                    required
                  />
                  <Err k="name" />
                </div>
                <div>
                  <label htmlFor="bk-email" className="field-label">
                    Email
                  </label>
                  <input
                    id="bk-email"
                    type="email"
                    inputMode="email"
                    className="field"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="email"
                    placeholder="you@email.com"
                    required
                  />
                  <Err k="email" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bk-phone" className="field-label">
                    Mobile phone
                  </label>
                  <input
                    id="bk-phone"
                    type="tel"
                    className="field"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    autoComplete="tel"
                    placeholder="(509) 000-0000"
                    required
                  />
                  <Err k="phone" />
                </div>

                <div className={service.perPerson ? '' : 'sm:col-span-2'}>
                  <label htmlFor="bk-service" className="field-label">
                    Service
                  </label>
                  <select
                    id="bk-service"
                    className="field cursor-pointer"
                    value={serviceId}
                    onChange={(e) => props.onService(e.target.value as ServiceId)}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.priceLabel}
                      </option>
                    ))}
                  </select>
                </div>
                {service.perPerson && (
                  <div>
                    <label htmlFor="bk-guests" className="field-label">
                      Guests (min. {service.minPeople})
                    </label>
                    <input
                      id="bk-guests"
                      type="number"
                      min={service.minPeople}
                      max={20}
                      className="field"
                      value={est.people}
                      onChange={(e) => props.onGuests(Math.max(service.minPeople ?? 1, Math.min(20, Number(e.target.value) || 0)))}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="bk-date" className="field-label">
                    Date
                  </label>
                  <input id="bk-date" type="date" min={todayISO()} className="field" value={form.date} onChange={(e) => set('date', e.target.value)} />
                  <Err k="date" />
                </div>
                <div>
                  <label htmlFor="bk-time" className="field-label">
                    Time
                  </label>
                  <input id="bk-time" type="time" className="field" value={form.time} onChange={(e) => set('time', e.target.value)} />
                  <Err k="time" />
                </div>

                {service.onSite ? (
                  <div className="sm:col-span-2">
                    <label htmlFor="bk-location" className="field-label">
                      House call address
                    </label>
                    <input
                      id="bk-location"
                      className="field"
                      value={form.location}
                      onChange={(e) => set('location', e.target.value)}
                      autoComplete="street-address"
                      placeholder="Home or hotel address"
                    />
                    <Err k="location" />
                  </div>
                ) : (
                  <div className="sm:col-span-2 border-l border-gold pl-4 text-[13px] leading-relaxed text-espresso/60">
                    Studio visits use {BRAND.studioAddress}.
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="bk-notes" className="field-label">
                    Notes for Meesh
                  </label>
                  <textarea
                    id="bk-notes"
                    rows={3}
                    className="field resize-none"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Skin prep, event date, desired depth, parking notes…"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-espresso/65">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-espresso" />
                    <span>Text me booking updates and reminders. Msg & data rates may apply. Reply STOP to unsubscribe.</span>
                  </label>
                </div>
              </div>

              <div className="mt-10 bg-cream p-6 text-espresso md:hidden">
                <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="light" compact />
              </div>

              {submitError && <p className="mt-6 text-[13px] text-destructive">{submitError}</p>}

              <button type="submit" disabled={busy} aria-busy={busy} className="btn-primary group mt-8 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto">
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} /> Saving your booking…
                  </>
                ) : (
                  <>
                    Send booking request
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                  </>
                )}
              </button>
              <p className="mt-4 text-[12px] leading-relaxed text-espresso/50">
                Prefer to text?{' '}
                <a href={buildSmsLink(summary)} className="text-espresso underline decoration-gold underline-offset-4">
                  Send these details to {BRAND.phoneDisplay}
                </a>
                .
              </p>
            </form>
          ) : (
            <div className="flex h-full flex-col">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold text-gold">
                <Check className="h-5 w-5" strokeWidth={1.3} />
              </span>
              <p className="eyebrow mt-8">Booking received</p>
              <h2 id="booking-title" className="display mt-4 text-5xl text-espresso">
                You’re on <em className="italic text-bronze">Meesh’s list.</em>
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-relaxed text-espresso/65">
                {done.emailed ? (
                  <>
                    Your confirmation is on its way to <span className="text-espresso">{form.email}</span>. Meesh will review
                    the request and send the final approval. Tap the calendar button below and your device will open the
                    event with the details filled in.
                  </>
                ) : (
                  <>
                    Meesh will reach out at <span className="text-espresso">{form.email}</span> or{' '}
                    <span className="text-espresso">{form.phone}</span> to confirm your time and details.
                  </>
                )}
              </p>
              <div className="mt-4 max-w-md text-[13px] text-espresso/60">
                <p>{service.onSite ? `House call · ${form.location.trim() || 'Address provided in booking form'}` : BRAND.studioAddress}</p>
                <p className="mt-1">
                  {formatDate(form.date)} · {formatTime(form.time)}
                </p>
              </div>
              <div className="mt-8 border border-espresso/15 bg-cream/60 p-5 text-[13px] leading-relaxed text-espresso/75">
                <p>{service.name}</p>
                <p className="mt-1">Estimated total: {est.label}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={done.icsUrl} download="housecall-booking.ics" className="btn-primary">
                  Add to my calendar
                </a>
                <a href={done.googleCalendarUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                  <MessageSquare /> Open Google Calendar
                </a>
                <button type="button" onClick={onClose} className="btn-ghost">
                  Done
                </button>
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-espresso/50">
                Calendar invite includes reminders 24 hours and 1 hour before the appointment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
