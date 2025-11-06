type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'ur' | 'gu' | 'kn' | 'or' | 'ml' | 'pa' | 'as' | 'ma';

const translations: Record<Language, any> = {};

const modules = import.meta.glob('@/locales/*.json', { eager: true });

for (const [path, module] of Object.entries(modules)) {
  const match = path.match(/\/([a-z]+)\.json$/);
  if (match) {
    const lang = match[1] as Language;
    translations[lang] = (module as any).default;
  }
}

export function getTranslation(language: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[language] || translations['en'];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
