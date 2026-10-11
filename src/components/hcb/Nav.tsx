import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { BRAND, NAV_LINKS, TEL_LINK } from '@/data/brand';
import { InstagramIcon } from './icons';

interface NavProps {
  onBook: () => void;
}

/** "HOUSE CALL Bronze / BY MEESH" wordmark — matches the owner-supplied header image. */
export function Wordmark({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const big = size === 'lg';
  return (
    <span className="block leading-none">
      <span
        className={`block whitespace-nowrap font-serif font-normal text-espresso ${
          big ? 'text-[30px]' : 'text-[19px] min-[390px]:text-[21px] sm:text-[26px] lg:text-[28px]'
        }`}
      >
        <span className="tracking-[0.2em]">HOUSE CALL</span>{' '}
        <em className="font-normal italic tracking-[0.01em]">Bronze</em>
      </span>
      <span
        className={`mt-2 block font-sans font-normal uppercase text-gold ${
          big ? 'text-[12px] tracking-[0.5em]' : 'text-[10px] tracking-[0.48em] sm:text-[11px]'
        }`}
      >
        By Meesh
      </span>
    </span>
  );
}

export default function Nav({ onBook }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          open
            ? 'border-b border-espresso/10 bg-cream'
            : scrolled
              ? 'border-b border-espresso/10 bg-ivory/95 backdrop-blur-md'
              : 'bg-ivory/80'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 md:px-10">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go('top');
            }}
            className="text-left"
            aria-label="House Call Bronze by Meesh — back to top"
          >
            <Wordmark />
          </a>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="link-underline text-[11px] uppercase tracking-[0.26em] text-espresso/80 hover:text-espresso"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${BRAND.instagramHandle}`}
              className="text-espresso/80 transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <button onClick={onBook} className="btn-primary !px-6 !py-3">
              Book Now
            </button>
          </div>

          <button
            className="-mr-2 p-2 text-espresso lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-7 w-7" strokeWidth={1.1} /> : <Menu className="h-7 w-7" strokeWidth={1.1} />}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 bottom-0 top-[72px] z-[45] overflow-y-auto bg-cream transition-all duration-500 lg:hidden ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="grain pointer-events-none absolute inset-0" />
        <div className="relative flex min-h-full flex-col justify-between px-6 pb-10 pt-4">
          <nav className="flex flex-col" aria-label="Mobile">
            <button
              onClick={() => {
                setOpen(false);
                onBook();
              }}
              className="border-b border-espresso/10 py-5 text-left text-[13px] uppercase tracking-[0.3em] text-espresso"
            >
              Book Now
            </button>
            {NAV_LINKS.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className="border-b border-espresso/10 py-5 text-left text-[13px] uppercase tracking-[0.3em] text-espresso"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="mt-12">
            <div className="mb-8">
              <Wordmark />
              <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-espresso/60">{BRAND.positioning}</p>
            </div>
            <div className="flex items-center justify-between border-t border-espresso/10 pt-6 text-[12px] tracking-[0.14em] text-espresso/75">
              <a href={TEL_LINK}>{BRAND.phoneDisplay}</a>
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <InstagramIcon /> {BRAND.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
