import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type LogoProps = {
  to?: string;
  href?: string;
  className?: string;
  imgClassName?: string;
};

/** Energy Horizon brand mark — PNG for reliable header/footer rendering. */
export function Logo({ to = '/', href, className, imgClassName }: LogoProps) {
  const img = (
    <img
      src="/energy-horizon-logo.png"
      alt="Energy Horizon — افاق الطاقة"
      className={cn(
        'h-10 w-auto max-w-[200px] object-contain object-left sm:h-11 sm:max-w-[220px]',
        imgClassName,
      )}
      decoding="async"
    />
  );

  const classes = cn('inline-flex shrink-0 items-center', className);

  if (href) {
    return (
      <a href={href} className={classes} aria-label="Energy Horizon Home">
        {img}
      </a>
    );
  }

  return (
    <Link to={to} className={classes} aria-label="Energy Horizon Home">
      {img}
    </Link>
  );
}
