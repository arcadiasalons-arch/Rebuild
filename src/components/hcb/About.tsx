import { useState } from 'react';
import { ABOUT, BRAND, IMAGES } from '@/data/brand';
import BrandImage from './BrandImage';
import Reveal from './Reveal';
import MeetMeesh from './MeetMeesh';
import { InstagramIcon } from './icons';

export default function About() {
  const [meetMeeshOpen, setMeetMeeshOpen] = useState(false);

  return (
    <section id="about" className="section-shell">
      <div className="grid gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
        <div className="md:col-span-4 lg:col-span-3">
          <Reveal from="left" className="md:sticky md:top-28">
            <div className="flex items-end gap-5 md:block">
              <BrandImage
                src={IMAGES.headshot}
                fallback={IMAGES.fallbackSilk}
                alt="Meesh, founder of House Call Bronze custom mobile spray tans in Spokane"
                className="aspect-[4/5] w-32 shrink-0 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.45)] ring-1 ring-gold/25 sm:w-40 md:w-full md:max-w-[260px]"
                imgClassName="object-[50%_30%]"
              />

              <div className="md:mt-6">
                <p className="font-serif text-2xl italic text-espresso">Meesh</p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gold">
                  Founder · Spray tan artist
                </p>

                <span className="mt-4 hidden h-px w-12 bg-gold md:block" />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
          <Reveal>
            <p className="eyebrow">About Meesh</p>

            <h2
              id="about-title"
              className="display mt-6 text-[clamp(2.6rem,5vw,4.6rem)] text-espresso"
            >
              Hi, <em className="italic text-bronze">I’m Meesh.</em>
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-[1.9] text-espresso/75">
              Want to know the story behind the glow?
            </p>

            <button
              type="button"
              onClick={() => setMeetMeeshOpen(true)}
              aria-haspopup="dialog"
              aria-controls="meet-meesh-dialog"
              className="btn-primary mt-8 inline-flex items-center justify-center"
            >
              Meet Meesh
            </button>
          </Reveal>

          <div className="mt-10 max-w-xl space-y-6">
            {ABOUT.story.map((p, i) => (
              <Reveal key={i} delay={60}>
                {p.pull ? (
                  <p className="border-l border-gold pl-5 font-serif text-[1.45rem] italic leading-snug text-espresso md:text-[1.7rem]">
                    {p.text}
                  </p>
                ) : (
                  <p className="text-[15px] leading-[1.9] text-espresso/75">
                    {p.text}
                  </p>
                )}
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.26em] text-espresso"
            >
              <InstagramIcon />

              <span className="link-underline">
                Follow {BRAND.instagramHandle}
              </span>
            </a>
          </Reveal>
        </div>
      </div>

      {meetMeeshOpen && (
        <div
          id="meet-meesh-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="meet-meesh-title"
          className="fixed inset-0 z-[100] overflow-y-auto"
        >
          <MeetMeesh onClose={() => setMeetMeeshOpen(false)} />
        </div>
      )}
    </section>
  );
}
