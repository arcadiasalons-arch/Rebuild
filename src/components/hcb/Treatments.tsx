import { Minus, Plus, ArrowRight } from 'lucide-react';
import {
  SERVICES,
  TREATMENTS,
  MENU_OPTIONS,
  TRAVEL_OPTIONS,
  calculateEstimate,
  getService,
  type AddOn,
  type ServiceId,
  type TravelId,
} from '@/data/brand';
import EstimateSummary from './EstimateSummary';
import Reveal from './Reveal';

interface TreatmentsProps {
  serviceId: ServiceId;
  guests: number;
  travel: TravelId;
  addOnIds: string[];
  onService: (id: ServiceId) => void;
  onGuests: (n: number) => void;
  onTravel: (t: TravelId) => void;
  onToggleAddOn: (id: string) => void;
  onClearAddOns: () => void;
  onRequest: () => void;
}

function AddOnRow({ addOn, active, onToggle }: { addOn: AddOn; active: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className={`group flex w-full items-start gap-5 border-b border-espresso/15 py-6 text-left transition-colors duration-500 ${
          active ? 'bg-petal/50' : 'hover:bg-cream/70'
        }`}
      >
        <span
          className={`mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-500 ${
            active ? 'border-espresso bg-espresso' : 'border-espresso/40 group-hover:border-espresso'
          }`}
          aria-hidden="true"
        >
          <span className={`h-1.5 w-1.5 bg-cream transition-transform duration-500 ${active ? 'scale-100' : 'scale-0'}`} />
        </span>
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-4">
            <span className="font-serif text-2xl font-light text-espresso md:text-[1.7rem]">{addOn.name}</span>
            <span className="shrink-0 text-[13px] tracking-[0.12em] text-bronze">+${addOn.price}</span>
          </span>
          {addOn.description && (
            <span className="mt-1.5 block text-[14px] leading-relaxed text-espresso/60">{addOn.description}</span>
          )}
        </span>
      </button>
    </li>
  );
}

export default function Treatments(props: TreatmentsProps) {
  const { serviceId, guests, travel, addOnIds } = props;
  const service = getService(serviceId);
  const est = calculateEstimate({ serviceId, guests, travel, addOnIds });

  return (
    <section id="treatments" className="relative bg-ivory">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">Luxury treatments + add-ons</p>
          <h2 className="display mt-6 text-[clamp(2.6rem,5vw,4.75rem)] text-espresso">
            Build your <em className="italic text-bronze">glow.</em>
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.9] text-espresso/70">
            Choose your tan, then layer in the extras. Your estimate updates as you go — Meesh confirms the final price
            with you by text.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {/* Step 1 — service */}
            <div>
              <p className="field-label">01 — Your tan</p>
              <div className="mt-4 grid grid-cols-1 gap-px bg-espresso/15 border border-espresso/15 sm:grid-cols-3">
                {SERVICES.map((s) => {
                  const active = s.id === serviceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => props.onService(s.id)}
                      aria-pressed={active}
                      className={`px-5 py-5 text-left transition-colors duration-500 ${
                        active ? 'bg-espresso text-cream' : 'bg-ivory text-espresso hover:bg-cream'
                      }`}
                    >
                      <span className="block font-serif text-2xl font-light">{s.name}</span>
                      <span className={`mt-1 block text-[12px] tracking-[0.1em] ${active ? 'text-blush' : 'text-bronze'}`}>
                        {s.priceLabel}
                      </span>
                      <span className={`mt-2 block text-[12px] leading-snug ${active ? 'text-cream/65' : 'text-espresso/55'}`}>
                        {s.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(service.perPerson || service.onSite) && (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {service.perPerson && (
                    <div>
                      <p className="field-label">Guests (min. {service.minPeople})</p>
                      <div className="mt-3 inline-flex items-center border border-espresso/25">
                        <button
                          type="button"
                          onClick={() => props.onGuests(Math.max(service.minPeople ?? 1, guests - 1))}
                          className="px-4 py-3 text-espresso/70 hover:text-espresso disabled:opacity-30"
                          disabled={guests <= (service.minPeople ?? 1)}
                          aria-label="Fewer guests"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="w-12 text-center font-serif text-2xl">{est.people}</span>
                        <button
                          type="button"
                          onClick={() => props.onGuests(Math.min(20, guests + 1))}
                          className="px-4 py-3 text-espresso/70 hover:text-espresso"
                          aria-label="More guests"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  )}
                  {service.onSite && (
                    <div>
                      <label htmlFor="builder-travel" className="field-label">
                        Travel
                      </label>
                      <select
                        id="builder-travel"
                        value={travel}
                        onChange={(e) => props.onTravel(e.target.value as TravelId)}
                        className="field mt-1 cursor-pointer"
                      >
                        {TRAVEL_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 — treatments */}
            <div className="mt-16">
              <div className="flex items-baseline justify-between">
                <p className="field-label">02 — Treatment add-ons</p>
                {addOnIds.length > 0 && (
                  <button
                    type="button"
                    onClick={props.onClearAddOns}
                    className="link-underline text-[10px] uppercase tracking-[0.26em] text-espresso/55 hover:text-espresso"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <p className="mt-2 font-serif text-lg italic text-espresso/60">Mixed into your tan.</p>
              <ul className="mt-4 border-t border-espresso/15">
                {TREATMENTS.map((a) => (
                  <AddOnRow key={a.id} addOn={a} active={addOnIds.includes(a.id)} onToggle={() => props.onToggleAddOn(a.id)} />
                ))}
              </ul>
            </div>

            {/* Step 3 — menu extras */}
            <div className="mt-16">
              <p className="field-label">03 — More from the menu</p>
              <ul className="mt-4 border-t border-espresso/15">
                {MENU_OPTIONS.map((a) => (
                  <AddOnRow key={a.id} addOn={a} active={addOnIds.includes(a.id)} onToggle={() => props.onToggleAddOn(a.id)} />
                ))}
              </ul>
            </div>
          </div>

          {/* Live estimate */}
          <aside className="lg:col-span-5">
            <div className="relative overflow-hidden bg-espresso p-8 text-cream md:p-10 lg:sticky lg:top-24">
              <div className="grain absolute inset-0" />
              <div className="relative">
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Your estimate</p>
                <h3 className="mt-3 font-serif text-3xl font-light italic">
                  {service.name}
                  {addOnIds.length > 0 && ` + ${addOnIds.length} add-on${addOnIds.length > 1 ? 's' : ''}`}
                </h3>
                <div className="mt-8">
                  <EstimateSummary serviceId={serviceId} guests={guests} travel={travel} addOnIds={addOnIds} tone="dark" />
                </div>
                <button
                  type="button"
                  onClick={props.onRequest}
                  className="group mt-8 inline-flex w-full items-center justify-center gap-3 bg-cream px-7 py-4 text-[11px] uppercase tracking-[0.28em] text-espresso transition-colors duration-500 hover:bg-blush"
                >
                  Book this tan
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky estimate bar */}
      <div className="sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-espresso/10 bg-ivory/95 px-5 py-3 backdrop-blur lg:hidden">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-espresso/55">Estimate</p>
          <p className="font-serif text-2xl leading-none text-espresso">{est.label}</p>
        </div>
        <button type="button" onClick={props.onRequest} className="btn-primary !px-5 !py-3">
          Book Now
        </button>
      </div>
    </section>
  );
}
