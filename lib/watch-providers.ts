import { getCountryName } from './country-code';
import { normalizeForSearch } from './text';
import type { WatchProvider, WatchProvidersByCountry } from './tmdb/types';

/** Display order of the ways a title can be watched. Keys are TMDB's. */
export const PROVIDER_CATEGORIES = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'With ads' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
] as const;

export type ProviderCategory = (typeof PROVIDER_CATEGORIES)[number]['key'];

export interface CountryAvailability {
  code: string;
  name: string;
  link?: string;
  providers: Record<ProviderCategory, WatchProvider[]>;
  /** Distinct platforms across all categories. */
  providerCount: number;
}

const countDistinctProviders = (
  providers: CountryAvailability['providers']
): number =>
  new Set(
    Object.values(providers).flatMap((list) =>
      list.map((provider) => provider.provider_id)
    )
  ).size;

/** Countries that have at least one platform, sorted by name. */
export function toCountryAvailability(
  byCountry: WatchProvidersByCountry
): CountryAvailability[] {
  return Object.entries(byCountry)
    .map(([code, data]): CountryAvailability => {
      const providers = Object.fromEntries(
        PROVIDER_CATEGORIES.map(({ key }) => [key, data[key] ?? []])
      ) as CountryAvailability['providers'];

      return {
        code,
        name: getCountryName(code),
        link: data.link,
        providers,
        providerCount: countDistinctProviders(providers),
      };
    })
    .filter((country) => country.providerCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/** Matches a country by its name or by any platform available there. */
export function matchesCountryOrProvider(
  country: CountryAvailability,
  normalizedQuery: string
): boolean {
  const matches = (text: string) =>
    normalizeForSearch(text).includes(normalizedQuery);

  return (
    matches(country.name) ||
    Object.values(country.providers).some((list) =>
      list.some((provider) => matches(provider.provider_name))
    )
  );
}
