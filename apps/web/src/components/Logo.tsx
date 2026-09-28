import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type LogoProps = {
  to?: string;
  href?: string;
  className?: string;
  imgClassName?: string;
  /** When true, wraps logo on a dark plate so black-bg artwork stays clean on light surfaces */
  plate?: boolean;
};

export function Logo({ to = '/', href, className, imgClassName, plate = false }: LogoProps) {
  const img = (
    <img
      src="/logo.png"
      alt="AT — For General Trading and Engineering Services Ltd."
      className={cn('h-10 w-auto object-contain sm:h-11', imgClassName)}
      decoding="async"
    />
  );

  const inner = plate ? (
    <span className="inline-flex items-center rounded-md bg-[#050505] px-2.5 py-1.5">{img}</span>
  ) : (
    img
  );

  const classes = cn('inline-flex shrink-0 items-center', className);

  if (href) {
    return (
      <a href={href} className={classes} aria-label="AT Home">
        {inner}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} aria-label="AT Home">
      {inner}
    </Link>
  );
}
