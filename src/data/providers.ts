import { ABOUT, BRAND, IMAGES } from './brand';

export interface Provider {
  slug: string;
  name: string;
  active: boolean;
  published: boolean;
  bio?: string;
  serviceArea?: string;
  imageUrl?: string;
  websiteUrl?: string;
  phoneE164?: string;
  // Only Meesh uses the menu and estimate configured in brand.ts.
  menu?: 'meesh';
}

// Owner-managed directory. Publish changes through the normal site deployment.
export const PROVIDERS: Provider[] = [
  {
    slug: 'meesh',
    name: 'Meesh',
    active: true,
    published: true,
    bio: ABOUT.quote,
    serviceArea: BRAND.serviceArea,
    imageUrl: IMAGES.headshot,
    websiteUrl: BRAND.instagramUrl,
    phoneE164: BRAND.phoneE164,
    menu: 'meesh',
  },
];

export const getPublishedProviders = () =>
  PROVIDERS.filter((pro) => pro.active && pro.published);

export const getProvider = (slug: string) =>
  getPublishedProviders().find((pro) => pro.slug === slug);

export function safeWebUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function providerSmsLink(pro: Provider | undefined, body: string): string | undefined {
  const phone = pro ? pro.phoneE164 : BRAND.phoneE164;
  return phone && /^\+[1-9]\d{7,14}$/.test(phone)
    ? `sms:${phone}?body=${encodeURIComponent(body)}`
    : undefined;
}
