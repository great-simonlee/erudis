import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const MARK = {
  light: '/logos/erudis_app_logo.png',
  dark: '/logos/erudis_transparent.png',
} as const;

type ErudisLogoProps = {
  variant?: 'sidebar' | 'header';
  link?: boolean;
  /** Router destination when `link` is true. Defaults to feed. */
  to?: string;
  className?: string;
};

const layout = {
  sidebar: {
    root: 'gap-2.5',
    markWrap: 'h-11 w-[2.65rem]',
    markImg: 'h-11',
    divider: 'h-10',
    the: 'text-[9px] tracking-[0.34em]',
    erudis: 'text-[1.375rem] leading-none',
    tagline: 'mt-1 max-w-[10.75rem] text-[6.5px] leading-snug tracking-[0.06em]',
    showTagline: true,
  },
  header: {
    root: 'gap-2',
    markWrap: 'h-8 w-8',
    markImg: 'h-8',
    divider: 'h-7',
    the: 'text-[7px] tracking-[0.3em]',
    erudis: 'text-base leading-none',
    tagline: 'mt-0.5 max-w-[9.5rem] text-[5.5px] leading-snug tracking-[0.04em]',
    showTagline: true,
  },
} as const;

function MarkIcon({ variant }: { variant: 'sidebar' | 'header' }) {
  const L = layout[variant];
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${L.markWrap}`}
      aria-hidden
    >
      <img
        src={MARK.light}
        alt=""
        className={`${L.markImg} w-auto max-w-none object-left dark:hidden`}
        decoding="async"
      />
      <img
        src={MARK.dark}
        alt=""
        className={`${L.markImg} hidden w-auto max-w-none object-left dark:block`}
        decoding="async"
      />
    </div>
  );
}

function LogoText({ variant }: { variant: 'sidebar' | 'header' }) {
  const L = layout[variant];
  return (
    <div className="min-w-0 leading-none">
      <p className={`font-sans font-medium uppercase text-brand ${L.the}`}>THE</p>
      <p className={`mt-0.5 font-display font-semibold uppercase text-brand ${L.erudis}`}>
        ERUDIS
      </p>
      {L.showTagline && (
        <p
          className={`font-sans font-medium uppercase text-fg-subtle ${L.tagline}`}
        >
          Share the intelligence, shape the world
        </p>
      )}
    </div>
  );
}

function LogoContent({ variant }: { variant: 'sidebar' | 'header' }) {
  const L = layout[variant];
  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center ${L.root} ${variant === 'header' ? 'max-w-[min(100%,11.5rem)]' : ''}`}
    >
      <MarkIcon variant={variant} />
      <span
        className={`w-px shrink-0 bg-zinc-300 dark:bg-zinc-600 ${L.divider}`}
        aria-hidden
      />
      <LogoText variant={variant} />
    </span>
  );
}

export function ErudisLogo({
  variant = 'sidebar',
  link = true,
  to = ROUTES.feed,
  className = '',
}: ErudisLogoProps) {
  const content = <LogoContent variant={variant} />;

  if (!link) {
    return <span className={`inline-flex min-w-0 ${className}`}>{content}</span>;
  }

  return (
    <Link
      to={to}
      className={`inline-flex min-w-0 max-w-full rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
      aria-label="THE ERUDIS — Share the intelligence, shape the world"
    >
      {content}
    </Link>
  );
}
