import { ArrowRight } from 'lucide-react';
import { IMAGES, SERVICES, TRAVEL, type ServiceId } from '@/data/brand';
import Reveal from './Reveal';

interface Props {
  selected: ServiceId;
  onSelect: (id: ServiceId) => void;
  onBook: () => void;
}

export default function ServicesShowcase({ selected, onSelect, onBook }: Props) {
  const pick = (id: ServiceId) => {
    onSelect(id);
    document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="relative overflow-hidden bg-espresso text-cream">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 py-24 md:px-10 md:py-32 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <figure className="relative bg-[#1d1c20] p-3 ring-1 ring-gold/30">
            <img
              src={IMAGES.artistCutout}
              alt="Meesh, spray tan artist, holding two spray-tan guns overhead"
              loading="lazy"
              className="aspect-[1125/1253] w-full object-cover"
            />
            <figcaption className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.34em] text-gold">
              The artist · Meesh
            </figcaption>
          </figure>
        </Reveal>

        <div className="flex flex-col justify-center lg:col-span-7">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Services & Pricing</p>
            <h2 className="display mt-6 text-[clamp(2.8rem,5.5vw,5.25rem)]">
              Your place <em className="italic text-blush">or mine.</em>
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-[1.9] text-cream/70">
              One custom tan, mixed for your skin. Delivered to your door, or at Meesh’s studio.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-12">
            <ul className="border-t border-cream/15">
              {SERVICES.map((s) => {
                const active = s.id === selected;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pick(s.id)}
                      aria-pressed={active}
                      className="group flex w-full items-baseline justify-between gap-6 border-b border-cream/15 py-6 text-left"
                    >
                      <span>
                        <span className={`font-serif text-3xl font-light transition-colors duration-500 md:text-4xl ${active ? 'text-blush' : 'group-hover:text-blush'}`}>
                          {s.name}
                        </span>
                        <span className="mt-1 block text-[14px] text-cream/60">{s.description}</span>
                      </span>
                      <span className="shrink-0 font-serif text-2xl text-gold md:text-3xl">{s.priceLabel}</span>
                    </button>
                  </li>
                );
              })}
              <li className="flex items-baseline justify-between gap-6 border-b border-cream/15 py-5">
                <span className="text-[13px] uppercase tracking-[0.22em] text-cream/70">{TRAVEL.name}</span>
                <span className="shrink-0 text-[15px] tracking-[0.08em] text-gold">{TRAVEL.label}</span>
              </li>
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onBook}
                className="group inline-flex items-center justify-center gap-3 bg-cream px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-espresso transition-colors duration-500 hover:bg-blush"
              >
                Book Now
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center border border-cream/40 px-8 py-4 text-[11px] uppercase tracking-[0.28em] transition-colors duration-500 hover:bg-cream hover:text-espresso"
              >
                Add luxury treatments
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
