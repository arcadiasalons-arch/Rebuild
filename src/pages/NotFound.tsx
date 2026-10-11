import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BRAND, IMAGES, buildSmsLink } from '@/data/brand';
import { InstagramIcon, MessageIcon } from '@/components/hcb/icons';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Page not found — House Call Bronze';
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="grain relative flex min-h-screen flex-col overflow-hidden bg-cream text-espresso">
      <header className="relative mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-6 md:px-10">
        <Link to="/" className="flex items-center gap-3 font-serif text-[19px] tracking-[0.16em]">
          <img src={IMAGES.monogram} alt="" className="h-10 w-10 rounded-[9px]" />
          HOUSE CALL BRONZE
        </Link>
        <a
          href={BRAND.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Instagram ${BRAND.instagramHandle}`}
          className="text-espresso/70 hover:text-gold"
        >
          <InstagramIcon className="h-[18px] w-[18px]" />
        </a>
      </header>

      <main className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-5 pb-20 md:px-10">
        <p className="eyebrow animate-fade-in">Error 404</p>
        <h1 className="display mt-6 text-[clamp(3.5rem,11vw,10rem)] animate-slide-in">
          This page
          <br />
          <em className="italic text-bronze">faded.</em>
        </h1>
        <p className="mt-8 max-w-md text-[16px] leading-relaxed text-espresso/70">
          The page you're looking for isn't here. Head back home, or text Meesh directly.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">
            Back to House Call Bronze
          </Link>
          <a href={buildSmsLink('Hi Meesh! I’d love to book a spray tan.')} className="btn-ghost">
            <MessageIcon /> Text {BRAND.phoneDisplay}
          </a>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
