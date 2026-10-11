import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND, IMAGES, NAV_LINKS, SERVICES, TEL_LINK, TRAVEL, TREATMENTS, buildSmsLink } from '@/data/brand';
import Reveal from './Reveal';
import { InstagramIcon, MessageIcon } from './icons';

interface Props {
  onBook: () => void;
}

export default function Footer({ onBook }: Props) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-espresso/10 bg-cream text-espresso">
      <div className="grain absolute inset-0" />
      {/* Leather brand banner */}
      <div className="relative mx-auto max-w-[1400px] px-5 pt-20 md:px-10 md:pt-28">
        <Reveal className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <img
              src={IMAGES.leatherBanner}
              alt="House Call Bronze — gold HCB monogram on dark leather"
              loading="lazy"
              width={1200}
              height={480}
              sizes="(min-width: 1024px) 40vw, 100vw"
              decoding="async"
              className="mx-auto w-full max-w-md shadow-[0_24px_60px_-28px_rgba(0,0,0,0.5)]"
            />
          </div>
          <div className="text-center lg:col-span-7 lg:text-left">
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold">{BRAND.serviceArea}</p>
            <h2 className="display mt-6 text-[clamp(2.8rem,6.5vw,6rem)]">
              Turn your tan <em className="italic text-bronze">into a ritual.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[14px] leading-relaxed text-espresso/65 lg:mx-0">
              Add-ons: {TREATMENTS.map((t) => t.name.toLowerCase()).join(', ')}.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <button onClick={onBook} className="btn-primary group">
                Book Now
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
              <a href={buildSmsLink('Hi Meesh! I’d love to book a spray tan.')} className="btn-ghost">
                <MessageIcon /> Text {BRAND.phoneDisplay}
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-20 max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-2 gap-10 border-t border-espresso/15 py-16 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <div className="flex items-center gap-3">
              <img
                src={IMAGES.monogram}
                alt=""
                className="h-11 w-11 rounded-[10px] shadow-sm"
                loading="lazy"
                width={512}
                height={512}
                decoding="async"
              />
              <p className="font-serif text-2xl tracking-[0.14em]">HOUSE CALL BRONZE</p>
            </div>
            <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-espresso/65">{BRAND.positioning}</p>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-espresso/50">Explore</p>
            <ul className="mt-5 space-y-3 text-[14px]">
              <li>
                <button onClick={onBook} className="link-underline text-espresso/80 hover:text-espresso">Book Now</button>
              </li>
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <button onClick={() => go(l.id)} className="link-underline text-espresso/80 hover:text-espresso">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-espresso/50">Menu</p>
            <ul className="mt-5 space-y-3 text-[14px] text-espresso/80">
              {SERVICES.map((s) => (
                <li key={s.id} className="flex justify-between gap-4 md:max-w-[220px]">
                  <span>{s.name}</span>
                  <span className="text-espresso/55">{s.priceLabel}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 md:max-w-[220px]">
                <span>Travel 15+ mi</span>
                <span className="text-espresso/55">{TRAVEL.label}</span>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-espresso/50">Contact</p>
            <ul className="mt-5 space-y-3 text-[14px] text-espresso/80">
              <li>
                <a href={buildSmsLink('Hi Meesh!')} className="link-underline">Text {BRAND.phoneDisplay}</a>
              </li>
              <li>
                <a href={TEL_LINK} className="link-underline">Call {BRAND.phoneDisplay}</a>
              </li>
              <li>
                <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                  <InstagramIcon /> <span className="link-underline">{BRAND.instagramHandle}</span>
                </a>
              </li>
              <li className="text-espresso/55">{BRAND.serviceArea}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-espresso/15 py-8 pb-24 text-[11px] tracking-[0.14em] text-espresso/50 md:flex-row md:justify-between md:pb-8">
          <p>© {new Date().getFullYear()} House Call Bronze · Custom mobile spray tans</p>
          <p className="flex gap-6">
            <span>Appointments are confirmed by Meesh via text.</span>
            <Link to="/admin" className="text-espresso/35 hover:text-espresso/70">Studio</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
