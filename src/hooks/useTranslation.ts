import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/utils/translations';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string) => getTranslation(language as any, key),
    language
  };
}
