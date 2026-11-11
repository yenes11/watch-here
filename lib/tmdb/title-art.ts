import type { ImageAsset, ImageCollection, LogoImage, TitleArt } from './types';

export const EMPTY_TITLE_ART: TitleArt = Object.freeze({
  logo: null,
  textlessPoster: null,
});

const isRaster = (image: ImageAsset) => !image.file_path.endsWith('.svg');

/**
 * Picks the best title logo: English first, then language-neutral, keeping
 * TMDB's vote order. SVGs are skipped because next/image doesn't optimize them.
 */
export function pickTitleLogo(logos: ImageAsset[] = []): LogoImage | null {
  const rasters = logos.filter(isRaster);
  const logo =
    rasters.find((image) => image.iso_639_1 === 'en') ??
    rasters.find((image) => image.iso_639_1 === null);

  if (!logo) return null;

  const { file_path, width, height } = logo;
  return { file_path, width, height };
}

export function toTitleArt({ logos, posters = [] }: ImageCollection): TitleArt {
  const textlessPoster = posters.find((image) => image.iso_639_1 === null);
  return {
    logo: pickTitleLogo(logos),
    textlessPoster: textlessPoster?.file_path ?? null,
  };
}
