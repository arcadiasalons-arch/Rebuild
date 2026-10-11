import { ALL_ADDONS, ESTIMATE_NOTE, TRAVEL, calculateEstimate, getService, type EstimateInput } from '@/data/brand';

interface Props extends EstimateInput {
  tone?: 'dark' | 'light';
  compact?: boolean;
}

export default function EstimateSummary({ tone = 'dark', compact = false, ...input }: Props) {
  const service = getService(input.serviceId);
  const est = calculateEstimate(input);
  const chosen = ALL_ADDONS.filter((a) => input.addOnIds.includes(a.id));
  const dark = tone === 'dark';
  const muted = dark ? 'text-cream/60' : 'text-espresso/55';
  const line = dark ? 'border-cream/15' : 'border-espresso/15';

  return (
    <div>
      <div className={`space-y-3 border-b pb-5 text-[14px] ${line}`}>
        <div className="flex justify-between gap-4">
          <span>
            {service.name}
            {service.perPerson && <span className={muted}> × {est.people}</span>}
          </span>
          <span>${service.price * est.people}</span>
        </div>
        {chosen.map((a) => (
          <div key={a.id} className="flex justify-between gap-4">
            <span className={muted}>
              {a.name}
              {service.perPerson && ` × ${est.people}`}
            </span>
            <span className={muted}>+${a.price * est.people}</span>
          </div>
        ))}
        {est.travelMax > 0 && (
          <div className="flex justify-between gap-4">
            <span className={muted}>{TRAVEL.name}</span>
            <span className={muted}>{TRAVEL.label}</span>
          </div>
        )}
        {!compact && chosen.length === 0 && (
          <p className={`text-[13px] italic ${muted}`}>No add-ons selected.</p>
        )}
      </div>
      <div className="flex items-end justify-between pt-5">
        <span className={`text-[10px] uppercase tracking-[0.3em] ${muted}`}>Estimated total</span>
        <span className={`font-serif ${compact ? 'text-4xl' : 'text-5xl'} font-light leading-none`}>{est.label}</span>
      </div>
      {!compact && <p className={`mt-4 text-[12px] leading-relaxed ${muted}`}>{ESTIMATE_NOTE}</p>}
    </div>
  );
}
