import { ArrowRight } from 'lucide-react';
import { ABOUT, BRAND, IMAGES, SERVICES } from '@/data/brand';

interface HeroProps {
  onBook: () => void;
}

export default function Hero({ onBook }: HeroProps) {
  return (
    <section id="top" className="relative overflow-hidden bg-cream pt-[72px]">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 lg:min-h-[calc(100vh-72px)] lg:grid-cols-12 lg:items-center lg:gap-10">
        {/* Text */}
        <div className="order-2 flex flex-col justify-between px-5 pb-14 pt-10 md:px-10 lg:order-1 lg:col-span-5 lg:py-16 lg:pr-0">
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="h-px w-10 bg-gold" />
            <span className="eyebrow">{BRAND.tagline} · {BRAND.serviceArea}</span>
          </div>

          <div className="my-10">
            <p className="max-w-lg font-serif text-[clamp(1.3rem,1.9vw,1.7rem)] font-light italic leading-snug text-bronze">
              “{ABOUT.quote}”
            </p>
            <h1 className="display mt-8 text-[clamp(3.2rem,6.4vw,6.5rem)] text-espresso">
              Your glow,
              <br />
              <em className="font-light italic text-bronze">your way.</em>
            </h1>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-espresso/75">
              Shade mixed for your skin. No UV. Just glow. <span className="text-espresso">Your place or mine.</span>
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button onClick={onBook} className="btn-primary group">
                Book Now
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-ghost"
              >
                Services & Pricing
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-t border-espresso/15 pt-6">
            {SERVICES.map((s) => (
              <div key={s.id}>
                <dt className="text-[10px] uppercase tracking-[0.22em] text-espresso/55">{s.name}</dt>
                <dd className="mt-1 font-serif text-2xl text-espresso md:text-3xl">{s.priceLabel}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Photo banner — shown in full, never cropped */}
        <div className="order-1 px-0 pt-4 sm:px-5 md:px-10 lg:order-2 lg:col-span-7 lg:py-16 lg:pl-0">
          <figure className="relative animate-fade-in overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:ring-1 sm:ring-gold/25">
            <img
              src={IMAGES.heroTriptych}
              alt="House Call Bronze custom spray tan results in Spokane — three sun-kissed bronzed-skin close-ups in swimwear."
              width={1476}
              height={704}
              sizes="(min-width: 1024px) 58vw, 100vw"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block aspect-[1476/704] h-auto w-full object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
