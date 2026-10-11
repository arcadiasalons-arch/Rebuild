import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BrandImage from '@/components/hcb/BrandImage';
import { getProvider, safeWebUrl } from '@/data/providers';
import { IMAGES } from '@/data/brand';
import NotFound from './NotFound';

const BookingModal = lazy(() => import('@/components/hcb/BookingModal'));

export default function Pro() {
  const { slug = '' } = useParams();
  const pro = getProvider(slug);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [slug]);
  if (!pro) return <NotFound />;
  const image = safeWebUrl(pro.imageUrl);
  const website = safeWebUrl(pro.websiteUrl);

  return (
    <div className="min-h-screen bg-ivory px-6 py-8 text-espresso sm:px-10">
      <header className="mx-auto max-w-5xl">
        <Link to="/" className="eyebrow">House Call Bronze</Link>
      </header>
      <main className="mx-auto grid max-w-5xl gap-10 py-16 md:grid-cols-2">
        <div>
          <p className="eyebrow">House Call pro</p>
          <h1 ref={headingRef} tabIndex={-1} className="display mt-4 break-words text-6xl">{pro.name}</h1>
          {pro.serviceArea && <p className="mt-5 text-bronze">{pro.serviceArea}</p>}
          {pro.bio && <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-espresso/75">{pro.bio}</p>}
          {website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block underline underline-offset-4">More from {pro.name}</a>}
          <p className="mt-8 text-sm leading-relaxed text-espresso/70">
            {pro.menu === 'meesh'
              ? 'Meesh’s services and prices are on the home page. Send a request here, and Meesh will confirm the details by text.'
              : `${pro.name} will confirm services, pricing, and availability directly. Meesh’s menu does not apply to this pro.`}
          </p>
          <button type="button" onClick={() => setOpen(true)} className="btn-primary mt-6">Request a booking with {pro.name}</button>
          <Link to="/join" className="mt-8 block text-sm underline underline-offset-4">Request to join the House Call pros</Link>
        </div>
        {image && (
          <BrandImage
            src={image}
            fallback={IMAGES.fallbackSilk}
            alt={pro.name}
            width={640}
            height={800}
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="lazy"
            className="w-full"
            imgClassName="object-cover"
          />
        )}
      </main>
      <Suspense fallback={null}>
        {open && (
          <BookingModal
            key={pro.slug}
            open={open}
            onClose={close}
            initialProviderSlug={pro.slug}
            serviceId="house-call"
            guests={3}
            travel="within"
            addOnIds={[]}
          />
        )}
      </Suspense>
    </div>
  );
}
