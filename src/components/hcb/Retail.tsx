import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

const PRODUCTS = [
  {
    title: 'Body Renew Moisturizer',
    description: 'Peptide-rich daily hydration lotion formulated with Mango Seed Butter to deeply hydrate and protect tan longevity.',
    url: 'www.housecallbronze.com/',
  },
  {
    title: 'Mineral Defense Sunscreen',
    description: 'Reef-safe broad-spectrum SPF 30+ zinc oxide formula designed to protect skin without stripping tan color.',
    url: 'www.housecallbronze.com/',
  },
  {
    title: 'Glow on the Go Travel Set',
    description: 'TSA-approved 3oz mini aftercare trio (Shower Gel, Body Renew, Tan Extend) ideal for trips and sampling.',
    url: 'www.housecallbronze.com/',
  },
  {
    title: 'Shower Gel',
    description: 'pH-balanced, sulfate-free daily cleanser infused with natural oils to cleanse gently without stripping color.',
    url: 'www.housecallbronze.com/',
  },
  {
    title: 'Oil-Free Sugar Scrub',
    description: 'Fragrance-free, oil-free exfoliating body scrub made with organic sugar crystals to prep skin before tanning.',
    url: 'www.housecallbronze.com',
  },
  {
    title: 'Bronzing Mousse',
    description: 'Lightweight self-tanning mousse delivering a natural brown tone with instant cosmetic bronzer.',
    url: 'www.housecallbronze.com',
  },
];

export default function Retail() {
  return (
    <section id="retail" className="relative bg-cream">
      <div className="grain absolute inset-0" />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-12">
          <div>
            <p className="eyebrow">Sjolie</p>
            <h2 className="display mt-6 text-[clamp(2.6rem,5vw,4.5rem)] text-espresso">
              Take the <em className="italic text-bronze">glow</em> home.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-espresso/65">
            Retail store under construction. Please contact Meesh with any questions.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {PRODUCTS.map((product, idx) => (
            <Reveal key={idx}>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between h-full rounded-2xl border border-espresso/10 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-bronze hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="text-xl font-semibold text-espresso group-hover:text-bronze transition-colors">
                      {product.title}
                    </h3>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-espresso/40 group-hover:text-bronze group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-espresso/70 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-espresso/5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-bronze">
                  <span>Shop Official Site</span>
                  <span>&rarr;</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
