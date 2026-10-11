import { supabase } from '@/lib/supabase';

export interface Appointment {
  id: string;
  created_at: string;
  source: 'sms-request' | 'booking';
  name: string;
  phone: string;
  service_id: string;
  service_name: string;
  site_slug?: string;
  location_type?: 'house-call' | 'studio';
  guests: number;
  add_ons: { id: string; name: string; price: number }[];
  preferred_date: string | null;
  preferred_time: string | null;
  travel: string | null;
  location: string | null;
  notes: string | null;
  estimate_min: number;
  estimate_max: number;
  estimate_label: string;
  status: 'new' | 'contacted' | 'confirmed' | 'declined' | 'completed';
  client_confirmed_at: string | null;
  reminder_sent_at: string | null;
  private_notes: string | null;
  last_message_at: string | null;
}

export interface SmsMessage {
  id: string;
  created_at: string;
  appointment_id: string | null;
  phone: string;
  direction: 'inbound' | 'outbound';
  body: string;
  kind: string;
  status: string | null;
  error: string | null;
}

export const last10 = (p: string) => (p || '').replace(/\D/g, '').slice(-10);

export async function claimAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('claim_admin');
  if (error) {
    console.error(error.message);
    return false;
  }
  return !!data;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointment_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function updateAppointment(id: string, patch: Partial<Pick<Appointment, 'status' | 'private_notes'>>) {
  const { error } = await supabase.from('appointment_requests').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Messages linked to this appointment, or to the same phone number. */
export async function fetchThread(a: Appointment): Promise<SmsMessage[]> {
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1000);
  if (error) throw new Error(error.message);
  const key = last10(a.phone);
  return ((data ?? []) as SmsMessage[]).filter((m) => m.appointment_id === a.id || last10(m.phone) === key);
}

async function adminCall<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('hcb-admin', { body });
  if (error) {
    let message = error.message;
    try {
      const ctx = (error as unknown as { context?: Response }).context;
      if (ctx) message = (await ctx.json())?.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export const getIntegrationStatus = () =>
  adminCall<{ twilio: boolean; twilioMissing: string[] }>({ action: 'status' });

export const sendSms = (appointmentId: string, body: string) => adminCall({ action: 'send', appointmentId, body });
