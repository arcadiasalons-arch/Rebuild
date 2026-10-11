// HOUSE CALL BRONZE — single source of truth.
// Pricing and business details must match the owner's supplied menu exactly.

export const SITE = {
  name: 'House Call Bronze',
  url: 'https://housecallbronze.com',
  language: 'en',
};

export const BRAND = {
  name: 'HOUSE CALL BRONZE',
  artist: 'MEESH',
  tagline: 'Custom mobile spray tans',
  positioning: 'Custom spray tans. Your place or mine.',
  serviceArea: 'Spokane + nearby',
  studioAddress: 'Meesh’s studio · Spokane, WA',
  instagramHandle: '@house.call.bronze',
  instagramUrl: 'https://www.instagram.com/house.call.bronze',
  phoneDisplay: '509-703-2928',
  phoneE164: '+15097032928',
};

export const TEL_LINK = `tel:${BRAND.phoneE164}`;

export const buildSmsLink = (body: string) =>
  `sms:${BRAND.phoneE164}?body=${encodeURIComponent(body)}`;

// Owner-supplied brand imagery (optimized WebP copies of the supplied files).
export const IMAGES = {
  // Home hero — owner-supplied three-panel bronzed-skin photo (optimized WebP, 1476×704)
  heroTriptych: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790727128722_b1ff93b4.webp',
  // image_2 — illustrated brand poster ("House Call Bronze · Glow")
  poster: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716147195_e8b423a8.webp',
  // image_3 — gold HCB monogram on dark leather (favicon, app icon)
  monogram: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716148019_7e953443.webp',
  // image_6 — dark leather banner with monogram + wordmark (footer / dividers)
  leatherBanner: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716147834_ae2280f0.webp',
  // image_7 — Meesh with dual spray guns, on near-black (services / booking)
  artistCutout: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716147881_7d885109.webp',
  // image_9 — About headshot (small optimized copy, 640px)
  headshot: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790727128870_b7f54ff0.webp',
  // image_8 — full-length lifestyle photo in cream dress
  lifestyle: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716147227_77532aba.webp',
  // image_5 — official merch tee flatlay
  tee: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790716147300_6b24d92d.webp',
  og: 'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790727128722_b1ff93b4.webp',
  fallbackSilk:
    'https://d64gsuwffb70l.cloudfront.net/6ab7c11864006fdf3a05a860_1790427509238_d5a67148.jpg',
};

// Retail. Each item links out to the brand's official product page.
// Add brand products here with their official URLs — nothing is invented.
export interface RetailItem {
  id: string;
  brand: string;
  name: string;
  description: string;
  image: string;
  href: string;
  cta: string;
}

export const RETAIL: RetailItem[] = [
  {
    id: 'hcb-tee',
    brand: 'House Call Bronze',
    name: 'The House Tee',
    description: 'Cream heavyweight tee, embroidered HOUSE CALL BRONZE with a quiet GLOW down the side.',
    image: IMAGES.tee,
    href: 'https://www.instagram.com/house.call.bronze',
    cta: 'Ask Meesh on Instagram',
  },
];

// About Meesh — owner-supplied copy.
export const ABOUT = {
  quote: 'Nice to meet you, I’m Meesh, and our journey has only just begun…',
  accolade: 'Named the #1 Best Mobile Sunless Technician in the United States',
  // Owner-supplied story, in order. `pull` paragraphs render as emphasized pull quotes.
  story: [
    { text: 'What began as a love for that effortless, sun-kissed glow became something much more personal.' },
    {
      text: 'After experiencing the effects of sun damage and navigating my own skin-related health challenges, I began to see tanning differently. I still loved the confidence and warmth that a beautiful tan could bring—but I no longer wanted that glow to come at the expense of my skin.',
    },
    { text: 'So, I turned that experience into a passion.', pull: true },
    {
      text: 'I became deeply committed to finding a better way to achieve the glow we love while protecting the skin we have. That journey inspired me to create House Call Bronze—a personalized approach to tanning designed around you, your skin, and your life.',
    },
    { text: 'I founded House Call Bronze around one simple belief:' },
    { text: 'Your tan should fit your life, not the other way around.', pull: true },
    {
      text: 'Every tan is thoughtfully customized and mixed for your skin tone, your desired glow, and the look you want to feel your absolute best in. No UV. No unnecessary sun exposure. Just a beautiful, sun-kissed glow.',
    },
    {
      text: 'And because I believe luxury should feel effortless, your tan is finished wherever you feel most comfortable.',
    },
  ] as { text: string; pull?: boolean }[],
};

export type ServiceId = 'come-to-meesh' | 'house-call' | 'mobile-party';

export interface Service {
  id: ServiceId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  onSite: boolean; // Meesh travels to the client
  perPerson?: boolean;
  minPeople?: number;
}

export const SERVICES: Service[] = [
  {
    id: 'come-to-meesh',
    name: 'Come to Meesh',
    price: 60,
    priceLabel: '$60',
    description: 'Custom full-body tan.',
    onSite: false,
  },
  {
    id: 'house-call',
    name: 'House Call',
    price: 75,
    priceLabel: '$75',
    description: 'Same custom tan at your home or hotel.',
    onSite: true,
  },
  {
    id: 'mobile-party',
    name: 'Mobile party',
    price: 60,
    priceLabel: '$60/person',
    description: '3+ people, already on site.',
    onSite: true,
    perPerson: true,
    minPeople: 3,
  },
];

export const TRAVEL = {
  name: 'Travel outside 15 miles',
  label: '+$15–25',
  min: 15,
  max: 25,
};

export type TravelId = 'within' | 'outside' | 'unsure';

export const TRAVEL_OPTIONS: { id: TravelId; label: string }[] = [
  { id: 'within', label: 'Within 15 miles' },
  { id: 'outside', label: 'Outside 15 miles (+$15–25)' },
  { id: 'unsure', label: 'Not sure — Meesh will confirm' },
];

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
  group: 'treatment' | 'menu';
}

// Detailed treatment add-ons (from the supplied add-on guide)
export const TREATMENTS: AddOn[] = [
  {
    id: 'anti-aging',
    name: 'Anti-Aging Concentrate',
    price: 15,
    description: 'Peptides + niacinamide (vitamin B3) mixed into the tan.',
    group: 'treatment',
  },
  {
    id: 'collagen',
    name: 'Collagen Peptide Boost',
    price: 15,
    description: 'Collagen + vitamin C support added to the solution.',
    group: 'treatment',
  },
  {
    id: 'vitamin-bath',
    name: 'Vitamin Bath',
    price: 15,
    description: 'Antioxidant cocktail with vitamins C, E, and fruit extracts.',
    group: 'treatment',
  },
  {
    id: 'hydration',
    name: 'Hydration Drops',
    price: 15,
    description: 'Hyaluronic acid + glycerin moisture support.',
    group: 'treatment',
  },
  {
    id: 'firming',
    name: 'Firming Drops',
    price: 15,
    description: 'Caffeine + ivy extract for a tighter-looking finish.',
    group: 'treatment',
  },
  {
    id: 'contouring',
    name: 'Contouring',
    price: 20,
    description: 'A second, precise pass that sculpts—not just colors.',
    group: 'treatment',
  },
];

// Additional options from the original price list (kept separate, unrenamed)
export const MENU_OPTIONS: AddOn[] = [
  { id: 'rapid-rinse', name: 'Rapid rinse', price: 15, group: 'menu' },
  { id: 'body-contour', name: 'Body contour', price: 20, group: 'menu' },
  { id: 'vitamin-hydration-mix', name: 'Vitamin + hydration mix-in', price: 10, group: 'menu' },
  { id: 'aftercare-lotion', name: 'Take-home aftercare lotion', price: 15, group: 'menu' },
];

export const ALL_ADDONS: AddOn[] = [...TREATMENTS, ...MENU_OPTIONS];

export const getService = (id: ServiceId) => SERVICES.find((s) => s.id === id)!;

export interface EstimateInput {
  serviceId: ServiceId;
  guests: number;
  addOnIds: string[];
  travel: TravelId;
}

export interface Estimate {
  base: number;
  addOnsPerPerson: number;
  people: number;
  subtotal: number;
  travelMin: number;
  travelMax: number;
  min: number;
  max: number;
  label: string;
}

export const formatRange = (min: number, max: number) =>
  min === max ? `$${min}` : `$${min}–${max}`;

export function calculateEstimate({ serviceId, guests, addOnIds, travel }: EstimateInput): Estimate {
  const service = getService(serviceId);
  const people = service.perPerson ? Math.max(service.minPeople ?? 1, guests) : 1;
  const addOnsPerPerson = ALL_ADDONS.filter((a) => addOnIds.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0
  );
  const subtotal = (service.price + addOnsPerPerson) * people;
  const applyTravel = service.onSite && travel === 'outside';
  const travelMin = applyTravel ? TRAVEL.min : 0;
  const travelMax = applyTravel ? TRAVEL.max : 0;
  const min = subtotal + travelMin;
  const max = subtotal + travelMax;
  return {
    base: service.price,
    addOnsPerPerson,
    people,
    subtotal,
    travelMin,
    travelMax,
    min,
    max,
    label: formatRange(min, max),
  };
}

// Minimal primary navigation, in on-page order. "Book Now" is the CTA button, not a scroll link.
export const NAV_LINKS = [
  { id: 'about', label: 'About Meesh' },
  { id: 'services', label: 'Services & Pricing' },
  { id: 'retail', label: 'Retail' },
];

export const ESTIMATE_NOTE =
  'Estimate only. Meesh confirms your appointment and final price by text.';

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
};
