import { Toaster } from 'sonner';
import { useI18n } from '@/i18n/i18n-context';

export function AppToaster() {
  const { dir, locale } = useI18n();

  return (
    <Toaster
      key={locale}
      richColors
      closeButton
      position="top-center"
      dir={dir}
      toastOptions={{
        classNames: {
          toast: 'font-semibold',
          title: 'text-sm',
          description: 'text-xs',
        },
      }}
    />
  );
}
