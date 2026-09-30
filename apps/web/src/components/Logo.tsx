import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type LogoProps = {
  to?: string;
  href?: string;
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
};

/** Local PNG by default; set VITE_LOGO_URL to an R2 public URL in production. */
const LOGO_SRC =
  import.meta.env.VITE_LOGO_URL?.trim() || '/energy-horizon-logo.png';

export function Logo({ to = '/', href, className, imgClassName, onClick }: LogoProps) {
  const img = (
    <img
      src={LOGO_SRC}
      alt="Energy Horizon — افاق الطاقة"
      className={cn(
        'h-10 w-auto max-w-[140px] object-contain object-left sm:h-11 sm:max-w-[200px]',
        imgClassName,
      )}
      decoding="async"
    />
  );

  const classes = cn('inline-flex shrink-0 items-center', className);

  if (href) {
    return (
      <a href={href} className={classes} aria-label="Energy Horizon Home" onClick={onClick}>
        {img}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} aria-label="Energy Horizon Home" onClick={onClick}>
      {img}
    </Link>
  );
}
