import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ALL_ADDONS, BRAND, IMAGES, buildSmsLink, calculateEstimate, getService, type ServiceId, type TravelId } from '@/data/brand';
import EstimateSummary from './EstimateSummary';

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

const toISO = (d: Date) => {
  const local = new Date(d);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toISO(d);
};

// Next-day availability for the coming 8 weeks, closed Sundays.
const BOOKING_WINDOW_DAYS = 56;
const availableDates = () => {
  const dates: string[] = [];
  const d = new Date();
  for (let i = 1; i <= BOOKING_WINDOW_DAYS; i++) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) dates.push(toISO(d));
  }
  return dates;
};

// On the hour and half hour, 8:00 AM through 8:00 PM.
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

const TERMS_TEXT =
  'Before You Book\n\nAll appointments are requests and are not confirmed until Meesh provides final approval based on current availability. Please provide accurate information and allow 24 hours\' notice for cancellations or rescheduling. By submitting a request, you agree to these terms and acknowledge that services may be declined or rescheduled when necessary for safety or scheduling reasons.';

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

export default function BookingModal(props: Props) {
  const { open, onClose, serviceId, guests, travel, addOnIds } = props;
  const service = getService(serviceId);
  const [form, setForm] = useState({ name: '', date: '', time: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [termsOpen, setTermsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (termsOpen) setTermsOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, termsOpen]);

  useEffect(() => {
    if (!open) {
      setTermsOpen(false);
      setForm((f) => ({ ...f, date: '' }));
      return;
    }
    setTimeout(() => dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (termsOpen) termsRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, [termsOpen]);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const dateOptions = useMemo(() => (open ? availableDates() : []), [open]);

  const est = calculateEstimate({ serviceId, guests, travel, addOnIds });
  const chosen = ALL_ADDONS.filter((a) => addOnIds.includes(a.id));

  const summary = useMemo(() => {
    const lines = [
      `Hi Meesh! I'd like to book a spray tan.`,
      ``,
      `Name: ${form.name.trim()}`,
      `Service: ${service.name} (${service.priceLabel})`,
      `Location type: ${service.onSite ? 'House call' : 'Studio'}`,
    ];
    if (service.perPerson) lines.push(`Guests: ${est.people}`);
    lines.push(`Add-ons: ${chosen.length ? chosen.map((a) => `${a.name} (+$${a.price})`).join(', ') : 'None'}`);
    lines.push(`Date: ${formatDate(form.date) || 'Flexible'}`);
    lines.push(`Time: ${formatTime(form.time) || 'Flexible'}`);
    lines.push(`Address: ${service.onSite ? 'To be confirmed by text' : BRAND.studioAddress}`);
    lines.push(``, `Estimated total: ${est.label}`);
    return lines.join('\n');
  }, [chosen, est.label, est.people, form.date, form.name, form.time, service.name, service.onSite, service.perPerson, service.priceLabel]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please add your full name.';
    if (!form.date || form.date < tomorrowISO() || !dateOptions.includes(form.date)) e.date = 'Choose a date.';
    if (!form.time || !TIME_SLOTS.includes(form.time)) e.time = 'Choose a time.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinue = (ev: FormEvent) => {
    ev.preventDefault();
    if (validate()) setTermsOpen(true);
  };

  const closeTerms = () => {
    setTermsOpen(false);
    setTimeout(() => continueRef.current?.focus(), 0);
  };

  // Same action as the former "Send these details to Meesh" link: open a text to Meesh pre-filled with the summary.
  const acceptTerms = () => {
    closeTerms();
    window.location.href = buildSmsLink(summary);
  };

  const trapTermsFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const buttons = termsRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p className="mt-1.5 text-[12px] text-destructive">{errors[k]}</p> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-6" role="presentation">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        aria-hidden={termsOpen || undefined}
        className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden bg-ivory shadow-2xl animate-slide-in sm:h-auto sm:max-h-[92vh] md:flex-row"
      >
        <button
          onClick={onClose}
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
              {['Share your name', 'Pick a day and time', 'Meesh confirms by text'].map((s, i) => (
                <li key={s} className="flex items-baseline gap-3 text-[13px] text-cream/70">
                  <span className="text-[10px] tracking-[0.3em] text-gold">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-12 sm:px-10">
          <form onSubmit={onContinue} noValidate>
            <p className="eyebrow">Book HouseCall · no account needed</p>
            <h2 id="booking-title" className="display mt-4 text-5xl text-espresso">
              Simple booking, <em className="italic text-bronze">done fast.</em>
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
              <div className="sm:col-span-2">
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
                  aria-invalid={!!errors.name || undefined}
                />
                <Err k="name" />
              </div>

              <div>
                <label htmlFor="bk-date" className="field-label">
                  Pick a day
                </label>
                <select
                  id="bk-date"
                  className="field cursor-pointer"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  required
                  aria-invalid={!!errors.date || undefined}
                >
                  <option value="" disabled>
                    Select a day
                  </option>
                  {dateOptions.map((d) => (
                    <option key={d} value={d}>
                      {formatDate(d)}
                    </option>
                  ))}
                </select>
                <Err k="date" />
              </div>
              <div>
                <label htmlFor="bk-time" className="field-label">
                  Pick a time
                </label>
                <select
                  id="bk-time"
                  className="field cursor-pointer"
                  value={form.time}
                  onChange={(e) => set('time', e.target.value)}
                  required
                  aria-invalid={!!errors.time || undefined}
                >
                  <option value="" disabled>
                    Select a time
                  </option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
                <Err k="time" />
              </div>
            </div>

            <button ref={continueRef} type="submit" className="btn-primary group mt-10 w-full sm:w-auto">
              Continue
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
            </button>

            <div className="mt-10 bg-cream p-6 text-espresso md:hidden">
              <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="light" compact />
            </div>
          </form>
        </div>
      </div>

      {termsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={closeTerms} />
          <div
            ref={termsRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            aria-describedby="terms-text"
            onKeyDown={trapTermsFocus}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-ivory px-6 pb-8 pt-10 shadow-2xl animate-slide-in sm:px-10"
          >
            <p className="eyebrow">Before you book</p>
            <h2 id="terms-title" className="display mt-4 text-4xl text-espresso">
              Terms &amp; <em className="italic text-bronze">conditions</em>
            </h2>
            <p id="terms-text" className="mt-5 text-[14px] leading-relaxed text-espresso/75">
              {TERMS_TEXT}
            </p>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closeTerms} className="btn-ghost w-full sm:w-auto">
                Cancel
              </button>
              <button type="button" onClick={acceptTerms} className="btn-primary w-full sm:w-auto">
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
