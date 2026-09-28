import { Inbox } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/cn';
import {
  CardGridSkeleton,
  CarouselSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  PageSkeleton,
  Skeleton,
  TableSkeleton,
} from './skeleton';

type LoadingVariant =
  | 'default'
  | 'page'
  | 'cards'
  | 'products'
  | 'carousel'
  | 'table'
  | 'inline'
  | 'dashboard'
  | 'chart'
  | 'form';

export function LoadingState({
  label: _label,
  className,
  variant = 'default',
}: {
  label?: string;
  className?: string;
  variant?: LoadingVariant;
}) {
  if (variant === 'dashboard') {
    return <DashboardSkeleton className={className} />;
  }
  if (variant === 'chart') {
    return <ChartSkeleton className={className} />;
  }
  if (variant === 'form') {
    return <FormSkeleton className={className} />;
  }
  if (variant === 'page') {
    return <PageSkeleton className={className} />;
  }
  if (variant === 'cards') {
    return (
      <div className={cn('py-2', className)}>
        <CardGridSkeleton count={6} variant="content" />
      </div>
    );
  }
  if (variant === 'products') {
    return (
      <div className={cn('py-2', className)}>
        <CardGridSkeleton count={6} variant="product" />
      </div>
    );
  }
  if (variant === 'carousel') {
    return (
      <div className={cn('py-2', className)}>
        <CarouselSkeleton />
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className={cn(className)}>
        <TableSkeleton />
      </div>
    );
  }
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3 py-6', className)}>
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3 rounded-full" />
          <Skeleton className="h-3 w-1/2 rounded-full" />
        </div>
      </div>
    );
  }

  // Default ChatGPT-style message skeleton
  return (
    <div
      className={cn('mx-auto w-full max-w-2xl space-y-4 py-12', className)}
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3 pt-1">
          <Skeleton className="h-3.5 w-[92%] rounded-full" />
          <Skeleton className="h-3.5 w-[76%] rounded-full" />
          <Skeleton className="h-3.5 w-[84%] rounded-full" />
          <Skeleton className="h-3.5 w-[58%] rounded-full" />
        </div>
      </div>
      <div className="flex gap-3 ps-11 pt-2">
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="hidden h-24 flex-1 rounded-xl sm:block" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void } | React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Inbox className="h-10 w-10 text-muted/40" />
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {action && typeof action === 'object' && 'label' in action ? (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : (
        action
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
