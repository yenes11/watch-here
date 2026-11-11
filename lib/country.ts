import { cookies, headers } from 'next/headers';
import {
  COUNTRY_COOKIE,
  isCountryCode,
  regionOfLocale,
  type CountryDetection,
} from './country-code';

/** Geo-IP headers set by common hosting platforms / CDNs. */
const GEO_IP_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'cloudfront-viewer-country',
  'x-country-code',
] as const;

const UNDETECTED: CountryDetection = Object.freeze({ code: null, source: null });

/** `"tr-TR,tr;q=0.9,en-US;q=0.8"` → `"TR"` (first entry that has a region). */
function regionFromAcceptLanguage(header: string): string | null {
  for (const entry of header.split(',')) {
    const [locale = ''] = entry.split(';');
    const region = regionOfLocale(locale);
    if (region) return region;
  }
  return null;
}

/**
 * Best-effort detection of the viewer's country, in priority order:
 *  1. An explicit choice the viewer made earlier (cookie)
 *  2. Geo-IP headers set by the hosting platform / CDN
 *  3. The region part of the browser's Accept-Language header
 */
export async function getViewerCountry(): Promise<CountryDetection> {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);

  const saved = cookieStore.get(COUNTRY_COOKIE)?.value.toUpperCase();
  if (isCountryCode(saved)) return { code: saved, source: 'saved' };

  for (const name of GEO_IP_HEADERS) {
    const code = requestHeaders.get(name)?.toUpperCase();
    if (isCountryCode(code)) return { code, source: 'ip' };
  }

  const fromLanguage = regionFromAcceptLanguage(
    requestHeaders.get('accept-language') ?? ''
  );
  if (fromLanguage) return { code: fromLanguage, source: 'language' };

  return UNDETECTED;
}
