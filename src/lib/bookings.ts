import { supabase } from '@/lib/supabase';
import { v4 as uuid } from 'uuid';
import type { ServiceId, TravelId } from '@/data/brand';

export interface BookingInput {
  name: string;
  phone: string;
  email: string;
  serviceId: ServiceId;
  serviceName: string;
  locationType: 'house-call' | 'studio';
  guests: number;
  addOns: { id: string; name: string; price: number }[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or ''
  travel: TravelId | null;
  location: string;
  notes: string;
  estimateMin: number;
  estimateMax: number;
  estimateLabel: string;
  summary: string;
  siteSlug?: string;
}

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Saves a guest booking. Returns the new id, or throws with a friendly message. */
export async function createBooking(b: BookingInput): Promise<string> {
  const id = uuid();
  const { error } = await supabase.from('appointment_requests').insert({
    id,
    source: 'booking',
    name: b.name.trim().slice(0, 200),
    phone: b.phone.trim().slice(0, 40),
    email: b.email.trim().toLowerCase().slice(0, 254),
    service_id: b.serviceId,
    service_name: b.serviceName,
    site_slug: b.siteSlug ?? 'housecall',
    location_type: b.locationType,
    guests: b.guests,
    add_ons: b.addOns,
    preferred_date: b.date || null,
    preferred_time: b.time || null,
    travel: b.travel,
    location: b.location.trim().slice(0, 500) || null,
    notes: b.notes.trim().slice(0, 2000) || null,
    estimate_min: b.estimateMin,
    estimate_max: b.estimateMax,
    estimate_label: b.estimateLabel,
    sms_message: b.summary,
  });
  if (error) {
    console.error('Booking save failed:', error.message);
    throw new Error('We couldn’t save your booking. Please try again, or text Meesh directly.');
  }
  return id;
}

/** Emails the booking to Meesh and the client with calendar invite details. Never throws. */
export async function sendBookingEmails(appointmentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('booking-notify', { body: { appointmentId } });
    if (error) return false;
    return !!(data?.ok || data?.alreadySent);
  } catch {
    return false;
  }
}

/** Adds the client to the project CRM contact list. Never throws. */
export async function subscribeContact(b: Pick<BookingInput, 'name' | 'email' | 'phone'>, smsOptIn: boolean) {
  try {
    await fetch('https://famous.ai/api/crm/6ab7c11864006fdf3a05a860/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: b.email.trim(),
        name: b.name.trim() || undefined,
        phone: b.phone.trim() || undefined,
        sms_opt_in: smsOptIn === true,
        source: 'booking',
        tags: ['booking', 'client'],
      }),
    });
  } catch {
    /* non-blocking */
  }
}
