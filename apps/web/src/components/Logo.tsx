import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type LogoProps = {
  to?: string;
  href?: string;
  className?: string;
  imgClassName?: string;
};

/** AT wordmark image only — fixed in header/footer, never restyled with UI fonts. */
export function Logo({ to = '/', href, className, imgClassName }: LogoProps) {
  const img = (
    <img
      src="/logo.png"
      alt="AT — For General Trading and Engineering Services Ltd."
      className={cn(
        'h-8 w-auto max-w-[160px] object-contain object-left sm:h-9 sm:max-w-[180px]',
        imgClassName,
      )}
      decoding="async"
    />
  );

  const classes = cn('inline-flex shrink-0 items-center', className);

  if (href) {
    return (
      <a href={href} className={classes} aria-label="AT Home">
        {img}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} aria-label="AT Home">
      {img}
    </Link>
  );
}
