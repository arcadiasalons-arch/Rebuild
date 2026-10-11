import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { IMAGES, SITE } from '@/data/brand';

type RouteMeta = {
  title: string;
  description: string;
  robots: string;
  path: string;
};

const DEFAULT_IMAGE = IMAGES.og;

const ROUTES: Record<string, RouteMeta> = {
  '/': {
    title: 'House Call Bronze | Custom Mobile Spray Tans by Meesh in Spokane',
    description:
      'Custom mobile spray tans by Meesh in Spokane, WA and nearby. Shade mixed for your skin, no UV, at your home, hotel, event, or studio.',
    robots: 'index, follow, max-image-preview:large',
    path: '/',
  },
  '/join': {
    title: 'Join the House Call Pros | House Call Bronze',
    description:
      'Request to join House Call Bronze if you are a sunless pro who wants to grow and glow with the team.',
    robots: 'index, follow',
    path: '/join',
  },
  '/admin': {
    title: 'House Call Bronze Admin Login',
    description: 'Private studio admin access for House Call Bronze.',
    robots: 'noindex, nofollow',
    path: '/admin',
  },
  '/pros/:slug': {
    title: 'House Call Bronze Pro Profile',
    description: 'Meet a House Call Bronze partner and request a booking by text.',
    robots: 'index, follow',
    path: '/pros/meesh',
  },
  notFound: {
    title: 'Page not found | House Call Bronze',
    description: 'This page could not be found. Return to House Call Bronze or text Meesh directly.',
    robots: 'noindex, nofollow',
    path: '/',
  },
};

const routeUrl = (path: string) => `${SITE.url}${path === '/' ? '/' : `/#${path}`}`;

const setMeta = (selector: string, value: string, attr = 'content') => {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    el = selector.startsWith('link')
      ? document.createElement('link')
      : document.createElement('meta');
    if (selector.includes('link[rel="canonical"]')) {
      (el as HTMLLinkElement).rel = 'canonical';
      document.head.appendChild(el);
    } else {
      document.head.appendChild(el);
    }
  }
  el.setAttribute(attr, value);
};

const upsertMetaName = (name: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertMetaProperty = (property: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export default function Seo() {
  const { pathname } = useLocation();

  const meta = useMemo(
    () => (pathname.startsWith('/pros/') ? { ...ROUTES['/pros/:slug'], path: pathname } : ROUTES[pathname] ?? ROUTES.notFound),
    [pathname]
  );

  useEffect(() => {
    document.title = meta.title;
    setMeta('link[rel="canonical"]', routeUrl(meta.path), 'href');
    upsertMetaName('description', meta.description);
    upsertMetaName('robots', meta.robots);
    upsertMetaProperty('og:site_name', SITE.name);
    upsertMetaProperty('og:type', 'website');
    upsertMetaProperty('og:title', meta.title);
    upsertMetaProperty('og:description', meta.description);
    upsertMetaProperty('og:url', routeUrl(meta.path));
    upsertMetaProperty('og:image', DEFAULT_IMAGE);
    upsertMetaProperty('og:image:width', '1476');
    upsertMetaProperty('og:image:height', '704');
    upsertMetaProperty('og:image:alt', 'House Call Bronze custom spray tan branding');
    upsertMetaName('twitter:card', 'summary_large_image');
    upsertMetaName('twitter:title', meta.title);
    upsertMetaName('twitter:description', meta.description);
    upsertMetaName('twitter:image', DEFAULT_IMAGE);
  }, [meta]);

  return null;
}
