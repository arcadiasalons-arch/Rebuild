import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BookingModal from '@/components/hcb/BookingModal';
import { getProvider, safeWebUrl } from '@/data/providers';
import NotFound from './NotFound';

export default function Pro() {
  const { slug = '' } = useParams();
  const pro = getProvider(slug);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
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
          <h1 className="display mt-4 break-words text-6xl">{pro.name}</h1>
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
        {image && <img src={image} alt={pro.name} className="w-full object-cover" />}
      </main>
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
    </div>
  );
}
