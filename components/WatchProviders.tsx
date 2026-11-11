'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Search, X } from 'lucide-react';
import {
  getCountryName,
  regionOfLocale,
  saveCountryChoice,
  type CountryDetection,
} from '@/lib/country-code';
import { normalizeForSearch } from '@/lib/text';
import { tmdbImage } from '@/lib/tmdb/image';
import type { WatchProvider, WatchProvidersByCountry } from '@/lib/tmdb/types';
import { cn } from '@/lib/utils';
import {
  PROVIDER_CATEGORIES,
  matchesCountryOrProvider,
  toCountryAvailability,
  type CountryAvailability,
} from '@/lib/watch-providers';
import { CountryCombobox, type CountryOption } from './CountryCombobox';

const SECTION_ID = 'watch-providers';
const COLLAPSED_COUNTRY_COUNT = 12;

interface WatchProvidersProps {
  byCountry: WatchProvidersByCountry;
  /** Detected on the server from the cookie, geo-IP or Accept-Language. */
  detectedCountry: CountryDetection;
}

export function WatchProviders({ byCountry, detectedCountry }: WatchProvidersProps) {
  const countries = React.useMemo(() => toCountryAvailability(byCountry), [byCountry]);

  if (countries.length === 0) {
    return (
      <section id={SECTION_ID} className="scroll-mt-24">
        <h2 className="text-lg font-semibold text-white">Where to watch</h2>
        <p className="mt-2 text-zinc-400">
          No streaming information is available for this title.
        </p>
      </section>
    );
  }

  return <WatchProvidersBrowser countries={countries} detectedCountry={detectedCountry} />;
}

/** The server couldn't tell, so fall back to the browser's own locale. */
const getBrowserRegion = (): string | null =>
  navigator.languages.map(regionOfLocale).find((region) => region !== null) ?? null;

function useSelectedCountry(detected: CountryDetection) {
  const [selected, setSelected] = React.useState(detected.code);
  const [isManual, setIsManual] = React.useState(detected.source === 'saved');

  React.useEffect(() => {
    if (selected) return;
    const region = getBrowserRegion();
    if (region) setSelected(region);
  }, [selected]);

  const choose = (code: string) => {
    setSelected(code);
    setIsManual(true);
    saveCountryChoice(code);
  };

  return { selected, isManual, choose };
}

function toCountryOptions(
  countries: CountryAvailability[],
  selected: string | null
): CountryOption[] {
  const options = countries.map(({ code, name, providerCount }) => ({
    code,
    name,
    count: providerCount,
  }));
  // Keep the viewer's own country pickable even where nothing is available.
  if (selected && !options.some((option) => option.code === selected)) {
    options.unshift({ code: selected, name: getCountryName(selected), count: 0 });
  }
  return options;
}

function WatchProvidersBrowser({
  countries,
  detectedCountry,
}: {
  countries: CountryAvailability[];
  detectedCountry: CountryDetection;
}) {
  const { selected, isManual, choose } = useSelectedCountry(detectedCountry);
  const current = countries.find((country) => country.code === selected);
  const others = countries.filter((country) => country !== current);
  const options = React.useMemo(
    () => toCountryOptions(countries, selected),
    [countries, selected]
  );

  const chooseAndReveal = (code: string) => {
    choose(code);
    document.getElementById(SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id={SECTION_ID} className="scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Where to watch</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {describeSelection(selected, isManual)}
          </p>
        </div>
        <CountryCombobox
          options={options}
          value={selected}
          onChange={choose}
          className="sm:w-64"
        />
      </div>

      {current ? (
        <SelectedCountry country={current} />
      ) : (
        <p className="py-6 text-zinc-300">
          {selected
            ? `Not currently available to stream in ${getCountryName(selected)}.`
            : 'Choose a country to see where to watch.'}{' '}
          <span className="text-zinc-500">Available in {countries.length} countries.</span>
        </p>
      )}

      <OtherCountries countries={others} onSelect={chooseAndReveal} />

      <p className="mt-10 text-xs text-zinc-600">Streaming data provided by JustWatch.</p>
    </section>
  );
}

function describeSelection(selected: string | null, isManual: boolean): string {
  if (!selected) return 'Choose a country';
  return isManual ? 'Based on the country you chose' : 'Detected from your location';
}

/** Categories that actually have platforms in this country. */
const availableCategories = (country: CountryAvailability) =>
  PROVIDER_CATEGORIES.filter(({ key }) => country.providers[key].length > 0);

function SelectedCountry({ country }: { country: CountryAvailability }) {
  return (
    <>
      <dl>
        {availableCategories(country).map(({ key, label }) => (
          <div
            key={key}
            className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-2 sm:gap-4 py-4 border-b border-zinc-800/70"
          >
            <dt className="text-sm text-zinc-400 sm:pt-3.5">{label}</dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-3">
              {country.providers[key].map((provider) => (
                <a
                  key={provider.provider_id}
                  href={country.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 min-h-12"
                >
                  <ProviderLogo provider={provider} className="size-12" />
                  <span className="text-sm text-zinc-200 group-hover:text-white group-hover:underline underline-offset-4">
                    {provider.provider_name}
                  </span>
                </a>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      {country.link && (
        <a
          href={country.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-4 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Prices and links
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      )}
    </>
  );
}

function OtherCountries({
  countries,
  onSelect,
}: {
  countries: CountryAvailability[];
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);

  const matching = React.useMemo(() => {
    const needle = normalizeForSearch(query.trim());
    return needle
      ? countries.filter((country) => matchesCountryOrProvider(country, needle))
      : countries;
  }, [countries, query]);

  const isSearching = query.length > 0;
  const isCollapsed = !isSearching && !isExpanded;
  const visible = isCollapsed ? matching.slice(0, COLLAPSED_COUNTRY_COUNT) : matching;

  return (
    <div className="mt-14">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold text-white">
          Other countries{' '}
          <span className="font-normal text-zinc-500 tabular-nums">{countries.length}</span>
        </h3>
        <SearchField value={query} onChange={setQuery} />
      </div>

      {matching.length === 0 ? (
        <p className="py-10 text-sm text-zinc-500">No results for “{query}”.</p>
      ) : (
        <ul>
          {visible.map((country) => (
            <OtherCountryRow key={country.code} country={country} onSelect={onSelect} />
          ))}
        </ul>
      )}

      {isCollapsed && matching.length > COLLAPSED_COUNTRY_COUNT && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-4 h-10 px-4 rounded-md border border-zinc-700 text-sm text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors"
        >
          Show all ({matching.length})
        </button>
      )}
    </div>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative sm:w-64">
      <Search
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500"
      />
      <input
        type="search"
        placeholder="Country or platform…"
        aria-label="Search countries or platforms"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-900 pl-9 pr-9 text-base sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded text-zinc-500 hover:text-white"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

function OtherCountryRow({
  country,
  onSelect,
}: {
  country: CountryAvailability;
  onSelect: (code: string) => void;
}) {
  return (
    <li className="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-2 md:gap-4 py-3.5 border-b border-zinc-800/70">
      <button
        type="button"
        onClick={() => onSelect(country.code)}
        title="Select this country"
        className="group flex items-center gap-2.5 self-start text-left text-sm text-zinc-200 hover:text-white md:pt-1"
      >
        <span className="w-6 font-mono text-xs text-zinc-500">{country.code}</span>
        <span className="group-hover:underline underline-offset-4">{country.name}</span>
      </button>
      <div className="space-y-1.5 pl-8.5 md:pl-0">
        {availableCategories(country).map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[4.5rem_1fr] items-start gap-2">
            <span className="text-xs text-zinc-500 leading-8">{label}</span>
            <div className="flex flex-wrap gap-2">
              {country.providers[key].map((provider) => (
                <ProviderLogo
                  key={provider.provider_id}
                  provider={provider}
                  className="size-10"
                  title={provider.provider_name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </li>
  );
}

interface ProviderLogoProps {
  provider: WatchProvider;
  className?: string;
  /** Set when the logo stands alone; omit when a visible name sits next to it. */
  title?: string;
}

function ProviderLogo({ provider, className, title }: ProviderLogoProps) {
  if (!provider.logo_path) {
    return (
      <span
        title={title}
        className={cn(
          'rounded-md bg-zinc-800 shrink-0 inline-flex items-center justify-center text-[10px] font-semibold text-zinc-300',
          className
        )}
      >
        {provider.provider_name.slice(0, 2)}
      </span>
    );
  }

  return (
    <Image
      src={tmdbImage(provider.logo_path, 'w92')}
      alt={title ?? ''}
      title={title}
      width={92}
      height={92}
      className={cn('rounded-md object-cover shrink-0', className)}
    />
  );
}
