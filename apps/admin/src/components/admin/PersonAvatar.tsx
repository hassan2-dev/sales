import { useMemo, useState } from 'react';
import { createAvatar } from '@dicebear/core';
import * as lorelei from '@dicebear/lorelei';
import { cn } from '@/lib/utils';

const BACKGROUNDS = ['e8f1fa', 'e7f6ee', 'f3eefe', 'fff4e8', 'eef2f6', 'fdecef'];

function characterSrc(seed: string) {
  return createAvatar(lorelei, {
    seed,
    backgroundColor: BACKGROUNDS,
    backgroundType: ['solid'],
  }).toDataUri();
}

export function PersonAvatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const label = name.trim() || 'person';
  const portrait = useMemo(() => characterSrc(label), [label]);
  const showPhoto = Boolean(src) && !broken;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-white/80',
        size === 'lg' && 'h-16 w-16',
        size === 'md' && 'h-11 w-11',
        size === 'sm' && 'h-8 w-8',
        className,
      )}
      aria-hidden
    >
      <img
        src={showPhoto ? src ?? undefined : portrait}
        alt=""
        className="h-full w-full object-cover"
        onError={() => {
          if (showPhoto) setBroken(true);
        }}
      />
    </span>
  );
}
