import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  /** Direction the content glides in from as it scrolls into view. */
  from?: 'bottom' | 'left';
}

export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div', from = 'bottom' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = from === 'left' ? 'opacity-0 -translate-x-10' : 'opacity-0 translate-y-6';
  const shown = from === 'left' ? 'opacity-100 translate-x-0' : 'opacity-100 translate-y-0';

  return (
    <Tag
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '1100ms',
        transitionTimingFunction: 'cubic-bezier(.2,.7,.2,1)',
      }}
      className={`transition-all ${visible ? shown : hidden} ${className}`}
    >
      {children}
    </Tag>
  );
}
