import { useState } from 'react';

interface BrandImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

/**
 * Renders supplied brand imagery from /assets. If a file is missing, it
 * falls back to a quiet editorial texture so the layout never breaks.
 */
export default function BrandImage({
  src,
  alt,
  fallback,
  className = '',
  imgClassName = '',
  eager = false,
}: BrandImageProps) {
  const [current, setCurrent] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-cream ${className}`}>
      <img
        src={current}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (fallback && current !== fallback) setCurrent(fallback);
        }}
        className={`h-full w-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
}
