import { en, type Translations } from './en';
import { es } from './es';
import { useAuthStore } from '../store';

const translations = { en, es } as const;

export type { Translations };

export function useT(): Translations {
  const locale = useAuthStore((s) => s.locale ?? 'en');
  return translations[locale];
}
