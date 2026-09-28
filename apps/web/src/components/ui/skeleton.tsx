import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/70',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_1.6s_ease_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent dark:before:via-white/12',
        className,
      )}
      {...props}
    />
  );
}

/** ChatGPT-style streaming text lines */
function ChatLinesSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  const widths = ['w-[92%]', 'w-[78%]', 'w-[86%]', 'w-[64%]', 'w-[70%]', 'w-[54%]'];
  return (
    <div className={cn('w-full space-y-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5 rounded-full', widths[i % widths.length])} />
      ))}
    </div>
  );
}

/** KPI metric card */
function KpiSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="mt-4 h-8 w-28 rounded-lg" />
    </div>
  );
}

/** Full admin dashboard placeholder */
function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-8', className)} role="status" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={`p-${i}`} />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KpiSkeleton key={`s-${i}`} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="rounded-xl border border-border/80 bg-card p-5 xl:col-span-3">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="mt-2 h-3 w-28 rounded-full" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl" />
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5 xl:col-span-2">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <Skeleton className="mb-5 h-4 w-32 rounded-full" />
          <div className="grid grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-5">
          <Skeleton className="mb-5 h-4 w-36 rounded-full" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-1/3 rounded-full" />
                <Skeleton className="h-3.5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 py-2', className)} role="status" aria-label="Loading">
      <ChatLinesSkeleton lines={2} />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border/80 bg-card', className)}>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="mt-2 h-4 w-16 rounded-full" />
      </div>
    </div>
  );
}

function ContentCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 rounded-xl border border-border/80 bg-card p-5', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-10 rounded-full" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-5 w-2/3 rounded-full" />
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-3 w-5/6 rounded-full" />
      <Skeleton className="mt-2 h-3 w-24 rounded-full" />
    </div>
  );
}

function CarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden py-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} className="w-[min(78vw,300px)] shrink-0 sm:w-[300px]" />
      ))}
    </div>
  );
}

function CardGridSkeleton({
  count = 6,
  variant = 'content',
}: {
  count?: number;
  variant?: 'content' | 'product';
}) {
  const Item = variant === 'product' ? ProductCardSkeleton : ContentCardSkeleton;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center space-y-4 px-4 py-16',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="mt-1 size-8 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3 pt-1">
          <ChatLinesSkeleton lines={5} />
        </div>
      </div>
      <div className="grid gap-3 pt-2 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="hidden h-28 rounded-xl sm:block" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card" role="status">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="ms-auto h-3 w-16 rounded-full" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5">
            <Skeleton className="h-3.5 w-[28%] rounded-full" />
            <Skeleton className="h-3.5 w-[14%] rounded-full" />
            <Skeleton className="h-3.5 w-[18%] rounded-full" />
            <Skeleton className="ms-auto h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-2xl space-y-4', className)} role="status">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="space-y-3 rounded-xl border border-border/80 bg-card p-5">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  ChatLinesSkeleton,
  KpiSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
  ProductCardSkeleton,
  ContentCardSkeleton,
  CarouselSkeleton,
  CardGridSkeleton,
  PageSkeleton,
  TableSkeleton,
  FormSkeleton,
};
