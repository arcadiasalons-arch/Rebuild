import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { buildSmsLink } from '@/data/brand';

export default function Join() {
  const [form, setForm] = useState({ name: '', business: '', area: '', contact: '', info: '' });
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const set = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = [
      'Hi Meesh! I’d like to join the House Call pros.',
      `Name: ${form.name.trim()}`,
      `Business name: ${form.business.trim()}`,
      `Service area: ${form.area.trim()}`,
      `Contact: ${form.contact.trim()}`,
      `About me / social link: ${form.info.trim() || 'Not supplied'}`,
    ].join('\n');
    window.location.href = buildSmsLink(body);
  };

  return (
    <div className="min-h-screen bg-cream px-6 py-8 text-espresso sm:px-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="eyebrow">House Call Bronze</Link>
        <main className="py-12">
          <h1 ref={headingRef} tabIndex={-1} className="display text-4xl sm:text-5xl">Join the House Call pros</h1>
          <p className="mt-6 leading-relaxed text-espresso/75">We’re sunless pros who believe in building each other up. There’s room for all of us to grow and glow together. Tell Meesh a little about you.</p>
          <form onSubmit={submit} className="mt-10 space-y-6">
            <div>
              <label htmlFor="join-name" className="field-label">Name</label>
              <input id="join-name" className="field" autoComplete="name" required maxLength={150} pattern=".*\S.*" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label htmlFor="join-business" className="field-label">Business name</label>
              <input id="join-business" className="field" autoComplete="organization" required maxLength={150} pattern=".*\S.*" value={form.business} onChange={(e) => set('business', e.target.value)} />
            </div>
            <div>
              <label htmlFor="join-area" className="field-label">Service area</label>
              <input id="join-area" className="field" required maxLength={200} pattern=".*\S.*" value={form.area} onChange={(e) => set('area', e.target.value)} />
            </div>
            <div>
              <label htmlFor="join-contact" className="field-label">Contact — phone or email</label>
              <input id="join-contact" className="field" required maxLength={200} pattern=".*\S.*" aria-describedby="join-contact-help" value={form.contact} onChange={(e) => set('contact', e.target.value)} />
              <p id="join-contact-help" className="mt-2 text-sm text-espresso/65">Where Meesh can reach you about joining.</p>
            </div>
            <div>
              <label htmlFor="join-info" className="field-label">About you or a social link (optional)</label>
              <textarea id="join-info" className="field min-h-28" maxLength={1000} value={form.info} onChange={(e) => set('info', e.target.value)} />
            </div>
            <p className="text-sm leading-relaxed text-espresso/70">This opens your messaging app with a text to Meesh. You’ll still need to send it. Meesh will follow up; requesting to join doesn’t publish a profile.</p>
            <button type="submit" className="btn-primary">Open text to Meesh</button>
          </form>
        </main>
      </div>
    </div>
  );
}
