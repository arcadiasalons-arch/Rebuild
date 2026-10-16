interface IconProps {
  className?: string;
}

export type SocialIconName = 'instagram' | 'whatsapp' | 'facebook' | 'tiktok';

export const InstagramIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

export const MessageIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={className} aria-hidden="true">
    <path d="M4 5h16v11H9l-5 4V5z" strokeLinejoin="round" />
  </svg>
);

export const WhatsAppIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" className={className} aria-hidden="true">
    <path
      d="M20.4 11.8a8.4 8.4 0 0 1-12.9 7.1L4 20l1.2-3.1A8.4 8.4 0 1 1 20.4 11.8Z"
      strokeLinejoin="round"
    />
    <path d="M9.2 8.8c.3-.3.7-.3 1 0l1.1 1.1c.3.3.3.8 0 1.1l-.6.6c-.2.2-.2.5 0 .8.5.9 1.2 1.6 2.1 2.1.3.2.6.2.8 0l.6-.6c.3-.3.8-.3 1.1 0l1.1 1.1c.3.3.3.7 0 1l-.7.7c-.5.5-1.2.7-1.8.5-2.7-1-4.8-3.1-5.8-5.8-.2-.6 0-1.3.5-1.8l.7-.7Z" />
  </svg>
);

export const FacebookIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M13.7 8.2h1.8V5.9h-2c-2 0-3.5 1.4-3.5 3.5v1.4H8v2.6h2v5.7h2.7v-5.7H15l.4-2.6h-2.7V9.5c0-.8.5-1.3 1-1.3Z" />
  </svg>
);

export const TikTokIcon = ({ className = 'h-4 w-4' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35" className={className} aria-hidden="true">
    <path d="M14.2 5.5c.6 1.8 1.9 3 3.8 3.3v2.6c-1.5-.1-2.8-.5-3.8-1.2V16a4.6 4.6 0 1 1-4.2-4.6v2.7a1.9 1.9 0 1 0 1.9 1.9V5.5h2.3Z" />
    <path d="M12 3.8v2.1" />
  </svg>
);

export const SocialIcon = ({ name, className = 'h-4 w-4' }: IconProps & { name: SocialIconName }) => {
  switch (name) {
    case 'instagram':
      return <InstagramIcon className={className} />;
    case 'whatsapp':
      return <WhatsAppIcon className={className} />;
    case 'facebook':
      return <FacebookIcon className={className} />;
    case 'tiktok':
      return <TikTokIcon className={className} />;
    default:
      return null;
  }
};

export const Sparkle = ({ className = 'h-3 w-3' }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
  </svg>
);
