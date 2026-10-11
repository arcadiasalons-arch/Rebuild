import { Link } from 'react-router-dom';
import { getPublishedProviders } from '@/data/providers';

export default function Community() {
  return (
    <section id="pros" className="bg-cream px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">House Call pros</p>
        <h2 className="display mt-4 text-4xl sm:text-5xl">Grow and <em className="text-bronze">glow together.</em></h2>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-espresso/75">
          We’re sunless pros who believe in building each other up. There’s room for all of us to grow and glow together. Want to join us?
        </p>
        <Link to="/join" className="mt-6 inline-block text-sm underline underline-offset-4">
          Request to join the House Call pros
        </Link>
        <ul className="mt-10 flex flex-wrap gap-4">
          {getPublishedProviders().map((pro) => (
            <li key={pro.slug}>
              <Link to={`/pros/${pro.slug}`} className="btn-ghost">
                Meet {pro.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
