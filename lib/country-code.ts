/** Shared by the server (detection) and the browser (saving a choice). */
export const COUNTRY_COOKIE = 'wh_country';

export type CountryDetection =
  | { code: string; source: 'saved' | 'ip' | 'language' }
  | { code: null; source: null };

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/** Placeholders CDNs send instead of a real country: unknown and Tor. */
const PLACEHOLDER_CODES = new Set(['XX', 'T1']);

export const isCountryCode = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[A-Z]{2}$/.test(value) &&
  !PLACEHOLDER_CODES.has(value);

/** `"tr-TR"` → `"TR"`, `"zh-Hant-TW"` → `"TW"`, `"en"` → `null`. */
export function regionOfLocale(locale: string): string | null {
  try {
    const { region } = new Intl.Locale(locale.trim());
    return isCountryCode(region) ? region : null;
  } catch {
    return null; // Not a well-formed BCP 47 tag
  }
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getCountryName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Browser-only: remembers an explicit choice so the server can honour it. */
export function saveCountryChoice(code: string): void {
  document.cookie = [
    `${COUNTRY_COOKIE}=${encodeURIComponent(code)}`,
    'path=/',
    `max-age=${ONE_YEAR_IN_SECONDS}`,
    'samesite=lax',
  ].join('; ');
}
