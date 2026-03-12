'use client';

import * as React from 'react';
import Image from 'next/image';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

interface CountryData {
  link?: string;
  flatrate?: Provider[];
  buy?: Provider[];
  rent?: Provider[];
  ads?: Provider[];
  [key: string]: Provider[] | string | undefined;
}

interface MovieWatchProvidersProps {
  watchProviders: Record<string, CountryData>;
}

const countryNames: Record<string, string> = {
  TR: 'Türkiye',
  US: 'United States',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  BE: 'Belgium',
  AT: 'Austria',
  CH: 'Switzerland',
  PL: 'Poland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  JP: 'Japan',
  KR: 'South Korea',
  IN: 'India',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  ZA: 'South Africa',
  EG: 'Egypt',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  IL: 'Israel',
};

export function MovieWatchProviders({
  watchProviders,
}: MovieWatchProvidersProps) {
  // Organize providers by type for each country
  const organizedData = React.useMemo(() => {
    const countries = Object.entries(watchProviders)
      .map(([code, data]) => ({
        code,
        name: countryNames[code] || code,
        link: data.link,
        streaming: data.flatrate || [],
        buy: data.buy || [],
        rent: data.rent || [],
        ads: data.ads || [],
      }))
      .filter(
        (country) =>
          country.streaming.length > 0 ||
          country.buy.length > 0 ||
          country.rent.length > 0 ||
          country.ads.length > 0
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  }, [watchProviders]);

  if (organizedData.length === 0) {
    return null;
  }

  return (
    <div className="py-16">
      <div className="mb-16 px-8 md:px-16 lg:px-24">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          Nerede İzlenir?
        </h2>
      </div>

      <div className="space-y-12">
        {organizedData.map((country, index) => {
          const isOdd = index % 2 === 0;

          return (
            <div
              key={country.code}
              className={`space-y-8 py-8 px-8 md:px-16 lg:px-24 transition-colors ${
                isOdd
                  ? 'bg-zinc-900/30'
                  : 'bg-transparent'
              }`}
            >
              {/* Country Header - Minimal */}
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/30">
                <h3
                  className={`text-xl md:text-2xl font-medium ${
                    isOdd ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  {country.name}
                </h3>
              </div>

            {/* Streaming Services - Flat Design */}
            {country.streaming.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Streaming
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {country.streaming.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-row items-center gap-2 transition-opacity duration-300 hover:opacity-80"
                    >
                      {provider.logo_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={120}
                          height={48}
                          className="h-12 w-auto object-contain"
                          style={{ maxHeight: '48px' }}
                        />
                      ) : (
                        <div className="h-12 px-4 flex items-center justify-center bg-zinc-800 rounded text-white text-sm font-medium">
                          {provider.provider_name}
                        </div>
                      )}
                      <span className="text-sm text-zinc-300 leading-tight">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buy Options */}
            {country.buy.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Satın Al
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {country.buy.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-row items-center gap-2 transition-opacity duration-300 hover:opacity-80"
                    >
                      {provider.logo_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={120}
                          height={48}
                          className="h-12 w-auto object-contain"
                          style={{ maxHeight: '48px' }}
                        />
                      ) : (
                        <div className="h-12 px-4 flex items-center justify-center bg-zinc-800 rounded text-white text-sm font-medium">
                          {provider.provider_name}
                        </div>
                      )}
                      <span className="text-sm text-zinc-300 leading-tight">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rent Options */}
            {country.rent.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Kirala
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {country.rent.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-row items-center gap-2 transition-opacity duration-300 hover:opacity-80"
                    >
                      {provider.logo_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={120}
                          height={48}
                          className="h-12 w-auto object-contain"
                          style={{ maxHeight: '48px' }}
                        />
                      ) : (
                        <div className="h-12 px-4 flex items-center justify-center bg-zinc-800 rounded text-white text-sm font-medium">
                          {provider.provider_name}
                        </div>
                      )}
                      <span className="text-sm text-zinc-300 leading-tight">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free with Ads */}
            {country.ads.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
                  Reklamlı Ücretsiz
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {country.ads.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-row items-center gap-2 transition-opacity duration-300 hover:opacity-80"
                    >
                      {provider.logo_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                          alt={provider.provider_name}
                          width={120}
                          height={48}
                          className="h-12 w-auto object-contain"
                          style={{ maxHeight: '48px' }}
                        />
                      ) : (
                        <div className="h-12 px-4 flex items-center justify-center bg-zinc-800 rounded text-white text-sm font-medium">
                          {provider.provider_name}
                        </div>
                      )}
                      <span className="text-sm text-zinc-300 leading-tight">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
