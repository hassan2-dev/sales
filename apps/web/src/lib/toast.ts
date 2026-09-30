import { toast as sonnerToast } from 'sonner';
import { getDictionary, type Dictionary, type Locale } from '@/i18n/dictionaries';

type ToastKey = keyof Dictionary['toast'];

function readLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('eh_locale');
  if (saved === 'ar' || saved === 'en') return saved;
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function toastMessage(key: ToastKey, vars?: Record<string, string | number>) {
  let message: string = getDictionary(readLocale()).toast[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      message = message.replace(`{${k}}`, String(v));
    }
  }
  return message;
}

export const appToast = {
  success(key: ToastKey, vars?: Record<string, string | number>) {
    return sonnerToast.success(toastMessage(key, vars));
  },
  error(key: ToastKey, vars?: Record<string, string | number>) {
    return sonnerToast.error(toastMessage(key, vars));
  },
  message(key: ToastKey, vars?: Record<string, string | number>) {
    return sonnerToast(toastMessage(key, vars));
  },
};
