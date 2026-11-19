import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/i18n-context';

type ConfirmRequest = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  resolve: (value: boolean) => void;
};

let openConfirm: (request: ConfirmRequest) => void = () => {};

export function confirmAction(options: Omit<ConfirmRequest, 'resolve'>) {
  return new Promise<boolean>((resolve) => {
    openConfirm({ ...options, resolve });
  });
}

export function ConfirmHost() {
  const { dir } = useI18n();
  const [request, setRequest] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    openConfirm = setRequest;
    return () => {
      openConfirm = () => {};
    };
  }, []);

  useEffect(() => {
    if (!request) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        request?.resolve(false);
        setRequest(null);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [request]);

  if (!request) return null;

  function close(value: boolean) {
    request?.resolve(value);
    setRequest(null);
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center" dir={dir}>
      <button
        type="button"
        aria-label={request.cancelLabel}
        className="absolute inset-0 bg-[#0b1f3a]/55 backdrop-blur-[2px]"
        onClick={() => close(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)] sm:p-6"
      >
        <h2 className="text-lg font-bold tracking-tight text-fg">{request.title}</h2>
        {request.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{request.description}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => close(false)}>
            {request.cancelLabel}
          </Button>
          <Button
            type="button"
            variant={request.danger ? 'danger' : 'primary'}
            onClick={() => close(true)}
          >
            {request.confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
