import { useEffect, useState } from 'react';
import { Check, Loader2, Lock, MapPin, Phone } from 'lucide-react';
import { BRAND, STATUS_LABELS, TRAVEL_OPTIONS } from '@/data/brand';
import { buildGoogleCalendarUrl, buildIcsDataUrl } from '@/lib/calendar';
import { updateAppointment, type Appointment } from '@/lib/admin';
import SmsThread from './SmsThread';

interface Props {
  appointment: Appointment;
  smsReady: boolean;
  onChanged: () => void;
}

export const fmtDate = (d: string | null) => {
  if (!d) return 'Flexible';
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
export const fmtTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function AppointmentDetail({ appointment: a, smsReady, onChanged }: Props) {
  const [notes, setNotes] = useState(a.private_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    setNotes(a.private_notes ?? '');
    setSavedNotes(false);
  }, [a.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateAppointment(a.id, { private_notes: notes.trim() || null });
      setSavedNotes(true);
      onChanged();
      setTimeout(() => setSavedNotes(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  };

  const setStatus = async (status: Appointment['status']) => {
    await updateAppointment(a.id, { status });
    onChanged();
  };

  const location = a.location || BRAND.studioAddress;
  const googleCalendarUrl =
    a.preferred_date && a.preferred_time
      ? buildGoogleCalendarUrl({
          title: `HouseCall — ${a.name}`,
          description: `${a.service_name}\n${a.notes ?? ''}`.trim(),
          location,
          date: a.preferred_date,
          time: a.preferred_time,
          durationMinutes: 60,
        })
      : '';
  const icsUrl =
    a.preferred_date && a.preferred_time
      ? buildIcsDataUrl({
          title: `HouseCall — ${a.name}`,
          description: `${a.service_name}\n${a.notes ?? ''}`.trim(),
          location,
          date: a.preferred_date,
          time: a.preferred_time,
          durationMinutes: 60,
        })
      : '';

  const approve = async () => {
    setApproving(true);
    try {
      await updateAppointment(a.id, { status: 'confirmed' });
      onChanged();
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{a.source === 'booking' ? 'Online booking' : 'Text request'}</p>
          <h2 className="mt-2 font-serif text-4xl font-light text-espresso">{a.name}</h2>
          <p className="mt-1 text-[14px] text-espresso/65">
            {a.service_name}{a.guests > 1 ? ` · ${a.guests} guests` : ''} · {a.estimate_label}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {a.status !== 'confirmed' && (
            <button onClick={approve} disabled={approving} className="btn-primary !px-5 !py-2.5 disabled:opacity-40">
              {approving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Approve booking'}
            </button>
          )}
          <select
            value={a.status}
            onChange={(e) => setStatus(e.target.value as Appointment['status'])}
            className="border border-espresso/20 bg-ivory px-3 py-2 text-[13px] text-espresso focus:border-gold focus:outline-none"
            aria-label="Appointment status"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-px border border-espresso/10 bg-espresso/10 sm:grid-cols-2">
        {[
          ['When', `${fmtDate(a.preferred_date)}${a.preferred_time ? ` · ${fmtTime(a.preferred_time)}` : ''}`],
          ['Client confirmed', a.client_confirmed_at ? `Yes — replied C ${new Date(a.client_confirmed_at).toLocaleString()}` : a.reminder_sent_at ? 'Reminder sent, awaiting reply' : 'Not yet'],
          ['Travel', a.travel ? TRAVEL_OPTIONS.find((t) => t.id === a.travel)?.label ?? a.travel : 'Coming to Meesh'],
        ].map(([k, v]) => (
          <div key={k} className="bg-ivory px-5 py-4">
            <dt className="text-[10px] uppercase tracking-[0.26em] text-espresso/50">{k}</dt>
            <dd className="mt-1 text-[14px] text-espresso">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 text-[14px] text-espresso/85">
        <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" strokeWidth={1.5} /> <a href={`tel:${a.phone}`} className="underline decoration-gold/50 underline-offset-4">{a.phone}</a></p>
        {a.location && (
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
            <a href={`https://maps.google.com/?q=${encodeURIComponent(a.location)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-gold/50 underline-offset-4">{a.location}</a>
          </p>
        )}
        {a.add_ons?.length > 0 && <p><span className="text-espresso/50">Add-ons:</span> {a.add_ons.map((x) => `${x.name} (+$${x.price})`).join(', ')}</p>}
        {a.notes && <p className="whitespace-pre-wrap border-l border-gold pl-4 text-espresso/75"><span className="text-espresso/50">Client notes:</span> {a.notes}</p>}
      </div>

      {(googleCalendarUrl || icsUrl) && (
        <div className="border border-espresso/10 bg-ivory/60 p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-espresso/60">Calendar sync</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            {googleCalendarUrl && (
              <a href={googleCalendarUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Add to Google Calendar
              </a>
            )}
            {icsUrl && (
              <a href={icsUrl} download="housecall-booking.ics" className="btn-ghost">
                Download invite
              </a>
            )}
          </div>
        </div>
      )}

      {/* Private notes — admin only (protected by database security rules) */}
      <div>
        <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-espresso/60">
          <Lock className="h-3 w-3" strokeWidth={1.5} /> Private notes · only visible to you
        </p>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={5000}
          placeholder="Skin tone, preferred depth, solution used, anything to remember…"
          className="mt-2 w-full resize-y border border-espresso/15 bg-ivory px-3 py-2 text-[14px] text-espresso focus:border-gold focus:outline-none"
        />
        <button onClick={saveNotes} disabled={savingNotes} className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-espresso hover:text-bronze">
          {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedNotes ? <Check className="h-3.5 w-3.5" /> : null}
          {savedNotes ? 'Saved' : 'Save private notes'}
        </button>
      </div>

      <SmsThread appointment={a} smsReady={smsReady} onSent={onChanged} />
    </div>
  );
}
