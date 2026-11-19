// Barrel so consumers can import from `#lib/i18n/index.ts`. The implementation lives in
// `index.svelte.ts` (a runes module); a bare directory import does not resolve
// `.svelte.ts`, so this thin re-export bridges the two.
export { t, translate, setLocale, initLocale, i18n, LOCALES } from './index.svelte';
export type { Dictionary, Locale, TranslationKey, TranslationValues } from './types';
