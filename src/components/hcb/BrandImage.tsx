import { useState } from 'react';

interface BrandImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
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
  width,
  height,
  sizes,
  loading,
  fetchPriority,
  eager = false,
}: BrandImageProps) {
  const [current, setCurrent] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-cream ${className}`}>
      <img
        src={current}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading ?? (eager ? 'eager' : 'lazy')}
        fetchPriority={fetchPriority ?? (eager ? 'high' : 'low')}
        decoding="async"
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
